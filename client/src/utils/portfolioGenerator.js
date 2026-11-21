export const EMPTY_PORTFOLIO = {
  name: "", headline: "", email: "", phone: "", location: "", summary: "", skills: [],
  github: "", linkedin: "", website: "", education: "", experience: "", certifications: "", resumeProjects: "",
  projects: [], photo: "", theme: "studio", accent: "indigo",
};

export const splitPortfolioSkills = (value) => [...new Set(String(value || "").split(/[,;|\n]/).map((skill) => skill.trim()).filter(Boolean))];
const normalizeLink = (value) => {
  if (!value) return "";
  const input = String(value).trim();
  return safePortfolioUrl(/^https?:\/\//i.test(input) ? input : `https://${input}`);
};

// Resume reading only fills empty fields, preserving the candidate's own edits.
export const mergeResumeIntoPortfolio = (current, details) => {
  const result = { ...current };
  for (const field of ["name", "email", "phone", "location", "summary", "experience", "certifications"]) {
    if (!result[field] && typeof details[field] === "string") result[field] = details[field];
  }
  for (const field of ["github", "linkedin"]) if (!result[field]) result[field] = normalizeLink(details[field]);
  if (!result.website) result.website = normalizeLink(details.portfolio);
  if (!result.skills.length) result.skills = splitPortfolioSkills(details.skills).slice(0, 40);
  if (!result.education) result.education = [details.degree, details.institution, details.graduationYear, details.grade].filter(Boolean).join(" · ");
  if (!result.resumeProjects) result.resumeProjects = typeof details.projects === "string" ? details.projects : "";
  return result;
};

export const parseGithubUsername = (value) => {
  let username = String(value || "").trim();
  if (/^(?:https?:\/\/)?(?:www\.)?github\.com\//i.test(username)) {
    const url = new URL(/^https?:\/\//i.test(username) ? username : `https://${username}`);
    if (!/^(www\.)?github\.com$/i.test(url.hostname) || url.username || url.password || url.search || url.hash) throw new Error("Use a GitHub profile URL or username.");
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length !== 1) throw new Error("Use your GitHub profile, rather than a repository URL.");
    username = parts[0];
  }
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username) || username.includes("--")) throw new Error("Enter a valid GitHub username or profile URL.");
  return username;
};

export const safePortfolioUrl = (value) => {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || !url.hostname.includes(".") ||
        /^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/i.test(url.hostname)) return "";
    return url.href;
  } catch { return ""; }
};

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const safePhoto = (value) => typeof value === "string" && value.length <= 700000 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value) ? value : "";

export const buildPortfolioHtml = (input) => {
  const data = { ...EMPTY_PORTFOLIO, ...input };
  const e = escapeHtml;
  const dark = data.theme === "midnight";
  const palette = { indigo: dark ? "#aaa5ff" : "#4338ca", teal: dark ? "#70e4ca" : "#087b68", rose: dark ? "#ffb3c3" : "#b72f55" };
  const accent = palette[data.accent] || palette.indigo;
  const projects = Array.isArray(data.projects) ? data.projects.slice(0, 6) : [];
  const skills = Array.isArray(data.skills) ? data.skills.slice(0, 40) : [];
  const link = (value, label) => safePortfolioUrl(value) ? `<a href="${e(safePortfolioUrl(value))}" target="_blank" rel="noopener noreferrer">${e(label)}</a>` : "";
  const social = [link(data.github, "GitHub"), link(data.linkedin, "LinkedIn"), link(data.website, "Website")].filter(Boolean).join("");
  const photo = safePhoto(data.photo);
  const initials = data.name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("") || "P";
  const sections = [
    ...(projects.length || data.resumeProjects ? [{ id: "projects", label: "Projects" }] : []),
    ...["experience", "education", "certifications"].filter((key) => data[key]).map((key) => ({ id: key, label: key[0].toUpperCase() + key.slice(1) })),
  ];
  const email = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.email) ? data.email : "";
  const phone = String(data.phone || "").replace(/[^\d+]/g, "");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'">
<title>${e(data.name || "My portfolio")} | ${e(data.headline || "Portfolio")}</title><meta name="description" content="${e(data.summary.slice(0, 250))}">
<style>
:root{color-scheme:${dark ? "dark" : "light"};--bg:${dark ? "#101725" : "#f7f8fc"};--panel:${dark ? "#172234" : "#fff"};--ink:${dark ? "#edf0fa" : "#172239"};--muted:${dark ? "#aebad0" : "#596980"};--line:${dark ? "#2e3d54" : "#dfe5ef"};--accent:${accent}}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;overflow-wrap:anywhere;background:var(--bg);color:var(--ink);font:16px/1.8 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{color:var(--accent);text-decoration:none;overflow-wrap:anywhere}a:hover{text-decoration:underline}a:focus-visible{outline:3px solid var(--accent);outline-offset:5px}h1,h2,h3,p{margin:0;overflow-wrap:anywhere}h1,h2,h3{line-height:1.2;letter-spacing:-.04em}button,a{touch-action:manipulation}.shell{max-width:1100px;margin:auto;padding:0 28px}header{padding:25px 0;border-bottom:1px solid var(--line)}nav{display:flex;align-items:center;justify-content:space-between;gap:20px}.brand{color:var(--ink);font-weight:750;font-size:18px;max-width:45%}.nav-links,.socials{display:flex;flex-wrap:wrap;gap:12px 22px}.nav-links a{font-size:14px;padding:5px 0}.hero{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:65px;align-items:center;padding:86px 0}.eyebrow{font-size:12px;text-transform:uppercase;letter-spacing:.16em;font-weight:700;color:var(--accent);margin-bottom:18px}h1{font-size:clamp(38px,5.7vw,68px);font-weight:800;margin-bottom:20px}.role{font-size:clamp(21px,3vw,31px);font-weight:500;line-height:1.45;color:var(--accent);margin-bottom:22px}.summary{color:var(--muted);white-space:pre-wrap}.location{font-size:14px;color:var(--muted);margin-top:20px}.socials{margin-top:25px}.socials a{font-size:14px;font-weight:650;min-height:40px;display:inline-flex;align-items:center}.portrait{width:100%;max-width:340px;aspect-ratio:4/5;object-fit:cover;object-position:center 30%;border-radius:28px;justify-self:end;border:1px solid var(--line);box-shadow:18px 18px 0 var(--panel)}.initials{display:grid;place-items:center;font-size:80px;font-weight:700;color:var(--accent);background:var(--panel)}.skills{display:flex;flex-wrap:wrap;gap:9px;margin-top:25px}.skill{font-size:13px;padding:6px 12px;border:1px solid var(--line);border-radius:999px;background:var(--panel);min-width:0;max-width:100%}section{border-top:1px solid var(--line);padding:52px 0;scroll-margin-top:24px}h2{font-size:31px;font-weight:750;margin-bottom:26px}.projects{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}.project{padding:28px;background:var(--panel);border:1px solid var(--line);border-radius:17px;min-width:0;display:flex;flex-direction:column;gap:15px}.project h3{font-size:22px}.project p{color:var(--muted);white-space:pre-wrap}.project-meta{font-size:12px;color:var(--accent);font-weight:700}.project-links{display:flex;gap:20px;flex-wrap:wrap;margin-top:auto;padding-top:6px;font-size:14px;font-weight:650}.section-copy{color:var(--muted);white-space:pre-wrap;max-width:820px}.resume-projects{margin-top:25px}.contact{background:var(--panel);padding:30px;border-radius:18px;border:1px solid var(--line)}.contact h2{margin-bottom:12px}.contact p{color:var(--muted)}footer{padding:28px 0 40px;color:var(--muted);font-size:13px;border-top:1px solid var(--line)}
@media(max-width:700px){.shell{padding:0 20px}nav{align-items:flex-start;flex-direction:column;gap:12px}.brand{max-width:100%}.nav-links{gap:8px 18px}.hero{grid-template-columns:minmax(0,1fr);padding:42px 0;gap:30px}.portrait{grid-row:1;justify-self:start;max-width:185px;box-shadow:9px 9px 0 var(--panel);border-radius:19px}.initials{font-size:56px;aspect-ratio:1}.projects{grid-template-columns:minmax(0,1fr)}section{padding:35px 0}.project{padding:22px}h2{font-size:26px}.contact{padding:22px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
</style></head><body>
<header><nav class="shell" aria-label="Portfolio navigation"><a href="#home" class="brand">${e(data.name || "My portfolio")}</a><div class="nav-links">${sections.map((section) => `<a href="#${section.id}">${section.label}</a>`).join("")}${email || phone ? '<a href="#contact">Contact</a>' : ""}</div></nav></header>
<main id="home" class="shell"><div class="hero"><div><p class="eyebrow">Personal portfolio</p><h1>${e(data.name || "Your name")}</h1>${data.headline ? `<p class="role">${e(data.headline)}</p>` : ""}${data.summary ? `<p class="summary">${e(data.summary)}</p>` : ""}${data.location ? `<p class="location">Based in ${e(data.location)}</p>` : ""}${social ? `<div class="socials">${social}</div>` : ""}${skills.length ? `<div class="skills" aria-label="Skills">${skills.map((skill) => `<span class="skill">${e(skill)}</span>`).join("")}</div>` : ""}</div>${photo ? `<img class="portrait" src="${e(photo)}" alt="Portrait of ${e(data.name)}">` : `<div class="portrait initials" aria-hidden="true">${e(initials)}</div>`}</div>
${projects.length || data.resumeProjects ? `<section id="projects"><p class="eyebrow">Selected work</p><h2>Projects</h2>${projects.length ? `<div class="projects">${projects.map((project) => `<article class="project">${project.language ? `<span class="project-meta">${e(project.language)}</span>` : ""}<h3>${e(project.title)}</h3>${project.description ? `<p>${e(project.description)}</p>` : ""}<div class="project-links">${link(project.sourceUrl, "Source code")}${link(project.demoUrl, "Live demo")}</div></article>`).join("")}</div>` : ""}${data.resumeProjects ? `<div class="section-copy resume-projects">${e(data.resumeProjects)}</div>` : ""}</section>` : ""}
${sections.filter((section) => section.id !== "projects").map((section) => `<section id="${section.id}"><h2>${section.label}</h2><div class="section-copy">${e(data[section.id])}</div></section>`).join("")}
${email || phone ? `<section id="contact"><div class="contact"><h2>Let’s start a conversation.</h2><p>Get in touch to discuss projects and opportunities.</p><div class="socials">${email ? `<a href="mailto:${e(encodeURIComponent(email))}">${e(email)}</a>` : ""}${phone ? `<a href="tel:${e(phone)}">${e(data.phone)}</a>` : ""}</div></div></section>` : ""}
</main><footer><div class="shell">${e(data.name || "My portfolio")} · Built with InsiderJobs Portfolio Generator</div></footer></body></html>`;
};

export const portfolioFilename = (name) => `${String(name || "my").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "my"}-portfolio.html`;
