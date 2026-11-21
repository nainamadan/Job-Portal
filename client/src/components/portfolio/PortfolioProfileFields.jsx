export default function PortfolioProfileFields({ draft, update, full = false }) {
  const field = (name) => ({ value: draft[name], onChange: (event) => update({ [name]: event.target.value }) });
  return <div className="pg-fields">
    <div className="pg-field-row"><label>Your name<input {...field("name")} maxLength={200} placeholder="Your full name" autoComplete="name" required /></label><label>Professional headline<input {...field("headline")} maxLength={200} placeholder="e.g. Frontend developer" required /></label></div>
    {full && <>
      <label>About you<textarea {...field("summary")} maxLength={4000} rows={4} placeholder="Describe your interests, experience and the work you enjoy." /></label>
      <div className="pg-field-row"><label>Contact email <small>Optional · appears on your website</small><input {...field("email")} type="email" maxLength={200} autoComplete="email" placeholder="you@example.com" /></label><label>Phone <small>Optional · appears on your website</small><input {...field("phone")} type="tel" maxLength={200} autoComplete="tel" placeholder="Contact number" /></label></div>
      <label>Location<input {...field("location")} maxLength={200} placeholder="City, country" /></label>
      <div className="pg-field-row"><label>GitHub profile<input {...field("github")} type="url" pattern="https://.*" maxLength={1000} placeholder="https://github.com/username" /></label><label>LinkedIn<input {...field("linkedin")} type="url" pattern="https://.*" maxLength={1000} placeholder="https://linkedin.com/in/username" /></label></div>
      <label>Other website<input {...field("website")} type="url" pattern="https://.*" maxLength={1000} placeholder="https://your-website.example" /></label>
      <label>Education<textarea {...field("education")} maxLength={4000} rows={3} placeholder="Degree, institution and graduation year" /></label>
      <label>Experience<textarea {...field("experience")} maxLength={4000} rows={4} placeholder="Your roles, contributions and results" /></label>
      <label>Projects from your resume<textarea {...field("resumeProjects")} maxLength={4000} rows={4} placeholder="Resume projects appear as an additional text section beneath featured projects." /></label>
      <label>Certifications<textarea {...field("certifications")} maxLength={4000} rows={3} placeholder="Certifications you want to include" /></label>
    </>}
  </div>;
}
