
import React, { useState } from "react";
import { toast } from "react-toastify";

const ResumeDetailsForm = ({ onGenerate }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
    summary: "",
    education: "",
    skills: "",
    projects: "",
    experience: "",
    certifications: "",
    achievements: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const inputClass =
    "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  const labelClass =
    "block text-sm font-semibold text-slate-700 mb-1.5";

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.education.trim() ||
      !form.skills.trim()
    ) {
      toast.error(
        "Please fill Name, Email, Phone, Education and Skills."
      );
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(form.email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!/^[+]?[\d\s()-]{10,18}$/.test(form.phone.trim())) {
      toast.error("Please enter a valid contact number.");
      return;
    }

    if (!form.projects.trim() && !form.experience.trim()) {
      toast.error("Please add at least one project or work experience.");
      return;
    }

    const section = (title, value) => {
      return value.trim()
        ? `\n\n${title.toUpperCase()}\n${value.trim()}`
        : "";
    };

    const resumeText = `
${form.name.trim().toUpperCase()}

Email: ${form.email.trim()}
Phone: ${form.phone.trim()}
${form.location.trim() ? `Location: ${form.location.trim()}` : ""}
${form.linkedin.trim() ? `LinkedIn: ${form.linkedin.trim()}` : ""}
${form.github.trim() ? `GitHub: ${form.github.trim()}` : ""}
${form.portfolio.trim() ? `Portfolio: ${form.portfolio.trim()}` : ""}
${section("Professional Summary", form.summary)}
${section("Education", form.education)}
${section("Technical Skills", form.skills)}
${section("Projects", form.projects)}
${section("Work Experience", form.experience)}
${section("Certifications", form.certifications)}
${section("Achievements", form.achievements)}
`.trim();

    setLoading(true);

    try {
      onGenerate(resumeText);
      toast.success("Your resume details have been converted successfully!");
    } catch (error) {
      console.error("Resume form error:", error);
      toast.error("Unable to create resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-6 sm:p-8 space-y-6">

      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-2xl">
          📝
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Build Your Resume Manually
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Enter your details below. We will automatically create
            resume content for ATS analysis.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Personal Details */}
        <div className="space-y-4">
          <h4 className="font-bold text-indigo-700 border-b pb-2">
            1. Personal Information
          </h4>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Full Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Naina Madan"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>
                Contact Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>
                Location
              </label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="City, State"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                LinkedIn Profile
              </label>
              <input
                name="linkedin"
                value={form.linkedin}
                onChange={handleChange}
                placeholder="linkedin.com/in/yourprofile"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                GitHub Profile
              </label>
              <input
                name="github"
                value={form.github}
                onChange={handleChange}
                placeholder="github.com/yourprofile"
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>
                Portfolio Website
              </label>
              <input
                name="portfolio"
                value={form.portfolio}
                onChange={handleChange}
                placeholder="https://yourportfolio.com"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <h4 className="font-bold text-indigo-700 border-b pb-2">
            2. Professional Summary
          </h4>

          <textarea
            name="summary"
            value={form.summary}
            onChange={handleChange}
            rows="3"
            placeholder="Write a short introduction about yourself, your career goals and strengths..."
            className={inputClass}
          />
        </div>

        {/* Education */}
        <div className="space-y-2">
          <h4 className="font-bold text-indigo-700 border-b pb-2">
            3. Education *
          </h4>

          <textarea
            name="education"
            value={form.education}
            onChange={handleChange}
            rows="4"
            placeholder={`B.Tech in Computer Science
College: ABC University
Year: 2023 - 2027
CGPA: 8.5/10`}
            className={inputClass}
            required
          />
          <p className="text-xs text-slate-400">
            Add degree, college, passing year and CGPA/percentage.
          </p>
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <h4 className="font-bold text-indigo-700 border-b pb-2">
            4. Technical Skills *
          </h4>

          <textarea
            name="skills"
            value={form.skills}
            onChange={handleChange}
            rows="3"
            placeholder="HTML, CSS, JavaScript, React.js, Node.js, MongoDB, Express.js, Git..."
            className={inputClass}
            required
          />
          <p className="text-xs text-slate-400">
            Separate your skills using commas.
          </p>
        </div>

        {/* Projects */}
        <div className="space-y-2">
          <h4 className="font-bold text-indigo-700 border-b pb-2">
            5. Projects
          </h4>

          <textarea
            name="projects"
            value={form.projects}
            onChange={handleChange}
            rows="5"
            placeholder={`HirePath AI - Job Portal
Technologies: React, Node.js, MongoDB
- Developed an AI-powered job portal.
- Implemented resume matching and ATS analysis.
- Built candidate and recruiter dashboards.`}
            className={inputClass}
          />
        </div>

        {/* Experience */}
        <div className="space-y-2">
          <h4 className="font-bold text-indigo-700 border-b pb-2">
            6. Work Experience / Internship
          </h4>

          <textarea
            name="experience"
            value={form.experience}
            onChange={handleChange}
            rows="4"
            placeholder={`Frontend Developer Intern
Company: ABC Technologies
Duration: June 2026 - August 2026
- Developed responsive web pages.
- Integrated REST APIs using React.`}
            className={inputClass}
          />
        </div>

        {/* Certifications */}
        <div className="space-y-2">
          <h4 className="font-bold text-indigo-700 border-b pb-2">
            7. Certifications
          </h4>

          <textarea
            name="certifications"
            value={form.certifications}
            onChange={handleChange}
            rows="2"
            placeholder="MERN Stack Development - ABC Institute"
            className={inputClass}
          />
        </div>

        {/* Achievements */}
        <div className="space-y-2">
          <h4 className="font-bold text-indigo-700 border-b pb-2">
            8. Achievements
          </h4>

          <textarea
            name="achievements"
            value={form.achievements}
            onChange={handleChange}
            rows="2"
            placeholder="Smart India Hackathon participant, coding competition..."
            className={inputClass}
          />
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
          <p className="text-xs text-indigo-800">
            <strong>Required fields:</strong> Name, Email, Contact Number,
            Education and Technical Skills. Add at least one project or
            work experience.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition"
        >
          {loading
            ? "Creating Resume..."
            : "✨ Create Resume from My Details"}
        </button>

      </form>
    </div>
  );
};

export default ResumeDetailsForm;
