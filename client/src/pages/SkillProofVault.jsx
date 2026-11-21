import { useContext, useEffect, useRef, useState } from "react";
import { useAuth, useClerk } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiArrowRight, FiAward, FiCheck, FiCode, FiFolder, FiLayers, FiPlus, FiRefreshCw, FiSearch, FiShield, FiTrash2 } from "react-icons/fi";
import { AppContext } from "../context/AppContext";
import ProofCard from "../components/skill-proof/ProofCard";
import ProofEditor from "../components/skill-proof/ProofEditor";
import VaultDialog from "../components/skill-proof/VaultDialog";
import "../styles/skill-proof.css";

const messageFor = (error) => error.response?.data?.message || (!error.isAxiosError && error.message) || "The vault could not connect to the server. Please try again.";
const isApproved = (proof) => proof.reviews?.some((review) => review.status === "approved");

function VaultWorkspace({ userId, getToken }) {
  const { backendUrl } = useContext(AppContext);
  const { openSignIn } = useClerk();
  const [tab, setTab] = useState(userId ? "vault" : "challenges");
  const [proofs, setProofs] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(!!userId);
  const [challengesLoading, setChallengesLoading] = useState(true);
  const [error, setError] = useState("");
  const [challengeError, setChallengeError] = useState("");
  const [reload, setReload] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const mounted = useRef(true);
  const mutation = useRef(false);
  const api = `${backendUrl}/api/skill-proofs`;
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setChallengesLoading(true); setChallengeError("");
      try {
        const { data } = await axios.get(`${api}/challenges`, { signal: controller.signal });
        setChallenges(data.challenges);
      } catch (err) { if (!controller.signal.aborted) setChallengeError(messageFor(err)); }
      finally { if (!controller.signal.aborted) setChallengesLoading(false); }
    };
    load();
    return () => controller.abort();
  }, [api, reload]);

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    const load = async () => {
      setLoading(true); setError("");
      try {
        const token = await getToken();
        if (!token) throw new Error("Sign in again to open your vault.");
        const { data } = await axios.get(`${api}/mine`, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal });
        if (!controller.signal.aborted) setProofs(data.proofs);
      } catch (err) { if (!controller.signal.aborted) setError(messageFor(err)); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    };
    load();
    return () => controller.abort();
  }, [api, getToken, userId, reload]);

  const startProof = (challenge = null, proof = null) => {
    if (!userId) { openSignIn(); return; }
    setSaveError(""); setEditor({ challenge, proof });
  };
  const save = async (input) => {
    if (mutation.current) return;
    mutation.current = true; setSaving(true); setSaveError("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Your sign-in expired. Sign in again before saving.");
      const { data } = await axios({ method: editor.proof ? "patch" : "post", url: `${api}/mine${editor.proof ? `/${editor.proof._id}` : ""}`, data: input, headers: { Authorization: `Bearer ${token}` } });
      if (!mounted.current) return;
      setProofs((old) => [data.proof, ...old.filter((proof) => proof._id !== data.proof._id)]);
      setEditor(null); setTab("vault"); setSearch(""); setStatus("all");
      setReload((value) => value + 1);
      toast.success("Your skill proof is saved.");
    } catch (err) { if (mounted.current) setSaveError(messageFor(err)); }
    finally { mutation.current = false; if (mounted.current) setSaving(false); }
  };
  const remove = async () => {
    if (mutation.current) return;
    mutation.current = true; setSaving(true); setSaveError("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Your sign-in expired. Sign in again before deleting.");
      await axios.delete(`${api}/mine/${deleting._id}`, { data: { revision: deleting.revision }, headers: { Authorization: `Bearer ${token}` } });
      if (!mounted.current) return;
      setProofs((old) => old.filter((proof) => proof._id !== deleting._id)); setDeleting(null);
      setReload((value) => value + 1);
      toast.success("Skill proof deleted.");
    } catch (err) { if (mounted.current) setSaveError(messageFor(err)); }
    finally { mutation.current = false; if (mounted.current) setSaving(false); }
  };
  const refresh = () => { if (!saving) setReload((value) => value + 1); };
  const skills = new Set(proofs.flatMap((proof) => proof.skills.map((skill) => skill.toLowerCase())));
  const approvedCount = proofs.filter(isApproved).length;
  const filtered = proofs.filter((proof) => {
    const matchesSearch = `${proof.title} ${proof.skills.join(" ")}`.toLowerCase().includes(search.toLowerCase().trim());
    const matchesStatus = status === "all" || (status === "approved" && isApproved(proof)) || (status === "pending" && !proof.reviews.length) || (status === "needs_work" && proof.reviews.some((review) => review.status === "needs_work"));
    return matchesSearch && matchesStatus;
  });
  return (
    <main className="spv-page"><div className="spv-shell">
      <header className="spv-hero">
        <div><span className="spv-eyebrow"><FiShield /> SKILL PROOF VAULT</span><h1>Go beyond your resume.<br /><span>Show what you can build.</span></h1><p>Give your skills something to stand on. Collect real projects, explain your work, and let recruiters see the evidence.</p><button className="spv-button spv-primary" onClick={() => startProof()}><FiPlus />Add a skill proof</button></div>
        <aside className="spv-how"><span className="spv-eyebrow">FROM CLAIM TO EVIDENCE</span>{[{ icon: FiCode, title: "Build something real", text: "Take a practical challenge or bring your own project." }, { icon: FiLayers, title: "Make your work visible", text: "Add source code, a demo and your technical decisions." }, { icon: FiCheck, title: "Get a recruiter review", text: "Companies you apply to can review and approve your work." }].map(({ icon: Icon, title, text }, index) => <div key={title}><span className="spv-step-icon"><Icon /></span><div><small>0{index + 1}</small><strong>{title}</strong><p>{text}</p></div></div>)}</aside>
      </header>
      {userId && <div className="spv-stats" aria-label="Vault statistics"><div><FiFolder /><span><strong>{loading || error ? "—" : proofs.length}</strong> Proofs in your vault</span></div><div><FiCode /><span><strong>{loading || error ? "—" : skills.size}</strong> Skills backed by submissions</span></div><div><FiAward /><span><strong>{loading || error ? "—" : approvedCount}</strong> Recruiter-approved proofs</span></div></div>}
      <section className="spv-workspace" aria-label="Skill proofs and challenges">
        <div className="spv-workspace-bar"><div className="spv-tabs" role="group" aria-label="Choose vault view"><button aria-pressed={tab === "vault"} onClick={() => setTab("vault")}><FiFolder />My vault</button><button aria-pressed={tab === "challenges"} onClick={() => setTab("challenges")}><FiCode />Practical challenges</button></div><button className="spv-icon-button" onClick={refresh} disabled={loading || challengesLoading || saving} aria-label="Refresh vault and challenges"><FiRefreshCw /></button></div>
        {tab === "vault" ? <>
          <div className="spv-section-heading"><div><h2>Your work. Your evidence.</h2><p>A living portfolio recruiters can inspect alongside your applications.</p></div></div>
          {!userId ? <div className="spv-empty"><FiShield /><h3>Your skills deserve more than a bullet point.</h3><p>Sign in to build your private vault. Your submissions become visible to recruiters at companies you apply to.</p><button className="spv-button spv-primary" onClick={() => openSignIn()}>Sign in to open your vault <FiArrowRight /></button></div> : <>
            <div className="spv-filters"><label className="spv-search"><FiSearch /><input aria-label="Search proofs by title or skill" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search a project or skill…" /></label><select aria-label="Filter proofs by review status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All review statuses</option><option value="approved">Recruiter approved</option><option value="pending">Awaiting review</option><option value="needs_work">Improvements requested</option></select></div>
            {error ? <div className="spv-error" role="alert">{error}<button onClick={refresh}>Try again</button></div> : loading ? <div className="spv-empty" role="status">Loading your skill proofs…</div> : filtered.length ? <div className="spv-proof-grid">{filtered.map((proof) => <ProofCard proof={proof} key={proof._id}><button className="spv-button spv-secondary" onClick={() => startProof(null, proof)}>Edit proof</button><button className="spv-icon-button spv-delete" onClick={() => { setSaveError(""); setDeleting(proof); }} aria-label={`Delete ${proof.title}`}><FiTrash2 /></button></ProofCard>)}</div> : <div className="spv-empty"><FiCode /><h3>{proofs.length ? "No proofs match your filters." : "Your next project belongs here."}</h3><p>{proofs.length ? "Try another skill or review status." : "Start with a practical challenge or add a project you have already built."}</p><button className="spv-button spv-secondary" onClick={() => proofs.length ? (setSearch(""), setStatus("all")) : setTab("challenges")}>{proofs.length ? "Clear filters" : "Explore challenges"}<FiArrowRight /></button></div>}
          </>}
        </> : <>
          <div className="spv-section-heading"><div><h2>Small builds. Tangible skills.</h2><p>Choose a task, build it in your own environment, then submit your code and explanation.</p></div><span className="spv-catalog-label">PRACTICE → BUILD → PROVE</span></div>
          {challengeError ? <div className="spv-error" role="alert">{challengeError}<button onClick={refresh}>Try again</button></div> : challengesLoading ? <div className="spv-empty" role="status">Loading practical challenges…</div> : <div className="spv-challenge-grid">{challenges.map((challenge) => <article className="spv-challenge-card" key={challenge.id}><div className="spv-challenge-meta"><span className="spv-skill-label">{challenge.skill}</span><span>{challenge.level} · {challenge.duration}</span></div><h3>{challenge.title}</h3><p>{challenge.brief}</p><h4>What to demonstrate</h4><ul>{challenge.criteria.map((criterion) => <li key={criterion}><FiCheck />{criterion}</li>)}</ul><button className="spv-button spv-secondary" onClick={() => startProof(challenge)}>Build this proof <FiArrowRight /></button></article>)}</div>}
        </>}
        <div className="spv-footnote"><FiShield /><p>Evidence is reviewed by recruiters, with feedback tied to the submitted version. Links and self-reported work are not automatic certifications.</p></div>
      </section>
      {editor && <ProofEditor proof={editor.proof} challenge={editor.challenge} challenges={challenges} saving={saving} error={saveError} onSave={save} onClose={() => setEditor(null)} />}
      {deleting && <VaultDialog title="Delete this skill proof?" onClose={() => setDeleting(null)} busy={saving}><p>“{deleting.title}” and its reviews will be removed from your vault and recruiter views.</p>{saveError && <div className="spv-error" role="alert">{saveError}</div>}<div className="spv-form-actions"><button className="spv-button spv-secondary" onClick={() => setDeleting(null)} disabled={saving}>Keep proof</button><button className="spv-button spv-danger" onClick={remove} disabled={saving}>{saving ? "Deleting…" : "Delete proof"}</button></div></VaultDialog>}
    </div></main>
  );
}

export default function SkillProofVault() {
  const { isLoaded, userId, getToken } = useAuth();
  if (!isLoaded) return <main className="spv-page spv-empty" role="status">Loading your vault…</main>;
  return <VaultWorkspace key={userId || "guest"} userId={userId} getToken={getToken} />;
}
