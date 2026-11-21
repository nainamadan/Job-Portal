import { FiPlus, FiTrash2 } from "react-icons/fi";

export default function PortfolioProjectEditor({ projects, update }) {
  const edit = (id, changes) => update(projects.map((project) => project.id === id ? { ...project, ...changes } : project));
  return <div className="pg-project-editor">
    <div className="pg-subheading"><div><h3>Featured projects</h3><p>Review imported details or add a project yourself.</p></div><button type="button" className="pg-button pg-secondary" disabled={projects.length >= 6} onClick={() => update([...projects, { id: `manual-${crypto.randomUUID()}`, title: "", description: "", language: "", sourceUrl: "", demoUrl: "" }])}><FiPlus />Add project</button></div>
    {!projects.length && <p className="pg-note">No featured projects selected. You can use projects from your resume, add one here, or return to GitHub import.</p>}
    {projects.map((project, index) => <div className="pg-edit-project" key={project.id}>
      <div className="pg-subheading"><strong>Project {index + 1}</strong><button type="button" className="pg-icon-button" aria-label={`Remove project ${index + 1}`} onClick={() => update(projects.filter((item) => item.id !== project.id))}><FiTrash2 /></button></div>
      <label>Project title<input value={project.title} maxLength={120} onChange={(event) => edit(project.id, { title: event.target.value })} placeholder="Project name" required /></label>
      <label>What did you build?<textarea value={project.description} maxLength={2000} rows={3} onChange={(event) => edit(project.id, { description: event.target.value })} placeholder="Explain the problem, your contribution and what works." /></label>
      <label>Main technology<input value={project.language} maxLength={60} onChange={(event) => edit(project.id, { language: event.target.value })} placeholder="e.g. JavaScript" /></label>
      <div className="pg-field-row"><label>Source code<input value={project.sourceUrl} type="url" pattern="https://.*" maxLength={1000} onChange={(event) => edit(project.id, { sourceUrl: event.target.value })} placeholder="https://github.com/you/project" /></label><label>Live demo<input value={project.demoUrl} type="url" pattern="https://.*" maxLength={1000} onChange={(event) => edit(project.id, { demoUrl: event.target.value })} placeholder="https://your-project.example" /></label></div>
    </div>)}
  </div>;
}
