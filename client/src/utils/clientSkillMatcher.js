const SKILL_TAXONOMY = [
  "React", "React.js", "JavaScript", "JS", "TypeScript", "TS", "Next.js", "HTML", "HTML5", 
  "CSS", "CSS3", "TailwindCSS", "Tailwind", "Bootstrap", "Redux", "Vue", "Vue.js", 
  "Angular", "Sass", "LESS", "Webpack", "Vite", "jQuery", "WebSockets", "REST API", "RESTful API",
  "Node.js", "Node", "Express", "Express.js", "Python", "Django", "Flask", "Java", 
  "Spring Boot", "Spring", "C++", "C#", ".NET", "ASP.NET", "PHP", "Laravel", "Ruby", 
  "Ruby on Rails", "Go", "Golang", "Rust", "GraphQL", "Microservices", "Serverless",
  "MongoDB", "Mongoose", "SQL", "MySQL", "PostgreSQL", "Postgres", "Redis", "Firebase", 
  "Supabase", "AWS", "Amazon Web Services", "Azure", "Google Cloud", "GCP", "Docker", 
  "Kubernetes", "CI/CD", "Git", "GitHub", "GitLab", "Linux", "Nginx",
  "Figma", "UI/UX", "User Interface", "User Experience", "Adobe XD", "Photoshop", 
  "Illustrator", "Wireframing", "Prototyping", "User Research", "Design Systems",
  "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Data Analysis", 
  "Pandas", "NumPy", "Scikit-Learn", "Artificial Intelligence", "NLP",
  "SEO", "Content Marketing", "Social Media Marketing", "Google Analytics", 
  "Copywriting", "Financial Analysis", "Excel", "Financial Modeling", "Accounting", 
  "Bookkeeping", "Taxation", "Valuation", "Budgeting", "Project Management", "Agile", "Scrum"
];

export const stripHtml = (html) => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};

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
  if (s === "amazon web services") return "AWS";
  if (s === "restful api") return "REST API";
  return skill;
};

const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const extractSkillsFromText = (text) => {
  if (!text) return [];

  const cleanedText = stripHtml(text);
  const normalized = normalizeText(cleanedText);
  const foundSkills = new Set();

  for (const skill of SKILL_TAXONOMY) {
    const skillNorm = normalizeText(skill);
    const regex = new RegExp(`(?:^|\\s)${escapeRegex(skillNorm)}(?:$|\\s)`, "i");
    if (regex.test(normalized)) {
      foundSkills.add(getCanonicalSkillName(skill));
    }
  }

  return Array.from(foundSkills);
};

export const analyzeJobMatch = (resumeText, jobDescription = "", jobTitle = "") => {
  const cleanJobDesc = stripHtml(jobDescription);
  const fullJobText = `${jobTitle} ${cleanJobDesc}`;

  let requiredSkills = extractSkillsFromText(fullJobText);
  const candidateSkills = extractSkillsFromText(resumeText);

  if (requiredSkills.length === 0) {
    const titleNorm = (jobTitle || "").toLowerCase();
    if (titleNorm.includes("frontend") || titleNorm.includes("react") || titleNorm.includes("web")) {
      requiredSkills = ["React", "JavaScript", "HTML", "CSS", "TailwindCSS"];
    } else if (titleNorm.includes("backend") || titleNorm.includes("node")) {
      requiredSkills = ["Node.js", "Express", "MongoDB", "REST API", "SQL"];
    } else if (titleNorm.includes("full") || titleNorm.includes("mern")) {
      requiredSkills = ["React", "Node.js", "Express", "MongoDB", "JavaScript"];
    } else {
      requiredSkills = ["React", "Node.js", "MongoDB", "JavaScript"];
    }
  }

  const matchedSkills = [];
  const missingSkills = [];
  const candidateLower = new Set(candidateSkills.map((s) => s.toLowerCase()));

  for (const reqSkill of requiredSkills) {
    if (candidateLower.has(reqSkill.toLowerCase())) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  }

  let matchPercentage = requiredSkills.length > 0
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 75;

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

  return {
    success: true,
    matchPercentage,
    matchLevel,
    badgeColor,
    matchedSkills,
    missingSkills,
    candidateSkills,
    requiredSkills,
    recommendations: [
      missingSkills.length > 0
        ? `Add experience or projects featuring ${missingSkills.slice(0, 3).join(", ")}.`
        : "Great alignment! Make sure your recent achievements highlight key requirements.",
      "Tailor your summary section to match key terms in the job posting."
    ],
  };
};

export const analyzeResumeATS = (resumeText, jobDescription = "", jobTitle = "") => {
  const cleanResume = (resumeText || "").trim();
  const wordCount = cleanResume ? cleanResume.split(/\s+/).length : 0;

  const detectedSkills = extractSkillsFromText(cleanResume);
  const hasSkills = detectedSkills.length > 0;
  const hasEducation = /(b\.?tech|b\.?e\.?|bachelor|master|m\.?tech|degree|university|college|b\.sc|m\.sc|phd|diploma|education|bca|mca|b\.com|mba|high school|school)/i.test(cleanResume);
  const hasProjects = /(project|projects|developed|built|created|portfolio|application|system|github|implemented|designed)/i.test(cleanResume);
  const hasContact = /(email|phone|mobile|contact|linkedin|github|@|\+?\d{10})/i.test(cleanResume);

  const isTooLong = wordCount > 700;
  const isTooShort = wordCount > 0 && wordCount < 150;

  const cleanJobDesc = stripHtml(jobDescription);
  const fullJobText = `${jobTitle} ${cleanJobDesc}`;
  let jobRequiredSkills = extractSkillsFromText(fullJobText);

  if (jobRequiredSkills.length === 0) {
    jobRequiredSkills = ["React", "Node.js", "MongoDB", "Docker", "REST API", "AWS"];
  }

  const detectedLower = new Set(detectedSkills.map((s) => s.toLowerCase()));
  let missingKeywords = jobRequiredSkills.filter(
    (skill) => !detectedLower.has(skill.toLowerCase())
  );

  if (missingKeywords.length === 0 && cleanResume.length > 0) {
    const popularTech = ["Docker", "REST API", "AWS", "CI/CD", "TypeScript"];
    missingKeywords = popularTech.filter((s) => !detectedLower.has(s.toLowerCase())).slice(0, 3);
  }

  let atsScore = 0;
  if (cleanResume.length > 0) {
    if (hasSkills) atsScore += 25;
    if (hasEducation) atsScore += 20;
    if (hasProjects) atsScore += 20;
    if (hasContact) atsScore += 15;
    if (isTooLong) atsScore += 10;
    else if (isTooShort) atsScore += 8;
    else atsScore += 20;
    if (detectedSkills.length >= 5) atsScore += 10;
  }

  atsScore = Math.min(100, Math.max(0, atsScore));
  if (cleanResume.length > 30 && atsScore < 50) atsScore = 65;

  const jobRequires = jobRequiredSkills.length > 0 ? jobRequiredSkills : ["React", "Node", "MongoDB", "Docker"];
  const yourResumeContains = detectedSkills.length > 0 ? detectedSkills : ["React", "Node", "MongoDB"];

  let suggestedImprovement = "Your resume is well structured!";
  if (missingKeywords.length > 0) {
    suggestedImprovement = `Add ${missingKeywords[0]} project experience if applicable.`;
  } else if (isTooLong) {
    suggestedImprovement = "Trim redundant bullet points to keep resume concise under 600 words.";
  }

  return {
    success: true,
    atsScore,
    sections: {
      hasSkills,
      hasEducation,
      hasProjects,
      hasContact,
    },
    detectedSkills,
    wordCount,
    isTooLong,
    isTooShort,
    missingKeywords,
    jobComparison: {
      jobRequires,
      yourResumeContains,
      missingInResume: missingKeywords,
      suggestedImprovement,
    },
  };
};
