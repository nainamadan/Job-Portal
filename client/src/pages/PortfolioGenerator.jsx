import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth, useClerk } from "@clerk/clerk-react";
import axios from "axios";
import { FiCheck, FiCode, FiDownload, FiExternalLink, FiFileText, FiGithub, FiImage, FiLayout, FiMonitor, FiSave, FiSmartphone, FiUpload, FiUser, FiX } from "react-icons/fi";
import { AppContext } from "../context/AppContext";
import { readResume } from "../utils/resumeAutofill";
import { EMPTY_PORTFOLIO, buildPortfolioHtml, mergeResumeIntoPortfolio, parseGithubUsername, portfolioFilename, safePortfolioUrl, splitPortfolioSkills } from "../utils/portfolioGenerator";
import { preparePortfolioPhoto } from "../utils/portfolioPhoto";
import { portfolioServiceMessage, readPortfolioDraftResponse } from "../utils/portfolioApi";
import PortfolioProfileFields from "../components/portfolio/PortfolioProfileFields";
import PortfolioProjectEditor from "../components/portfolio/PortfolioProjectEditor";
import "../styles/portfolio-generator.css";

const steps = [{ label: "Resume", icon: FiFileText }, { label: "GitHub", icon: FiGithub }, { label: "Review & style", icon: FiLayout }, { label: "Photo & generate", icon: FiImage }];

const generationIssue = (draft) => {
  if (!draft.name.trim() || !draft.headline.trim()) return "Add your name and professional headline in Resume or Review & style.";
  if (draft.skills.length > 40) return "Keep up to 40 skills in Review & style.";
  if (draft.skills.some((skill) => skill.length > 60)) return "Each skill can contain up to 60 characters. Review your skills before generating.";
  if (draft.email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(draft.email)) return "Review your contact email before generating.";
  for (const [name, url] of [["GitHub", draft.github], ["LinkedIn", draft.linkedin], ["Website", draft.website], ...draft.projects.flatMap((project) => [[`${project.title} source`, project.sourceUrl], [`${project.title} demo`, project.demoUrl]])]) {
    if (url && !safePortfolioUrl(url)) return `${name} needs a public HTTPS link. Review it before generating.`;
  }
  if (draft.projects.some((project) => !project.title.trim())) return "Give every featured project a title, or remove the empty project.";
  return "";
};

function PortfolioWorkspace({ userId, getToken }) {
  const { backendUrl } = useContext(AppContext);
  const [draft, setDraft] = useState(() => ({ ...EMPTY_PORTFOLIO }));
  const [revision, setRevision] = useState(0);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [pendingDraft, setPendingDraft] = useState(null);
  const [reload, setReload] = useState(0);
  const [activity, setActivity] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState("");
  const [githubInput, setGithubInput] = useState("");
  const [githubResult, setGithubResult] = useState(null);
  const [generated, setGenerated] = useState(false);
  const [previewMode, setPreviewMode] = useState("fit");
  const [skillsText, setSkillsText] = useState("");
  const mounted = useRef(true);
  const draftDirty = useRef(false);
  const operation = useRef(false);
  const resumeInput = useRef(null);
  const photoInput = useRef(null);
  const headingRef = useRef(null);
  const errorRef = useRef(null);
  const api = `${backendUrl}/api/portfolios`;
  const html = useMemo(() => buildPortfolioHtml(draft), [draft]);
  const busy = !!activity || loading;

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true); setLoadError("");
      try {
        const token = await getToken();
        if (!token) throw new Error("Please sign in again to open your draft.");
        const { data } = await axios.get(`${api}/mine`, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal, timeout: 15000 });
        if (controller.signal.aborted) return;
        const content = readPortfolioDraftResponse(data);
        if (draftDirty.current && content) { setPendingDraft(content); return; }
        setRevision(content?.revision || 0);
        if (draftDirty.current) { setNotice("Reconnected. Your current work is intact and can now be saved."); return; }
        if (!content) return;
        setDraft(content); setSkillsText(content.skills.join(", "));
        setGithubInput(content.github || ""); setSavedAt(content.updatedAt || "");
        setNotice("Your private saved draft is ready to continue.");
      } catch (err) { if (!controller.signal.aborted) setLoadError(portfolioServiceMessage(err, "load")); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    };
    load();
    return () => controller.abort();
  }, [api, getToken, reload, userId]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = (changes) => {
    draftDirty.current = true;
    setDraft((previous) => ({ ...previous, ...changes })); setDirty(true); setGenerated(false);
  };
  const chooseRecoveredDraft = (useSaved) => {
    if (!pendingDraft) return;
    setRevision(pendingDraft.revision);
    if (useSaved) {
      setDraft(pendingDraft); setSkillsText(pendingDraft.skills.join(", "));
      setGithubInput(pendingDraft.github || ""); setSavedAt(pendingDraft.updatedAt || "");
      setDirty(false); draftDirty.current = false; setGenerated(false); setStep(0);
      setNotice("Your saved draft is open.");
    } else {
      setNotice("Your current work has been kept. Saving it will replace the previous saved draft.");
    }
    setPendingDraft(null);
  };
  const run = async (name, work) => {
    if (operation.current) return;
    operation.current = true; setActivity(name); setError(""); setNotice("");
    try { await work(); }
    catch (err) { if (mounted.current) setError(portfolioServiceMessage(err, name)); }
    finally { operation.current = false; if (mounted.current) setActivity(""); }
  };
  const importResume = async (event) => {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Choose a resume under 5MB."); return; }
    await run("resume", async () => {
      const result = await readResume(backendUrl, file);
      if (!mounted.current) return;
      const next = mergeResumeIntoPortfolio(draft, result.details || {});
      update(next); setSkillsText(next.skills.join(", ")); setGithubInput((previous) => previous || next.github);
      setNotice(`Resume read. Empty fields were filled where possible. Review the details; ${result.filled?.length ? "anything missing can be entered manually." : "this file did not contain enough structured details to fill the form."}`);
    });
  };
  const importGithub = async () => {
    await run("github", async () => {
      const username = parseGithubUsername(githubInput);
      const token = await getToken();
      if (!token) throw new Error("Please sign in again to import projects.");
      const { data } = await axios.get(`${api}/github/${encodeURIComponent(username)}`, { headers: { Authorization: `Bearer ${token}` }, timeout: 20000 });
      if (!mounted.current) return;
      setGithubResult(data);
      update({ github: data.profile.github, ...(!draft.name && data.profile.name ? { name: data.profile.name } : {}), ...(!draft.summary && data.profile.summary ? { summary: data.profile.summary } : {}) });
      setNotice(data.projects.length ? `Found ${data.projects.length} projects. Select the ones you want to feature.` : "No active, original public repositories were found among this account’s 100 most recently pushed repositories. You can add projects manually in the next step.");
    });
  };
  const toggleProject = (project) => {
    const selected = draft.projects.some((item) => item.id === project.id);
    if (!selected && draft.projects.length >= 6) { setError("Choose up to 6 featured projects. Remove one before selecting another."); return; }
    setError(""); update({ projects: selected ? draft.projects.filter((item) => item.id !== project.id) : [...draft.projects, project] });
  };
  const importPhoto = async (event) => {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!file) return;
    await run("photo", async () => {
      const photo = await preparePortfolioPhoto(file);
      if (!mounted.current) return;
      update({ photo }); setNotice("Your photo is ready. Generate your portfolio when you’re happy with the preview.");
    });
  };
  const save = () => run("save", async () => {
    const token = await getToken();
    if (!token) throw new Error("Please sign in again to save your draft.");
    const { data } = await axios.put(`${api}/mine`, { ...draft, revision }, { headers: { Authorization: `Bearer ${token}` }, timeout: 20000 });
    if (!mounted.current) return;
    const saved = readPortfolioDraftResponse(data);
    if (!saved) throw new Error("The server did not confirm your saved draft. Your current work has been kept.");
    setRevision(saved.revision); setSavedAt(saved.updatedAt); setDirty(false); draftDirty.current = false; setNotice("Private draft saved to your account.");
  });
  const goTo = (index) => { setStep(index); setError(""); requestAnimationFrame(() => headingRef.current?.focus()); };
  const next = (event) => {
    event.preventDefault();
    if (busy) return;
    if (step < 3) { goTo(step + 1); return; }
    const issue = generationIssue(draft);
    if (issue) { setError(issue); return; }
    setError(""); setGenerated(true); setNotice("Your portfolio website is ready. Preview it, save your draft, or download the complete website.");
  };
  const exportHtml = (download) => {
    const issue = generationIssue(draft);
    if (issue) { setError(issue); return; }
    const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
    if (download) {
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = portfolioFilename(draft.name);
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
    } else { window.open(url, "_blank", "noopener,noreferrer"); }
    window.setTimeout(() => URL.revokeObjectURL(url), download ? 1000 : 60000);
  };

  return <main className="pg-page"><div className="pg-shell">
    <header className="pg-header"><div><span className="pg-eyebrow"><FiLayout />AUTO PORTFOLIO GENERATOR</span><h1>Your experience.<br /><span>A website of your own.</span></h1><p>Bring your resume and GitHub projects together. Review your story, add a photo, and create a portfolio worth sharing.</p></div><div className="pg-header-actions"><button type="button" className="pg-button pg-secondary" onClick={save} disabled={busy || !!loadError || !!pendingDraft}><FiSave />{activity === "save" ? "Saving…" : "Save draft"}</button><span className="pg-save-status">{loading ? "Opening your draft…" : loadError ? "Draft saving unavailable" : pendingDraft ? "Choose which draft to keep" : dirty ? "Unsaved changes" : savedAt ? "Saved privately to your account" : "Only you can see your draft"}</span></div></header>
    {loadError && <div className="pg-alert pg-error" role="alert"><span>{loadError}</span><button type="button" onClick={() => setReload((value) => value + 1)}>Try again</button></div>}
    {pendingDraft && <div className="pg-recovery-choice" role="status"><p>Your saved draft is available again. Opening it replaces your current unsaved changes. Keep your current work if you prefer to save this version instead.</p><div><button type="button" className="pg-button pg-secondary" onClick={() => chooseRecoveredDraft(true)}>Open saved draft</button><button type="button" className="pg-button pg-primary" onClick={() => chooseRecoveredDraft(false)}>Keep current work</button></div></div>}
    {error && <div ref={errorRef} tabIndex={-1} className="pg-alert pg-error" role="alert">{error}<button type="button" onClick={() => setError("")} aria-label="Dismiss error"><FiX /></button></div>}
    {notice && <div className="pg-alert pg-success" role="status"><FiCheck />{notice}</div>}
    <div className="pg-workspace">
      <section className="pg-builder" aria-label="Portfolio builder" aria-busy={busy}>
        <nav className="pg-stepper" aria-label="Portfolio steps">{steps.map(({ label, icon: Icon }, index) => <button type="button" key={label} disabled={busy} aria-current={step === index ? "step" : undefined} onClick={() => goTo(index)}><span><Icon /></span><small>{label}</small></button>)}</nav>
        <form onSubmit={next}>
          <div className="pg-step-content">
            <h2 tabIndex={-1} ref={headingRef}>{["Start with your resume", "Choose the work you’re proud of", "Make it sound like you", "Add the finishing touch"][step]}</h2>
            <p className="pg-step-description">{["Import your details in one go, or enter them yourself. You can review everything before generating.", "Import public GitHub repositories, then choose up to six to feature. This step is optional.", "Edit your details, projects and contact information. Leave out anything you don’t want on your website.", "Add a profile image here, or keep your initials. Your photo is optional."][step]}</p>
            <fieldset disabled={busy}>
              {step === 0 && <>
                <div className="pg-upload"><FiFileText /><strong>Turn your resume into a starting point</strong><p>PDF, DOCX or TXT · up to 5MB</p><input ref={resumeInput} type="file" accept=".pdf,.docx,.txt" onChange={importResume} hidden aria-label="Upload resume" /><button type="button" className="pg-button pg-primary" onClick={() => resumeInput.current?.click()}><FiUpload />{activity === "resume" ? "Reading resume…" : "Import resume"}</button><small>The original file is read and discarded. Only the details you choose to save become part of your draft.</small></div>
                <div className="pg-divider"><span>or start with the basics</span></div><PortfolioProfileFields draft={draft} update={update} />
              </>}
              {step === 1 && <>
                <label>GitHub username or profile URL<div className="pg-import-row"><input value={githubInput} onChange={(event) => setGithubInput(event.target.value)} maxLength={150} placeholder="username or https://github.com/username" autoComplete="off" /><button type="button" className="pg-button pg-primary" onClick={importGithub} disabled={!githubInput.trim()}><FiGithub />{activity === "github" ? "Importing…" : "Import projects"}</button></div></label>
                <p className="pg-note">Public repositories only. Forks and archived projects are excluded. The importer checks the 100 most recently pushed repositories; descriptions come from GitHub and can be edited next. Select work you contributed to and explain your role in Review & style.</p>
                <div className="pg-subheading"><h3>Featured selection</h3><span>{draft.projects.length} / 6 projects</span></div>
                {githubResult?.projects.length ? <div className="pg-repo-list">{githubResult.projects.map((project) => <label className="pg-repo" key={project.id}><input type="checkbox" checked={draft.projects.some((item) => item.id === project.id)} onChange={() => toggleProject(project)} /><div><strong>{project.title}</strong><p>{project.description || "No description yet. Add one in Review & style."}</p>{project.language && <small><FiCode />{project.language}</small>}</div></label>)}</div> : <div className="pg-empty"><FiGithub /><p>{draft.projects.length ? "Your saved featured projects are selected. Import an account to choose more, or continue to edit them." : "Import your profile to pick projects, or continue and add them manually."}</p></div>}
              </>}
              {step === 2 && <>
                <div className="pg-style-controls"><div><h3>Choose your look</h3><div className="pg-theme-options">{[{ value: "studio", label: "Studio", text: "Light & minimal" }, { value: "midnight", label: "Midnight", text: "Dark & focused" }].map((theme) => <button type="button" key={theme.value} className={`pg-theme-option pg-theme-${theme.value}`} aria-pressed={draft.theme === theme.value} onClick={() => update({ theme: theme.value })}><FiLayout /><strong>{theme.label}</strong><small>{theme.text}</small>{draft.theme === theme.value && <FiCheck />}</button>)}</div></div><div><h3>Accent colour</h3><div className="pg-accents">{["indigo", "teal", "rose"].map((accent) => <button type="button" key={accent} className={`pg-accent pg-accent-${accent}`} aria-label={`${accent} accent`} aria-pressed={draft.accent === accent} onClick={() => update({ accent })}>{draft.accent === accent && <FiCheck />}</button>)}</div></div></div>
                <PortfolioProfileFields draft={draft} update={update} full />
                <label>Skills<input value={skillsText} onChange={(event) => { setSkillsText(event.target.value); update({ skills: splitPortfolioSkills(event.target.value) }); }} maxLength={2440} placeholder="React, JavaScript, Python" /><small>Separate up to 40 skills with commas.</small></label>
                <PortfolioProjectEditor projects={draft.projects} update={(projects) => update({ projects })} />
              </>}
              {step === 3 && <>
                <div className="pg-photo-area">{draft.photo ? <img src={draft.photo} alt="Your portfolio profile photo" /> : <div className="pg-photo-placeholder"><FiUser /></div>}<div><h3>Your profile photo</h3><p>JPEG, PNG or WebP · up to 5MB</p><input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={importPhoto} hidden aria-label="Upload profile photo" /><div className="pg-photo-actions"><button type="button" className="pg-button pg-secondary" onClick={() => photoInput.current?.click()}><FiUpload />{activity === "photo" ? "Preparing photo…" : draft.photo ? "Replace image" : "Add image"}</button>{draft.photo && <button type="button" className="pg-button pg-text-button" onClick={() => update({ photo: "" })}>Remove</button>}</div></div></div>
                <div className="pg-final-summary"><h3>Ready for your portfolio</h3><ul><li><FiCheck />{draft.name || "Your name still needs to be added"}</li><li><FiCheck />{draft.headline || "Your professional headline still needs to be added"}</li><li><FiCheck />{draft.projects.length} featured projects · {draft.skills.length} skills</li><li><FiCheck />{draft.photo ? "Profile photo included" : "Initials used in place of a photo"}</li></ul></div>
                <p className="pg-note">Check your contact details and project links before sharing. Your download includes the image and styling in one HTML file; you can open it in a browser or host it yourself.</p>
                {generated && <div className="pg-ready"><FiCheck /><h3>Your website is ready.</h3><p>Download it to keep a complete copy. Save your draft if you want to edit it here later.</p><div><button type="button" className="pg-button pg-primary" onClick={() => exportHtml(true)}><FiDownload />Download website</button><button type="button" className="pg-button pg-secondary" onClick={() => exportHtml(false)}><FiExternalLink />Open preview</button></div></div>}
              </>}
            </fieldset>
          </div>
          <div className="pg-builder-footer"><button type="button" className="pg-button pg-secondary" disabled={busy || step === 0} onClick={() => goTo(step - 1)}>Back</button><button type="submit" className="pg-button pg-primary" disabled={busy}>{busy ? activity === "resume" ? "Reading resume…" : activity === "github" ? "Importing projects…" : activity === "photo" ? "Preparing photo…" : activity === "save" ? "Saving draft…" : "Opening draft…" : step === 3 ? "Generate portfolio" : step === 1 ? "Continue to review" : "Continue"}</button></div>
        </form>
      </section>
      <aside className="pg-preview-panel" aria-label="Live portfolio preview"><div className="pg-preview-toolbar"><div><span className="pg-preview-dot" />Live preview</div><div role="group" aria-label="Preview size"><button type="button" aria-label="Fit preview to width" aria-pressed={previewMode === "fit"} onClick={() => setPreviewMode("fit")}><FiMonitor /></button><button type="button" aria-label="Phone preview" aria-pressed={previewMode === "phone"} onClick={() => setPreviewMode("phone")}><FiSmartphone /></button></div></div><div className={`pg-preview-stage${previewMode === "phone" ? " pg-preview-phone" : ""}`}><iframe title="Your generated portfolio preview" srcDoc={html} sandbox="allow-popups allow-popups-to-escape-sandbox" referrerPolicy="no-referrer" /></div><p className="pg-preview-caption">Updates as you edit. Nothing is published automatically.</p></aside>
    </div>
  </div></main>;
}

export default function PortfolioGenerator() {
  const { isLoaded, userId, getToken } = useAuth();
  const { openSignIn } = useClerk();
  if (!isLoaded) return <main className="pg-page pg-empty" role="status">Opening Portfolio Generator…</main>;
  if (!userId) return <main className="pg-page"><div className="pg-shell pg-welcome"><span className="pg-eyebrow"><FiLayout />AUTO PORTFOLIO GENERATOR</span><h1>Your resume and projects.<br /><span>One personal website.</span></h1><p>Import your resume, choose GitHub projects, pick a look, and add your photo in the final step.</p><div className="pg-welcome-steps">{steps.map(({ label, icon: Icon }) => <div key={label}><Icon /><strong>{label}</strong></div>)}</div><button type="button" className="pg-button pg-primary" onClick={() => openSignIn()}>Sign in to create your portfolio</button><small>Your draft stays private. You choose when to download and share your website.</small></div></main>;
  return <PortfolioWorkspace key={userId} userId={userId} getToken={getToken} />;
}
