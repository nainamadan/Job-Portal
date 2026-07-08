import React, { useContext, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";

const Applyjob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jobs } = useContext(AppContext);

  const job = jobs.find((item) => item._id === id);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    cover: "",
  });

  const [resume, setResume] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef(null);

  if (!job) {
    return (
      <div className="min-h-screen flex justify-center items-center text-2xl font-semibold">
        Job Not Found
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const acceptFile = (file) => {
    if (!file) return;
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, resume: "Upload a PDF or Word file only" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, resume: "File must be under 5MB" }));
      return;
    }
    setResume(file);
    setErrors((prev) => ({ ...prev, resume: "" }));
  };

  const handleFileChange = (e) => acceptFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    acceptFile(e.dataTransfer.files[0]);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(form.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }
    if (!resume) newErrors.resume = "Attach your resume to apply";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("jobId", job._id);
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("cover", form.cover);
      formData.append("resume", resume);

      // TODO: wire to your actual endpoint
      // await axios.post(`${backendUrl}/api/applications`, formData);

      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", cover: "" });
      setResume(null);
    } catch (err) {
      console.error(err);
      setErrors({ submit: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const initials = job.companyId?.name
    ?.split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6 items-start">

        {/* LEFT */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-8">

          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 font-medium text-sm mb-6 transition-colors"
          >
            <span className="transition-transform group-hover:-translate-x-0.5">←</span>
            Back to jobs
          </button>

          <div className="flex items-start gap-5 pb-6 border-b border-slate-100">
            {job.companyId?.image ? (
              <img
                src={job.companyId.image}
                alt={job.companyId?.name}
                className="w-16 h-16 rounded-xl border border-slate-200 object-contain p-2 bg-white flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                {initials || "?"}
              </div>
            )}

            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                {job.title}
              </h1>
              <p className="text-slate-500 font-medium mt-0.5">
                {job.companyId?.name}
              </p>

              <div className="flex gap-2 mt-4 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-md">
                  📍 {job.location}
                </span>
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-md">
                  💼 {job.level}
                </span>
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-md">
                  ₹ {job.salary}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-indigo-600 rounded-full inline-block" />
              Job Description
            </h2>

            <div
              className="prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-indigo-600"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit sticky top-6">

          {submitted ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-2xl">
                ✓
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Application sent
              </h3>
              <p className="text-slate-500 text-sm">
                {job.companyId?.name} will reach out if there's a match.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-bold text-slate-900">Apply Now</h2>
                <span className="text-xs font-semibold text-slate-400">
                  Takes 2 min
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-5">
                for {job.title}
              </p>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Full Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Naina Madan"
                    className={`w-full border rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${
                      errors.name ? "border-red-400" : "border-slate-200"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Email
                  </label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={`w-full border rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${
                      errors.email ? "border-red-400" : "border-slate-200"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className={`w-full border rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${
                      errors.phone ? "border-red-400" : "border-slate-200"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Resume
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    className={`cursor-pointer rounded-lg border-2 border-dashed px-3.5 py-5 text-center transition-colors ${
                      dragActive
                        ? "border-indigo-500 bg-indigo-50"
                        : errors.resume
                        ? "border-red-300 bg-red-50/40"
                        : "border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/40"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {resume ? (
                      <div className="flex items-center justify-center gap-2 text-sm text-slate-700 font-medium">
                        📄 <span className="truncate max-w-[180px]">{resume.name}</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-slate-600 font-medium">
                          Drop your resume here
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          or click to browse · PDF, DOC up to 5MB
                        </p>
                      </>
                    )}
                  </div>
                  {errors.resume && (
                    <p className="text-red-500 text-xs mt-1">{errors.resume}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Cover Letter <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <textarea
                    name="cover"
                    value={form.cover}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Tell them why you're a great fit..."
                    className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
                  />
                </div>

                {errors.submit && (
                  <p className="text-red-500 text-xs">{errors.submit}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-sm shadow-indigo-200"
                >
                  {submitting ? "Submitting..." : "Apply Now"}
                </button>

                <p className="text-[11px] text-slate-400 text-center pt-1">
                  By applying, you agree to share this info with {job.companyId?.name}.
                </p>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default Applyjob;