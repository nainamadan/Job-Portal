// Comprehensive skill taxonomy dictionary across major domains
const SKILL_TAXONOMY = [
  // Frontend & Web
  "React", "React.js", "JavaScript", "JS", "TypeScript", "TS", "Next.js", "HTML", "HTML5", 
  "CSS", "CSS3", "TailwindCSS", "Tailwind", "Bootstrap", "Redux", "Vue", "Vue.js", 
  "Angular", "Sass", "LESS", "Webpack", "Vite", "jQuery", "WebSockets", "REST API", "RESTful API",

  // Backend & Systems
  "Node.js", "Node", "Express", "Express.js", "Python", "Django", "Flask", "Java", 
  "Spring Boot", "Spring", "C++", "C#", ".NET", "ASP.NET", "PHP", "Laravel", "Ruby", 
  "Ruby on Rails", "Go", "Golang", "Rust", "GraphQL", "Microservices", "Serverless",

  // Databases & DevOps / Cloud
  "MongoDB", "Mongoose", "SQL", "MySQL", "PostgreSQL", "Postgres", "Redis", "Firebase", 
  "Supabase", "AWS", "Amazon Web Services", "Azure", "Google Cloud", "GCP", "Docker", 
  "Kubernetes", "CI/CD", "Git", "GitHub", "GitLab", "Linux", "Nginx",

  // UI/UX & Design
  "Figma", "UI/UX", "User Interface", "User Experience", "Adobe XD", "Photoshop", 
  "Illustrator", "Wireframing", "Prototyping", "User Research", "Design Systems",

  // Data Science & AI
  "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Data Analysis", 
  "Pandas", "NumPy", "Scikit-Learn", "Artificial Intelligence", "NLP",

  // Business, Marketing & Finance
  "SEO", "Content Marketing", "Social Media Marketing", "Google Analytics", 
  "Copywriting", "Financial Analysis", "Excel", "Financial Modeling", "Accounting", 
  "Bookkeeping", "Taxation", "Valuation", "Budgeting", "Project Management", "Agile", "Scrum"
];

// Helper to normalize skill text for matching
const normalizeText = (text) => {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s#+\.]/g, " ")
    .replace(/\s+/g, " ");
};

const getCanonicalSkillName = (skill) => {
  const s = skill.toLowerCase();
  if (s === "js") return "JavaScript";
  if (s === "ts") return "TypeScript";
  if (s === "node") return "Node.js";
  if (s === "react.js") return "React";
  if (s === "vue.js") return "Vue.js";
  if (s === "express.js") return "Express";
  if (s === "tailwind") return "TailwindCSS";
  if (s === "html5") return "HTML";
  if (s === "css3") return "CSS";
  if (s === "postgres") return "PostgreSQL";
  return skill;
};

const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Extracts skills present in a given text string based on taxonomy and keyword patterns
 */
export const extractSkillsFromText = (text) => {
  if (!text) return [];

  const normalized = normalizeText(text);
  const foundSkills = new Set();

  for (const skill of SKILL_TAXONOMY) {
    const skillNorm = normalizeText(skill);

    // Precise word boundary check
    const regex = new RegExp(`(?:^|\\s)${escapeRegex(skillNorm)}(?:$|\\s)`, "i");
    if (regex.test(normalized)) {
      const canonicalName = getCanonicalSkillName(skill);
      foundSkills.add(canonicalName);
    }
  }

  return Array.from(foundSkills);
};

/**
 * Analyzes resume text against job description & title requirements
 */
export const analyzeJobMatch = (resumeText, jobDescription, jobTitle = "") => {
  const fullJobText = `${jobTitle} ${jobDescription}`;

  const requiredSkills = extractSkillsFromText(fullJobText);
  const candidateSkills = extractSkillsFromText(resumeText);

  // If job description doesn't explicitly list taxonomy skills, infer basic domain skills
  let effectiveRequiredSkills = [...requiredSkills];
  if (effectiveRequiredSkills.length === 0) {
    const titleNorm = (jobTitle || "").toLowerCase();
    if (titleNorm.includes("frontend") || titleNorm.includes("react") || titleNorm.includes("web")) {
      effectiveRequiredSkills = ["React", "JavaScript", "HTML", "CSS", "TailwindCSS"];
    } else if (titleNorm.includes("backend") || titleNorm.includes("node")) {
      effectiveRequiredSkills = ["Node.js", "Express", "MongoDB", "REST API", "SQL"];
    } else if (titleNorm.includes("full") || titleNorm.includes("mern")) {
      effectiveRequiredSkills = ["React", "Node.js", "Express", "MongoDB", "JavaScript"];
    } else if (titleNorm.includes("design") || titleNorm.includes("ui") || titleNorm.includes("ux")) {
      effectiveRequiredSkills = ["Figma", "UI/UX", "Wireframing", "Prototyping", "Photoshop"];
    } else {
      effectiveRequiredSkills = ["Communication", "Problem Solving", "Teamwork", "Management"];
    }
  }

  const matchedSkills = [];
  const missingSkills = [];

  const candidateSkillsLower = new Set(candidateSkills.map((s) => s.toLowerCase()));

  for (const reqSkill of effectiveRequiredSkills) {
    if (candidateSkillsLower.has(reqSkill.toLowerCase())) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  }

  // Calculate Match Percentage
  let matchPercentage = 0;
  if (effectiveRequiredSkills.length > 0) {
    matchPercentage = Math.round((matchedSkills.length / effectiveRequiredSkills.length) * 100);
  } else {
    matchPercentage = candidateSkills.length > 0 ? 80 : 50;
  }

  matchPercentage = Math.min(100, Math.max(15, matchPercentage));

  let matchLevel = "Needs Improvement";
  let badgeColor = "red";
  if (matchPercentage >= 75) {
    matchLevel = "Strong Match";
    badgeColor = "green";
  } else if (matchPercentage >= 50) {
    matchLevel = "Good Match";
    badgeColor = "yellow";
  }

  const recommendations = [];
  if (missingSkills.length > 0) {
    recommendations.push(`Add experience or projects featuring ${missingSkills.slice(0, 3).join(", ")}.`);
  }
  if (matchPercentage < 70) {
    recommendations.push("Tailor your summary section to match key terms in the job posting.");
  } else {
    recommendations.push("Great alignment! Make sure your recent achievements highlight key requirements.");
  }

  return {
    matchPercentage,
    matchLevel,
    badgeColor,
    matchedSkills,
    missingSkills,
    candidateSkills,
    requiredSkills: effectiveRequiredSkills,
    recommendations,
  };
};
