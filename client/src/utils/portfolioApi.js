import { EMPTY_PORTFOLIO } from "./portfolioGenerator.js";

// A missing API route is a service failure, not an empty saved draft.
export const readPortfolioDraftResponse = (data) => {
  const invalid = () => { throw new Error("The portfolio service returned an unexpected response. Your current work has been kept."); };
  if (!data || data.success !== true || !Object.hasOwn(data, "portfolio")) return invalid();
  if (data.portfolio === null) return null;
  const saved = data.portfolio;
  if (!saved || typeof saved !== "object" || Array.isArray(saved) || !Number.isSafeInteger(saved.revision) || saved.revision < 1 ||
      !Array.isArray(saved.skills) || saved.skills.some((skill) => typeof skill !== "string") || !Array.isArray(saved.projects)) return invalid();
  const content = {};
  for (const [key, fallback] of Object.entries(EMPTY_PORTFOLIO)) {
    const value = saved[key] ?? fallback;
    if (typeof fallback === "string" && typeof value !== "string") return invalid();
    content[key] = value;
  }
  content.projects = saved.projects.map((project) => {
    if (!project || typeof project !== "object" || typeof project.id !== "string" || typeof project.title !== "string") return invalid();
    const fields = {};
    for (const key of ["id", "title", "description", "language", "sourceUrl", "demoUrl"]) {
      if (project[key] !== undefined && typeof project[key] !== "string") return invalid();
      fields[key] = project[key] || "";
    }
    return fields;
  });
  return { ...content, revision: saved.revision, updatedAt: typeof saved.updatedAt === "string" ? saved.updatedAt : "" };
};

export const portfolioServiceMessage = (error, operation = "load") => {
  const status = error.response?.status;
  const apiMessage = typeof error.response?.data?.message === "string" ? error.response.data.message : "";
  if (status === 404 && (operation !== "github" || !apiMessage)) {
    return operation === "github"
      ? "GitHub import is unavailable on this server. You can add projects manually in Review & style."
      : "Portfolio saving is unavailable on this server. You can still edit, add a photo and download your website. Try reconnecting to restore draft saving.";
  }
  if (apiMessage) return apiMessage;
  if (operation === "load" && (error.isAxiosError || status)) return "Your saved draft could not be reached. You can still build and download your website. Try reconnecting before saving.";
  if (operation === "github" && error.isAxiosError) return "GitHub projects could not be imported. Your selections are unchanged. Try again or add projects manually.";
  return error.message || "Please try again.";
};
