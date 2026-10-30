// // import { GoogleGenAI } from "@google/genai";

// // const ai = new GoogleGenAI({
// //   apiKey: process.env.GEMINI_API_KEY,
// // });

// // export const generateJobDescription = async (req, res) => {
// //   try {
// //     const {
// //       title,
// //       category,
// //       level,
// //       location,
// //       salary,
// //     } = req.body;

// //     if (!title) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Job title is required",
// //       });
// //     }

// //     const prompt = `
// // You are an expert HR recruiter and professional job-description writer.

// // Create a professional and attractive job description for the following job:

// // Job Title: ${title}
// // Category: ${category || "Not specified"}
// // Experience Level: ${level || "Not specified"}
// // Location: ${location || "Not specified"}
// // Salary: ${salary ? salary + " LPA" : "Not specified"}

// // Generate the job description with these sections:

// // 1. About the Role
// // 2. Responsibilities
// // 3. Required Skills
// // 4. Qualifications
// // 5. What We Offer

// // Requirements:
// // - Keep it realistic.
// // - Do not invent a company name.
// // - Do not make unrealistic salary promises.
// // - Use clear professional language.
// // - Make it suitable for a real job portal.
// // - Do not use emojis.
// // - Do not add markdown symbols like # or **.
// // - Keep the description around 300-500 words.
// // `;

// //     let description = "";

// //     try {
// //       const response = await ai.models.generateContent({
// //         model: "gemini-2.5-flash",
// //         contents: prompt,
// //       });
// //       description = response.text || "";
// //     } catch (aiErr) {
// //       console.warn("Gemini API call notice, trying fallback model:", aiErr.message);
// //       try {
// //         const response2 = await ai.models.generateContent({
// //           model: "gemini-1.5-flash",
// //           contents: prompt,
// //         });
// //         description = response2.text || "";
// //       } catch (err2) {
// //         description = "";
// //       }
// //     }

// //     if (!description || description.trim().length < 20) {
// //       description = `
// // <h2>About the Role</h2>
// // <p>We are seeking a highly skilled and motivated <strong>${title}</strong> to join our growing team in <strong>${location || "India"}</strong>. In this position, you will play a crucial role in building, scaling, and optimizing key features for our core applications.</p>

// // <h2>Key Responsibilities</h2>
// // <ul>
// //   <li>Design, code, and maintain robust, high-performance software applications for ${title}.</li>
// //   <li>Collaborate with product managers, designers, and engineering teams to deliver high quality products.</li>
// //   <li>Identify bottlenecks, debug complex issues, and optimize application performance.</li>
// //   <li>Participate in code reviews, technical discussions, and continuous improvement initiatives.</li>
// // </ul>

// // <h2>Required Skills & Qualifications</h2>
// // <ul>
// //   <li>Experience in ${title} roles (${level || "Relevant experience required"}).</li>
// //   <li>Strong proficiency in ${category || "software engineering"} methodologies and modern development tools.</li>
// //   <li>Hands-on experience with version control systems (Git), REST API design, and database integration.</li>
// //   <li>Strong analytical, problem-solving, and team collaboration abilities.</li>
// // </ul>

// // <h2>What We Offer</h2>
// // <ul>
// //   <li>Competitive compensation package${salary ? ` (${salary} LPA)` : ""}.</li>
// //   <li>Professional growth opportunities, mentorship, and career advancement.</li>
// //   <li>Dynamic, inclusive, and collaborative work environment.</li>
// // </ul>
// // `.trim();
// //     }

// //     return res.status(200).json({
// //       success: true,
// //       description,
// //     });

// //   } catch (error) {
// //     console.error("AI Job Description Error:", error);

// //     return res.status(500).json({
// //       success: false,
// //       message: error.message || "Failed to generate job description",
// //     });
// //   }
// // };


// // export const optimizeResumeForJob = async (req, res) => {
// //   try {
// //     const { resumeText, jobTitle, jobDescription, candidateSkills, missingSkills } = req.body;

// //     if (!resumeText) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Resume text is required",
// //       });
// //     }

// //     const prompt = `
// // You are an expert ATS Resume Coach and AI Career Advisor.

// // Target Job Title: ${jobTitle || "Software Developer"}
// // Target Job Description: ${jobDescription || "Not specified"}
// // Candidate Detected Skills: ${candidateSkills?.join(", ") || "React, Node, MongoDB"}
// // Missing Keywords: ${missingSkills?.join(", ") || "Docker, REST API, AWS"}

// // Candidate Resume Text:
// // ${resumeText}

// // INSTRUCTIONS:
// // 1. Compare job requirements vs candidate resume.
// // 2. Identify:
// //    - Job requires (list 4 key skills requested by job)
// //    - Your resume contains (list skills found in candidate's resume)
// //    - Suggested improvement (Actionable advice e.g. "Add Docker project experience if applicable.")
// // 3. IMPORTANT MANDATE: Do NOT invent or fabricate fake skills, degrees, or fake job history that the candidate does not have! Only take the candidate's GENUINE experience and explain how to phrase/format it better for ATS.

// // Return ONLY a valid JSON object matching this exact structure:
// // {
// //   "jobRequires": ["React", "Node", "MongoDB", "Docker"],
// //   "yourResumeContains": ["React", "Node", "MongoDB"],
// //   "suggestedImprovement": "Add Docker project experience if applicable.",
// //   "bulletPointImprovements": [
// //     "Rephrase project section to highlight impact metrics using clear action verbs without fabricating unearned skills.",
// //     "Highlight existing hands-on experience near the top for higher ATS scanning visibility."
// //   ]
// // }
// // `;

// //     let aiResult = null;
// //     try {
// //       const response = await ai.models.generateContent({
// //         model: "gemini-2.5-flash",
// //         contents: prompt,
// //       });

// //       let responseText = response.text || "";
// //       responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
// //       aiResult = JSON.parse(responseText);
// //     } catch (aiErr) {
// //       console.warn("Gemini API call warning, fallback to rule-based suggestion:", aiErr.message);
// //     }

// //     if (!aiResult) {
// //       const reqList = (jobDescription || "").toLowerCase().includes("docker") || (missingSkills || []).includes("Docker")
// //         ? ["React", "Node", "MongoDB", "Docker"]
// //         : ["React", "Node", "MongoDB", "REST API"];

// //       const containsList = candidateSkills && candidateSkills.length > 0 
// //         ? candidateSkills 
// //         : ["React", "Node", "MongoDB"];

// //       const missing = missingSkills && missingSkills.length > 0 
// //         ? missingSkills[0] 
// //         : "Docker";

// //       aiResult = {
// //         jobRequires: reqList,
// //         yourResumeContains: containsList,
// //         suggestedImprovement: `Add ${missing} project experience if applicable.`,
// //         bulletPointImprovements: [
// //           `Better phrase your existing experience with quantified metrics and clear action verbs.`,
// //           `Highlight your hands-on experience with ${containsList.slice(0, 3).join(", ")} prominently near the top of your resume.`
// //         ]
// //       };
// //     }

// //     return res.status(200).json({
// //       success: true,
// //       data: aiResult,
// //     });
// //   } catch (error) {
// //     console.error("AI Resume Optimization Error:", error);
// //     return res.status(500).json({
// //       success: false,
// //       message: error.message || "Failed to optimize resume",
// //     });
// //   }
// // };



// import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY,
// });

// // ==========================================
// // GENERATE JOB DESCRIPTION
// // ==========================================
// export const generateJobDescription = async (req, res) => {
//   try {
//     const {
//       title,
//       category,
//       level,
//       location,
//       salary,
//     } = req.body;

//     if (!title) {
//       return res.status(400).json({
//         success: false,
//         message: "Job title is required",
//       });
//     }

//     const prompt = `
// You are an expert HR recruiter and professional job-description writer.

// Create a professional job description for:

// Job Title: ${title}
// Category: ${category || "Not specified"}
// Experience Level: ${level || "Not specified"}
// Location: ${location || "Not specified"}
// Salary: ${salary ? `${salary} LPA` : "Not specified"}

// Include these sections:
// 1. About the Role
// 2. Responsibilities
// 3. Required Skills
// 4. Qualifications
// 5. What We Offer

// Requirements:
// - Keep it realistic.
// - Do not invent a company name.
// - Do not make unrealistic salary promises.
// - Use professional language.
// - Do not use emojis.
// - Do not add markdown symbols.
// - Keep it around 300-500 words.
// `;

//     let description = "";

//     try {
//       const response = await ai.models.generateContent({
//         model: "gemini-2.5-flash",
//         contents: prompt,
//       });

//       description = response.text || "";
//     } catch (aiErr) {
//       console.warn(
//         "Gemini job description generation failed:",
//         aiErr.message
//       );
//     }

//     if (!description || description.trim().length < 20) {
//       description = `
// <h2>About the Role</h2>
// <p>We are seeking a motivated ${title} to join our team in ${location || "India"}.</p>

// <h2>Key Responsibilities</h2>
// <ul>
//   <li>Develop, maintain, and improve relevant applications and workflows.</li>
//   <li>Collaborate with team members to deliver quality work.</li>
//   <li>Identify problems and help improve application performance.</li>
//   <li>Participate in reviews and continuous improvement activities.</li>
// </ul>

// <h2>Required Skills and Qualifications</h2>
// <ul>
//   <li>Relevant knowledge or experience in ${title}.</li>
//   <li>Understanding of ${category || "the relevant technical domain"}.</li>
//   <li>Problem-solving and communication skills.</li>
// </ul>

// <h2>What We Offer</h2>
// <ul>
//   <li>Professional growth opportunities.</li>
//   <li>A collaborative work environment.</li>
// </ul>
// `.trim();
//     }

//     return res.status(200).json({
//       success: true,
//       description,
//     });
//   } catch (error) {
//     console.error("AI Job Description Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to generate job description",
//     });
//   }
// };

// // ==========================================
// // ATS RESUME OPTIMIZATION SUGGESTIONS
// // ==========================================
// export const optimizeResumeForJob = async (req, res) => {
//   try {
//     const {
//       resumeText,
//       jobTitle,
//       jobDescription,
//       candidateSkills = [],
//       missingSkills = [],
//     } = req.body;

//     if (!resumeText || !resumeText.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Resume text is required",
//       });
//     }

//     const prompt = `
// You are an expert ATS Resume Coach.

// Target Job Title: ${jobTitle || "Software Developer"}
// Target Job Description: ${jobDescription || "Not specified"}
// Candidate Skills: ${candidateSkills.join(", ") || "Not provided"}
// Missing Keywords: ${missingSkills.join(", ") || "Not provided"}

// Candidate Resume:
// ${resumeText}

// Do not invent skills, degrees, work history or achievements.

// Return ONLY valid JSON using this structure:
// {
//   "jobRequires": ["Skill 1", "Skill 2"],
//   "yourResumeContains": ["Skill 1", "Skill 2"],
//   "suggestedImprovement": "Actionable advice",
//   "bulletPointImprovements": [
//     "Improvement 1",
//     "Improvement 2"
//   ]
// }
// `;

//     let aiResult = null;

//     try {
//       const response = await ai.models.generateContent({
//         model: "gemini-2.5-flash",
//         contents: prompt,
//       });

//       let responseText = (response.text || "")
//         .replace(/```json/gi, "")
//         .replace(/```/g, "")
//         .trim();

//       const jsonMatch = responseText.match(/\{[\s\S]*\}/);

//       if (jsonMatch) {
//         aiResult = JSON.parse(jsonMatch[0]);
//       }
//     } catch (aiErr) {
//       console.warn(
//         "Gemini ATS optimization failed:",
//         aiErr.message
//       );
//     }

//     if (!aiResult) {
//       aiResult = {
//         jobRequires: missingSkills.slice(0, 8),
//         yourResumeContains: candidateSkills,
//         suggestedImprovement:
//           "Review the missing keywords and include them only if they reflect your genuine knowledge or experience.",
//         bulletPointImprovements: [
//           "Use clear action verbs to describe your actual project work.",
//           "Place relevant existing skills and projects prominently.",
//           "Add measurable achievements only when you can verify them.",
//         ],
//       };
//     }

//     return res.status(200).json({
//       success: true,
//       data: aiResult,
//     });
//   } catch (error) {
//     console.error("AI Resume Optimization Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to optimize resume",
//     });
//   }
// };

// // ==========================================
// // GENERATE COMPLETE ATS-FRIENDLY RESUME
// // ==========================================
// export const generateResumeFromATS = async (req, res) => {
//   try {
//     const {
//       resumeText,
//       jobTitle,
//       jobDescription,
//       candidateSkills = [],
//       missingSkills = [],
//     } = req.body;

//     if (!resumeText || !resumeText.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Resume text is required",
//       });
//     }

//     if (resumeText.trim().length < 50) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide a complete resume",
//       });
//     }

//     const prompt = `
// You are a professional resume writer and ATS specialist.

// Create a complete, polished, ATS-friendly resume by improving the
// candidate's original resume for the target job.

// TARGET JOB:
// ${jobTitle || "Not specified"}

// JOB DESCRIPTION:
// ${jobDescription || "Not provided"}

// SKILLS FOUND IN THE ORIGINAL RESUME:
// ${candidateSkills.join(", ") || "Not provided"}

// MISSING JOB KEYWORDS:
// ${missingSkills.join(", ") || "Not provided"}

// ORIGINAL RESUME:
// <original_resume>
// ${resumeText}
// </original_resume>

// STRICT RULES:
// 1. Preserve genuine contact details, education, projects, work history,
//    dates, certifications and achievements from the original resume.
// 2. Never invent a skill, degree, certificate, employer, project,
//    achievement, date, metric or responsibility.
// 3. Do not add a missing keyword as a claimed skill unless the original
//    resume supports that claim.
// 4. Improve grammar, clarity, wording and ATS-friendly formatting.
// 5. Tailor the summary and reorder relevant existing skills and projects
//    according to the target job.
// 6. Do not fabricate experience to improve the ATS score.
// 7. Do not invent personal details if they are missing.
// 8. Use a clean, single-column layout and standard section headings.
// 9. Avoid tables, emojis, decorative symbols and multiple columns.
// 10. Omit sections for which no reliable information is available.
// 11. Return only the resume text, without explanations or markdown fences.

// Use relevant headings when supported by the original:
// FULL NAME
// Contact Information
// Professional Summary
// Technical Skills
// Work Experience
// Projects
// Education
// Certifications
// Achievements
// `;

//     const response = await ai.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents: prompt,
//     });

//     const generatedResume = (response.text || "").trim();

//     if (generatedResume.length < 50) {
//       return res.status(502).json({
//         success: false,
//         message: "AI could not generate the resume. Please try again.",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "ATS-friendly resume generated successfully",
//       data: {
//         resume: generatedResume,
//         jobTitle: jobTitle || "Target Role",
//       },
//     });
//   } catch (error) {
//     console.error("AI Resume Generation Error:", error);

//     return res.status(500).json({
//       success: false,
//       message:
//         "Failed to generate resume. Check your Gemini API key and try again.",
//     });
//   }
// };


// export const generateImprovedResume = async (req, res) => {
//   try {
//     const {
//       resumeText,
//       jobTitle,
//       jobDescription,
//       candidateSkills = [],
//       missingSkills = [],
//     } = req.body;

//     if (!resumeText || !resumeText.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Resume text is required",
//       });
//     }

//     if (!jobTitle?.trim() || !jobDescription?.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Target job title and job description are required",
//       });
//     }

//     if (!process.env.GEMINI_API_KEY) {
//       return res.status(500).json({
//         success: false,
//         message: "GEMINI_API_KEY is not configured on the server",
//       });
//     }

//     const prompt = `
// You are an expert resume writer and ATS optimization specialist.

// Create an improved, job-targeted resume using the candidate's ORIGINAL resume.

// TARGET JOB:
// ${jobTitle}

// JOB DESCRIPTION:
// ${jobDescription}

// SKILLS DETECTED IN THE ORIGINAL RESUME:
// ${candidateSkills.join(", ") || "None supplied"}

// MISSING JOB KEYWORDS:
// ${missingSkills.join(", ") || "None supplied"}

// ORIGINAL RESUME:
// ${resumeText.slice(0, 25000)}

// STRICT RULES:
// 1. Preserve the candidate's actual name, contact details, education,
//    employment history, dates, projects and qualifications.
// 2. Never invent a degree, employer, job title, certification, achievement,
//    metric, project, skill or years of experience.
// 3. Do not claim missing skills as possessed skills unless the original resume
//    explicitly supports that claim.
// 4. You may improve grammar, formatting, clarity and wording without changing
//    the truth of the original content.
// 5. Prioritize relevant existing skills and experience for the target job.
// 6. Add a keyword only when it is genuinely supported by the original resume.
// 7. If a detail is unavailable, omit it instead of making one up.
// 8. Use a simple ATS-friendly format with these sections where applicable:
//    NAME AND CONTACT, PROFESSIONAL SUMMARY, TECHNICAL SKILLS, EXPERIENCE,
//    PROJECTS, EDUCATION, CERTIFICATIONS.
// 9. Use plain text, clear headings and bullet points.
// 10. Return ONLY the complete improved resume. Do not add explanations,
//     markdown code fences, commentary or a list of missing skills.
// `;

//     const response = await ai.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents: prompt,
//     });

//     const improvedResume = (response.text || "").trim();

//     if (improvedResume.length < 50) {
//       return res.status(502).json({
//         success: false,
//         message: "AI could not generate a complete resume. Please try again.",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       resumeText: improvedResume,
//     });
//   } catch (error) {
//     console.error("Generate Improved Resume Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to generate improved resume",
//     });
//   }
// };






import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Use the model name recommended by your Gemini API error.
const GEMINI_MODEL = "gemini-3.8-flash";

// ==========================================
// HELPER: GENERATE AI TEXT
// ==========================================
const generateAIText = async (prompt) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing from server/.env");
  }

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
  });

  const text = response.text?.trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text;
};

// ==========================================
// GENERATE JOB DESCRIPTION
// ==========================================
export const generateJobDescription = async (req, res) => {
  try {
    const { title, category, level, location, salary } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Job title is required",
      });
    }

    const prompt = `
You are an expert HR recruiter and job-description writer.

Create a realistic professional job description for:

Job Title: ${title}
Category: ${category || "Not specified"}
Experience Level: ${level || "Not specified"}
Location: ${location || "Not specified"}
Salary: ${salary ? `${salary} LPA` : "Not specified"}

Include:
1. About the Role
2. Responsibilities
3. Required Skills
4. Qualifications
5. What We Offer

Rules:
- Do not invent a company name or unrealistic promises.
- Use clear, professional language.
- Do not use emojis or Markdown symbols.
- Keep the description around 300-500 words.
- Return plain text.
`;

    let description;

    try {
      description = await generateAIText(prompt);
    } catch (aiError) {
      console.error("Gemini job description error:", aiError.message);

      description = `
<h2>About the Role</h2>
<p>We are seeking a motivated ${title} to join our team in ${location || "India"}.</p>

<h2>Key Responsibilities</h2>
<ul>
<li>Develop, maintain, and improve relevant applications and workflows.</li>
<li>Collaborate with team members to deliver quality work.</li>
<li>Identify problems and help improve application performance.</li>
<li>Participate in reviews and continuous improvement activities.</li>
</ul>

<h2>Required Skills and Qualifications</h2>
<ul>
<li>Relevant knowledge or experience in ${title}.</li>
<li>Understanding of ${category || "the relevant technical domain"}.</li>
<li>Problem-solving and communication skills.</li>
</ul>

<h2>What We Offer</h2>
<ul>
<li>Professional growth opportunities.</li>
<li>A collaborative work environment.</li>
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

// ==========================================
// ATS RESUME OPTIMIZATION SUGGESTIONS
// ==========================================
export const optimizeResumeForJob = async (req, res) => {
  try {
    const {
      resumeText,
      jobTitle,
      jobDescription,
      candidateSkills = [],
      missingSkills = [],
    } = req.body;

    if (!resumeText?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Resume text is required",
      });
    }

    const prompt = `
You are an expert ATS resume coach.

Target Job: ${jobTitle || "Software Developer"}
Job Description: ${jobDescription || "Not specified"}
Candidate Skills: ${Array.isArray(candidateSkills) ? candidateSkills.join(", ") : ""}
Missing Keywords: ${Array.isArray(missingSkills) ? missingSkills.join(", ") : ""}

Candidate Resume:
${resumeText.slice(0, 25000)}

Do not invent skills, degrees, work history or achievements.

Return ONLY a valid JSON object:
{
  "jobRequires": ["Skill 1", "Skill 2"],
  "yourResumeContains": ["Skill 1", "Skill 2"],
  "suggestedImprovement": "Actionable advice",
  "bulletPointImprovements": ["Improvement 1", "Improvement 2"]
}
`;

    let aiResult = null;

    try {
      let responseText = await generateAIText(prompt);

      responseText = responseText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        aiResult = JSON.parse(jsonMatch[0]);
      }
    } catch (aiError) {
      console.error("Gemini ATS optimization error:", aiError.message);
    }

    if (!aiResult) {
      aiResult = {
        jobRequires: Array.isArray(missingSkills)
          ? missingSkills.slice(0, 8)
          : [],
        yourResumeContains: Array.isArray(candidateSkills)
          ? candidateSkills
          : [],
        suggestedImprovement:
          "Review missing keywords and include them only if they reflect your genuine knowledge or experience.",
        bulletPointImprovements: [
          "Use clear action verbs to describe your actual project work.",
          "Place relevant existing skills and projects prominently.",
          "Add measurable achievements only when you can verify them.",
        ],
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

// ==========================================
// GENERATE COMPLETE ATS-FRIENDLY RESUME
// ==========================================
export const generateResumeFromATS = async (req, res) => {
  try {
    const {
      resumeText,
      jobTitle,
      jobDescription,
      candidateSkills = [],
      missingSkills = [],
    } = req.body;

    if (!resumeText?.trim() || resumeText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: "Please provide a complete resume of at least 50 characters.",
      });
    }

    const prompt = `
You are a professional resume writer and ATS specialist.

Improve the candidate's original resume for the target job.

TARGET JOB:
${jobTitle || "Not specified"}

JOB DESCRIPTION:
${jobDescription || "Not provided"}

SKILLS FOUND IN ORIGINAL RESUME:
${Array.isArray(candidateSkills) ? candidateSkills.join(", ") : ""}

MISSING JOB KEYWORDS:
${Array.isArray(missingSkills) ? missingSkills.join(", ") : ""}

ORIGINAL RESUME:
${resumeText.slice(0, 25000)}

STRICT RULES:
1. Preserve genuine contact details, education, projects, work history, dates and achievements.
2. Never invent skills, qualifications, employers, certifications, metrics or experience.
3. Do not claim missing skills unless the original resume supports them.
4. Improve grammar, clarity, wording and ATS-friendly formatting.
5. Prioritize relevant existing skills and projects for this job.
6. Use a clean, single-column plain-text layout.
7. Omit sections for which reliable information is unavailable.
8. Return only the complete improved resume, without commentary or code fences.

Use suitable standard headings such as:
PROFESSIONAL SUMMARY
TECHNICAL SKILLS
WORK EXPERIENCE
PROJECTS
EDUCATION
CERTIFICATIONS
ACHIEVEMENTS
`;

    const generatedResume = await generateAIText(prompt);

    if (generatedResume.length < 50) {
      return res.status(502).json({
        success: false,
        message: "AI could not generate a complete resume. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "ATS-friendly resume generated successfully",
      data: {
        resume: generatedResume,
        jobTitle: jobTitle || "Target Role",
      },
    });
  } catch (error) {
    console.error("AI Resume Generation Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate resume",
    });
  }
};

// ==========================================
// GENERATE IMPROVED RESUME FROM ATS SIMULATOR
// ==========================================
// export const generateImprovedResume = async (req, res) => {
//   try {
//     const {
//       resumeText,
//       jobTitle,
//       jobDescription,
//       candidateSkills = [],
//       missingSkills = [],
//     } = req.body;

//     if (!resumeText?.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Resume text is required",
//       });
//     }

//     if (!jobTitle?.trim() || !jobDescription?.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Target job title and job description are required",
//       });
//     }

//     const prompt = `
// You are an expert resume writer and ATS optimization specialist.

// Create an improved resume targeted to the job below, using only genuine
// information from the candidate's original resume.

// TARGET JOB:
// ${jobTitle}

// JOB DESCRIPTION:
// ${jobDescription}

// SKILLS DETECTED IN THE ORIGINAL RESUME:
// ${Array.isArray(candidateSkills) ? candidateSkills.join(", ") : ""}

// MISSING JOB KEYWORDS:
// ${Array.isArray(missingSkills) ? missingSkills.join(", ") : ""}

// ORIGINAL RESUME:
// ${resumeText.slice(0, 25000)}

// STRICT RULES:
// 1. Preserve the candidate's actual name, contact details, education,
//    employment history, dates, projects and qualifications.
// 2. Never invent degrees, employers, certifications, achievements,
//    metrics, projects, skills or years of experience.
// 3. Never present missing skills as skills the candidate already possesses.
// 4. Improve grammar, clarity, wording and ATS-friendly formatting.
// 5. Prioritize relevant existing skills and experience for the target job.
// 6. Use only keywords supported by the original resume.
// 7. If information is unavailable, omit it instead of inventing it.
// 8. Use a clean, single-column format with clear headings and bullet points.
// 9. Return ONLY the complete resume in plain text. No explanation or code fences.
// `;

//     const improvedResume = await generateAIText(prompt);

//     if (improvedResume.length < 50) {
//       return res.status(502).json({
//         success: false,
//         message: "AI could not generate a complete resume. Please try again.",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Improved resume generated successfully.",
//       data: {
//         resumeText: improvedResume,
//       },
//       // Also return this field for clients expecting it at the top level.
//       resumeText: improvedResume,
//     });
//   } catch (error) {
//     console.error("Generate Improved Resume Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to generate improved resume",
//     });
//   }
// };

// ==========================================
// GENERATE IMPROVED RESUME FROM ATS SIMULATOR
// ==========================================
export const generateImprovedResume = async (req, res) => {
  try {
    const {
      resumeText,
      jobTitle,
      jobDescription,
      candidateSkills = [],
      missingSkills = [],
    } = req.body;

    // Validate resume
    if (typeof resumeText !== "string" || !resumeText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide your existing resume text.",
      });
    }

    // Validate target job
    if (
      typeof jobTitle !== "string" ||
      !jobTitle.trim() ||
      typeof jobDescription !== "string" ||
      !jobDescription.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Target job title and job description are required.",
      });
    }

    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY is missing from server/.env.",
      });
    }

    const skills = Array.isArray(candidateSkills)
      ? candidateSkills.join(", ")
      : "";

    const missing = Array.isArray(missingSkills)
      ? missingSkills.join(", ")
      : "";

    const prompt = `
You are a professional resume writer and ATS specialist.

Your task is to rewrite the candidate's resume for the target job.

TARGET JOB TITLE:
${jobTitle.trim()}

TARGET JOB DESCRIPTION:
${jobDescription.trim().slice(0, 10000)}

SKILLS ALREADY DETECTED IN THE RESUME:
${skills || "Not provided"}

MISSING JOB KEYWORDS:
${missing || "Not provided"}

ORIGINAL RESUME:
<original_resume>
${resumeText.trim().slice(0, 20000)}
</original_resume>

IMPORTANT RULES:
1. Return a complete, professional resume, not advice about writing a resume.
2. Preserve the candidate's real name, contact information, education,
   projects, experience, employers, dates and qualifications.
3. Never invent skills, work experience, degrees, certifications,
   projects, achievements, metrics or personal details.
4. Do not claim missing skills unless the original resume supports them.
5. Improve grammar, clarity, formatting and professional wording.
6. Prioritize relevant existing skills and projects for the target job.
7. Use a simple, single-column, ATS-friendly format.
8. Use clear headings and readable bullet points.
9. Do not add a fake professional summary or fake work history.
10. Omit sections when the original resume contains no relevant information.
11. Return the COMPLETE improved resume as plain text.
12. Do not return an explanation, introduction or Markdown code fence.

Suggested headings where supported:
NAME AND CONTACT INFORMATION
PROFESSIONAL SUMMARY
TECHNICAL SKILLS
WORK EXPERIENCE
PROJECTS
EDUCATION
CERTIFICATIONS
ACHIEVEMENTS

The final answer must contain the actual rewritten resume.
`;

    console.log("Generating improved resume...");
    console.log("Target job:", jobTitle);
    console.log("Original resume length:", resumeText.length);

    // Use the model name recommended by the API error.
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    const improvedResume = (
      typeof response.text === "string" ? response.text : ""
    )
      .replace(/^```(?:text|markdown)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    // Log response details for debugging without logging personal resume data.
    console.log(
      "AI response length:",
      improvedResume.length
    );

    if (!improvedResume) {
      console.error(
        "Gemini returned no readable resume text."
      );

      return res.status(502).json({
        success: false,
        message:
          "The AI returned an empty response. Please try again.",
      });
    }

    if (improvedResume.length < 50) {
      console.error(
        "Gemini returned an unexpectedly short resume:",
        JSON.stringify(improvedResume)
      );

      return res.status(502).json({
        success: false,
        message:
          "The AI returned an incomplete resume. Please try again with more resume details.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Improved resume generated successfully.",
      data: {
        resumeText: improvedResume,
      },
      // Compatibility with clients expecting the top-level field.
      resumeText: improvedResume,
    });
  } catch (error) {
    console.error(
      "Generate Improved Resume Error:",
      error.message || error
    );

    const apiStatus = error.status || error.statusCode;

    return res.status(
      apiStatus === 429 ? 429 :
      apiStatus === 400 ? 400 :
      apiStatus === 401 || apiStatus === 403 ? apiStatus :
      500
    ).json({
      success: false,
      message:
        apiStatus === 429
          ? "Gemini API quota or rate limit reached. Please try again later."
          : apiStatus === 401 || apiStatus === 403
          ? "Gemini API access failed. Check your API key and model permissions."
          : error.message || "Failed to generate the improved resume.",
    });
  }
};