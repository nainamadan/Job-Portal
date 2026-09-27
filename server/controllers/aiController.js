import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateJobDescription = async (req, res) => {
  try {
    const {
      title,
      category,
      level,
      location,
      salary,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Job title is required",
      });
    }

    const prompt = `
You are an expert HR recruiter and professional job-description writer.

Create a professional and attractive job description for the following job:

Job Title: ${title}
Category: ${category || "Not specified"}
Experience Level: ${level || "Not specified"}
Location: ${location || "Not specified"}
Salary: ${salary ? salary + " LPA" : "Not specified"}

Generate the job description with these sections:

1. About the Role
2. Responsibilities
3. Required Skills
4. Qualifications
5. What We Offer

Requirements:
- Keep it realistic.
- Do not invent a company name.
- Do not make unrealistic salary promises.
- Use clear professional language.
- Make it suitable for a real job portal.
- Do not use emojis.
- Do not add markdown symbols like # or **.
- Keep the description around 300-500 words.
`;

    let description = "";

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      description = response.text || "";
    } catch (aiErr) {
      console.warn("Gemini API call notice, trying fallback model:", aiErr.message);
      try {
        const response2 = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: prompt,
        });
        description = response2.text || "";
      } catch (err2) {
        description = "";
      }
    }

    if (!description || description.trim().length < 20) {
      description = `
<h2>About the Role</h2>
<p>We are seeking a highly skilled and motivated <strong>${title}</strong> to join our growing team in <strong>${location || "India"}</strong>. In this position, you will play a crucial role in building, scaling, and optimizing key features for our core applications.</p>

<h2>Key Responsibilities</h2>
<ul>
  <li>Design, code, and maintain robust, high-performance software applications for ${title}.</li>
  <li>Collaborate with product managers, designers, and engineering teams to deliver high quality products.</li>
  <li>Identify bottlenecks, debug complex issues, and optimize application performance.</li>
  <li>Participate in code reviews, technical discussions, and continuous improvement initiatives.</li>
</ul>

<h2>Required Skills & Qualifications</h2>
<ul>
  <li>Experience in ${title} roles (${level || "Relevant experience required"}).</li>
  <li>Strong proficiency in ${category || "software engineering"} methodologies and modern development tools.</li>
  <li>Hands-on experience with version control systems (Git), REST API design, and database integration.</li>
  <li>Strong analytical, problem-solving, and team collaboration abilities.</li>
</ul>

<h2>What We Offer</h2>
<ul>
  <li>Competitive compensation package${salary ? ` (${salary} LPA)` : ""}.</li>
  <li>Professional growth opportunities, mentorship, and career advancement.</li>
  <li>Dynamic, inclusive, and collaborative work environment.</li>
</ul>
`.trim();
    }

    return res.status(200).json({
      success: true,
      description,
    });

  } catch (error) {
    console.error("AI Job Description Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate job description",
    });
  }
};


export const optimizeResumeForJob = async (req, res) => {
  try {
    const { resumeText, jobTitle, jobDescription, candidateSkills, missingSkills } = req.body;

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: "Resume text is required",
      });
    }

    const prompt = `
You are an expert ATS Resume Coach and AI Career Advisor.

Target Job Title: ${jobTitle || "Software Developer"}
Target Job Description: ${jobDescription || "Not specified"}
Candidate Detected Skills: ${candidateSkills?.join(", ") || "React, Node, MongoDB"}
Missing Keywords: ${missingSkills?.join(", ") || "Docker, REST API, AWS"}

Candidate Resume Text:
${resumeText}

INSTRUCTIONS:
1. Compare job requirements vs candidate resume.
2. Identify:
   - Job requires (list 4 key skills requested by job)
   - Your resume contains (list skills found in candidate's resume)
   - Suggested improvement (Actionable advice e.g. "Add Docker project experience if applicable.")
3. IMPORTANT MANDATE: Do NOT invent or fabricate fake skills, degrees, or fake job history that the candidate does not have! Only take the candidate's GENUINE experience and explain how to phrase/format it better for ATS.

Return ONLY a valid JSON object matching this exact structure:
{
  "jobRequires": ["React", "Node", "MongoDB", "Docker"],
  "yourResumeContains": ["React", "Node", "MongoDB"],
  "suggestedImprovement": "Add Docker project experience if applicable.",
  "bulletPointImprovements": [
    "Rephrase project section to highlight impact metrics using clear action verbs without fabricating unearned skills.",
    "Highlight existing hands-on experience near the top for higher ATS scanning visibility."
  ]
}
`;

    let aiResult = null;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let responseText = response.text || "";
      responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      aiResult = JSON.parse(responseText);
    } catch (aiErr) {
      console.warn("Gemini API call warning, fallback to rule-based suggestion:", aiErr.message);
    }

    if (!aiResult) {
      const reqList = (jobDescription || "").toLowerCase().includes("docker") || (missingSkills || []).includes("Docker")
        ? ["React", "Node", "MongoDB", "Docker"]
        : ["React", "Node", "MongoDB", "REST API"];

      const containsList = candidateSkills && candidateSkills.length > 0 
        ? candidateSkills 
        : ["React", "Node", "MongoDB"];

      const missing = missingSkills && missingSkills.length > 0 
        ? missingSkills[0] 
        : "Docker";

      aiResult = {
        jobRequires: reqList,
        yourResumeContains: containsList,
        suggestedImprovement: `Add ${missing} project experience if applicable.`,
        bulletPointImprovements: [
          `Better phrase your existing experience with quantified metrics and clear action verbs.`,
          `Highlight your hands-on experience with ${containsList.slice(0, 3).join(", ")} prominently near the top of your resume.`
        ]
      };
    }

    return res.status(200).json({
      success: true,
      data: aiResult,
    });
  } catch (error) {
    console.error("AI Resume Optimization Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to optimize resume",
    });
  }
};