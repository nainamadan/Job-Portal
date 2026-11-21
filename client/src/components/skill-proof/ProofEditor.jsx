import { useState } from "react";
import { FiCheck, FiLink, FiSave } from "react-icons/fi";
import VaultDialog from "./VaultDialog";

export default function ProofEditor({ proof, challenge, challenges, onSave, onClose, saving, error }) {
  const [form, setForm] = useState(() => ({
    title: proof?.title || challenge?.title || "", skills: proof?.skills.join(", ") || challenge?.skill || "",
    challengeId: proof?.challengeId || challenge?.id || "", summary: proof?.summary || "", contribution: proof?.contribution || "",
    sourceUrl: proof?.sourceUrl || "", demoUrl: proof?.demoUrl || "", writeupUrl: proof?.writeupUrl || "",
  }));
  const selectedChallenge = challenges.find((item) => item.id === form.challengeId) || (proof?.challengeId === form.challengeId ? proof.challenge : null);
  const field = (name) => ({ value: form[name], onChange: (event) => setForm((old) => ({ ...old, [name]: event.target.value })) });
  const submit = (event) => {
    event.preventDefault();
    onSave({ ...form, skills: form.skills.split(",").map((skill) => skill.trim()).filter(Boolean), ...(proof ? { revision: proof.revision } : {}) });
  };
  return (
    <VaultDialog title={proof ? "Edit your skill proof" : "Add a skill proof"} onClose={onClose} busy={saving}>
      <form className="spv-form" onSubmit={submit}>
        <p className="spv-muted">Show working code and explain the decisions you made. Recruiters at companies you apply to can review everything in your vault.</p>
        {proof?.reviews?.length > 0 && <div className="spv-notice">Saving an edit clears the current reviews and approvals. The updated version will need a fresh review.</div>}
        {error && <div className="spv-error" role="alert">{error}</div>}
        <fieldset disabled={saving}>
          <label>Proof type<select {...field("challengeId")}><option value="">My own project</option>{challenges.map((item) => <option key={item.id} value={item.id}>{item.skill} · {item.title}</option>)}{proof?.challenge && !challenges.some((item) => item.id === proof.challengeId) && <option value={proof.challengeId}>{proof.challenge.title}</option>}</select></label>
          {selectedChallenge && <div className="spv-criteria"><strong>What your submission should demonstrate</strong><ul>{selectedChallenge.criteria.map((criterion) => <li key={criterion}><FiCheck />{criterion}</li>)}</ul><small>Include {selectedChallenge.skill} in the skills below.</small></div>}
          <label>Project title<input {...field("title")} minLength={5} maxLength={120} placeholder="e.g. Accessible job search with React" required /></label>
          <label>Skills demonstrated<input {...field("skills")} maxLength={328} placeholder="React, JavaScript, API integration" required /><small>Separate up to 8 skills with commas.</small></label>
          <label>What did you build?<textarea {...field("summary")} minLength={40} maxLength={3000} rows={4} placeholder="Describe the problem, the working solution and how someone can test it." required /><small>40–3000 characters.</small></label>
          <label>Your contribution & technical decisions<textarea {...field("contribution")} minLength={40} maxLength={3000} rows={4} placeholder="What did you personally implement? Explain one hard decision, your tests and a limitation. Mention collaborators or starter code." required /><small>40–3000 characters. Be specific about your own work.</small></label>
          <label><span><FiLink /> Source code link</span><input {...field("sourceUrl")} type="url" pattern="https://.*" maxLength={1500} placeholder="https://github.com/you/project" required /><small>Required. Link to the repository, gist or notebook a recruiter can inspect.</small></label>
          <div className="spv-form-row"><label>Live demo <small>(optional)</small><input {...field("demoUrl")} type="url" pattern="https://.*" maxLength={1500} placeholder="https://your-project.example" /></label><label>Walkthrough or video <small>(optional)</small><input {...field("writeupUrl")} type="url" pattern="https://.*" maxLength={1500} placeholder="https://your-walkthrough.example" /></label></div>
        </fieldset>
        <p className="spv-muted spv-small">Use HTTPS links that reviewers can open. Only add work you are allowed to share; keep credentials out of your project and notes.</p>
        <div className="spv-form-actions"><button type="button" className="spv-button spv-secondary" disabled={saving} onClick={onClose}>Cancel</button><button type="submit" className="spv-button spv-primary" disabled={saving}><FiSave />{saving ? "Saving proof…" : proof ? "Save new version" : "Save proof"}</button></div>
      </form>
    </VaultDialog>
  );
}
