import axios from "axios";

// Sends a resume file to the server (POST /api/resume/parse) and returns the details it found,
// using the same field names as the ATS "Build Your Resume" form. The file is not stored.
export const readResume = async (backendUrl, file) => {
  const body = new FormData();
  body.append("resume", file);
  try {
    const { data } = await axios.post(`${backendUrl}/api/resume/parse`, body, { timeout: 60000 });
    if (!data?.success) throw new Error(data?.message || "This resume could not be read.");
    return data; // { details, filled, source }
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "This resume could not be read.", { cause: error });
  }
};

/** "+91 98765-43210" -> "9876543210" (the Apply form wants 10 digits). */
export const toTenDigitPhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : "";
};

export const FIELD_LABELS = {
  name: "name", email: "email", phone: "phone", location: "location", linkedin: "LinkedIn",
  github: "GitHub", portfolio: "portfolio", summary: "summary", degree: "degree",
  institution: "college", graduationYear: "graduation year", grade: "grade", skills: "skills",
  projects: "projects", experience: "experience", certifications: "certifications",
  achievements: "achievements", languages: "languages",
};
