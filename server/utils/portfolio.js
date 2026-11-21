export class PortfolioError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

const shortText = (value, name, max = 200) => {
  if (value === undefined) return "";
  if (typeof value !== "string" || value.trim().length > max) throw new PortfolioError(`${name} must be text of up to ${max} characters.`);
  return value.trim();
};

export const portfolioUrl = (value, name = "Link") => {
  const input = shortText(value, name, 1000);
  if (!input) return "";
  try {
    const url = new URL(input);
    if (url.protocol !== "https:" || url.username || url.password || !url.hostname.includes(".") ||
        /^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/i.test(url.hostname)) throw new Error();
    return url.href;
  } catch { throw new PortfolioError(`${name} must be a public HTTPS link without credentials.`); }
};

export const validatePortfolioPhoto = (value) => {
  if (value === undefined || value === "") return "";
  if (typeof value !== "string" || value.length > 700000) throw new PortfolioError("The processed photo is too large. Choose a smaller image.");
  const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match || match[2].length % 4 !== 0) throw new PortfolioError("Use a JPEG, PNG or WebP profile photo.");
  const bytes = Buffer.from(match[2], "base64");
  const valid = match[1] === "jpeg" ? bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]))
    : match[1] === "png" ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      : bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  if (!valid) throw new PortfolioError("The photo content does not match its image format.");
  return value;
};

export const githubUsername = (value) => {
  if (typeof value !== "string" || !/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(value) || value.includes("--")) {
    throw new PortfolioError("Enter a valid GitHub username, without a URL or spaces.");
  }
  return value;
};

export const validatePortfolio = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new PortfolioError("Add your portfolio details first.");
  if (!["studio", "midnight"].includes(body.theme)) throw new PortfolioError("Choose a portfolio theme.");
  if (!["indigo", "teal", "rose"].includes(body.accent)) throw new PortfolioError("Choose a portfolio accent colour.");
  const fields = {};
  for (const field of ["name", "headline", "email", "phone", "location"]) fields[field] = shortText(body[field], field);
  if (fields.email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(fields.email)) throw new PortfolioError("Enter a valid contact email or leave it empty.");
  for (const field of ["summary", "education", "experience", "certifications", "resumeProjects"]) fields[field] = shortText(body[field], field, 4000);
  for (const field of ["github", "linkedin", "website"]) fields[field] = portfolioUrl(body[field], field);
  if (!Array.isArray(body.skills) || body.skills.length > 40) throw new PortfolioError("Use up to 40 skills.");
  fields.skills = [...new Set(body.skills.map((skill) => shortText(skill, "Skill", 60)).filter(Boolean))];
  if (!Array.isArray(body.projects) || body.projects.length > 6) throw new PortfolioError("Choose up to 6 featured projects.");
  fields.projects = body.projects.map((project) => {
    if (!project || typeof project !== "object" || Array.isArray(project)) throw new PortfolioError("Add valid project details.");
    const title = shortText(project.title, "Project title", 120);
    if (!title) throw new PortfolioError("Every featured project needs a title.");
    return {
      id: shortText(project.id, "Project ID", 100), title,
      description: shortText(project.description, "Project description", 2000),
      language: shortText(project.language, "Project language", 60),
      sourceUrl: portfolioUrl(project.sourceUrl, "Project source"),
      demoUrl: portfolioUrl(project.demoUrl, "Project demo"),
    };
  });
  if (new Set(fields.projects.map((project) => project.id)).size !== fields.projects.length || fields.projects.some((project) => !project.id)) throw new PortfolioError("Project IDs must be unique.");
  return { ...fields, theme: body.theme, accent: body.accent, photo: validatePortfolioPhoto(body.photo) };
};

// Only fixed GitHub endpoints are requested. Repository code, READMEs and arbitrary URLs are never fetched.
export const importGithubProjects = async (username, { fetchImpl = fetch } = {}) => {
  githubUsername(username);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  const headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "InsiderJobs-Portfolio" };
  const get = async (suffix) => {
    const response = await fetchImpl(`https://api.github.com/users/${encodeURIComponent(username)}${suffix}`, { headers, signal: controller.signal, redirect: "error" });
    if (response.status === 404) throw new PortfolioError("GitHub user not found. Check the username and try again.", 404);
    if ([403, 429].includes(response.status)) throw new PortfolioError("GitHub is limiting requests. Please wait and try importing again; your current projects are unchanged.", 429);
    if (!response.ok) throw new PortfolioError("GitHub could not load the projects. Please try again.", 502);
    return response.json();
  };
  try {
    const [profile, repos] = await Promise.all([get(""), get("/repos?type=owner&sort=pushed&per_page=100")]);
    if (!Array.isArray(repos) || !profile || typeof profile.login !== "string") throw new PortfolioError("GitHub returned an unexpected response. Please try again.", 502);
    const login = githubUsername(profile.login);
    const projects = repos.filter((repo) => repo && Number.isSafeInteger(repo.id) && repo.id > 0 && !repo.private && !repo.fork && !repo.archived && typeof repo.name === "string" && /^[\w.-]+$/.test(repo.name) && String(repo.owner?.login).toLowerCase() === login.toLowerCase()).map((repo) => {
      let demoUrl = "";
      try { demoUrl = portfolioUrl(repo.homepage || "", "Demo"); } catch { /* Unsafe or non-HTTPS homepages are omitted. */ }
      return {
        id: `github-${repo.id}`, title: repo.name.slice(0, 120),
        description: typeof repo.description === "string" ? repo.description.slice(0, 2000) : "",
        language: typeof repo.language === "string" ? repo.language.slice(0, 60) : "",
        sourceUrl: `https://github.com/${login}/${encodeURIComponent(repo.name)}`, demoUrl,
      };
    });
    return { username: login, profile: { name: typeof profile.name === "string" ? profile.name.slice(0, 200) : "", summary: typeof profile.bio === "string" ? profile.bio.slice(0, 4000) : "", github: `https://github.com/${login}` }, projects, limit: 100 };
  } catch (error) {
    if (error instanceof PortfolioError) throw error;
    throw new PortfolioError(controller.signal.aborted ? "GitHub took too long. Please try importing again." : "Could not connect to GitHub. Please try again.", controller.signal.aborted ? 504 : 502);
  } finally { clearTimeout(timer); controller.abort(); }
};
