import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { FiCheckCircle, FiFolder, FiRefreshCw } from "react-icons/fi";
import { AppContext } from "../../context/AppContext";
import VaultDialog from "./VaultDialog";
import ProofCard from "./ProofCard";

function ReviewForm({ proof, onSave, saving }) {
  const existing = proof.reviews?.[0];
  const [status, setStatus] = useState(existing?.status || "approved");
  const [note, setNote] = useState(existing?.note || "");
  const [inspected, setInspected] = useState(false);
  return <form className="spv-review-form" onSubmit={(event) => { event.preventDefault(); onSave(proof, { status, note, reviewedEvidence: inspected }); }}>
    <h4>Your company’s review</h4><p>Inspect the code, try the demo if available, and assess the candidate’s contribution against the stated skills{proof.challenge ? " and challenge criteria" : ""}.</p>
    <fieldset disabled={saving}>
      <label>Review decision<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="approved">Approve this evidence</option><option value="needs_work">Request improvements</option></select></label>
      <label>Feedback for the candidate<textarea value={note} onChange={(event) => setNote(event.target.value)} minLength={10} maxLength={1500} rows={3} placeholder="Explain what the evidence demonstrates, or what needs improving." required /></label>
      <label className="spv-checkbox"><input type="checkbox" checked={inspected} onChange={(event) => setInspected(event.target.checked)} required />I inspected this version’s evidence and the candidate’s contribution.</label>
      <button type="submit" className="spv-button spv-primary"><FiCheckCircle />{saving ? "Saving review…" : existing ? "Update review" : "Save review"}</button>
    </fieldset>
  </form>;
}

export default function RecruiterProofVault({ application, onClose }) {
  const { backendUrl, companyToken } = useContext(AppContext);
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [reload, setReload] = useState(0);
  const mounted = useRef(true);
  const mutation = useRef(false);
  const api = `${backendUrl}/api/skill-proofs/company/applications/${application._id}`;
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true); setError("");
      try {
        const { data } = await axios.get(api, { headers: { token: companyToken }, signal: controller.signal });
        if (!controller.signal.aborted) setProofs(data.proofs);
      } catch (err) { if (!controller.signal.aborted) setError(err.response?.data?.message || "Could not load this candidate’s skill proofs."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    };
    load();
    return () => controller.abort();
  }, [api, companyToken, reload]);
  const saveReview = async (proof, input) => {
    if (mutation.current) return;
    mutation.current = true; setSavingId(proof._id); setError("");
    try {
      const { data } = await axios.put(`${api}/${proof._id}/review`, { ...input, revision: proof.revision }, { headers: { token: companyToken } });
      if (mounted.current) setProofs((old) => old.map((item) => item._id === proof._id ? data.proof : item));
    } catch (err) { if (mounted.current) setError(err.response?.data?.message || "Your review could not be saved. Please try again."); }
    finally { mutation.current = false; if (mounted.current) setSavingId(null); }
  };
  return <VaultDialog title={`${application.applicantName || application.userId?.name || "Candidate"} · Skill Proof Vault`} onClose={onClose} busy={!!savingId}>
    <div className="spv-recruiter-heading"><p>Current evidence for {application.jobId?.title || "this application"}. Reviews are visible to the candidate; only your company’s feedback is shown here.</p><button className="spv-icon-button" aria-label="Refresh candidate proofs" disabled={loading || !!savingId} onClick={() => setReload((value) => value + 1)}><FiRefreshCw /></button></div>
    {error && <div className="spv-error" role="alert">{error}<button disabled={!!savingId} onClick={() => setReload((value) => value + 1)}>Refresh proofs</button></div>}
    {loading ? <div className="spv-empty" role="status">Loading candidate evidence…</div> : !proofs.length && !error ? <div className="spv-empty"><FiFolder /><h3>No skill proofs yet.</h3><p>This candidate has not added evidence to their vault.</p></div> : <div className="spv-recruiter-proofs">{proofs.map((proof) => <ProofCard key={proof._id} proof={proof} expanded><ReviewForm key={`${proof._id}-${proof.revision}-${proof.reviews?.[0]?.reviewedAt || "new"}`} proof={proof} onSave={saveReview} saving={!!savingId} /></ProofCard>)}</div>}
    <p className="spv-muted spv-small">Approval records your company’s assessment of this version. Candidate edits clear all reviews. Linked content may change independently; discuss authorship and technical decisions in the interview.</p>
  </VaultDialog>;
}
