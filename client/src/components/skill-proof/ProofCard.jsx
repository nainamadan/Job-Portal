import { FiArrowUpRight, FiCheckCircle, FiClock, FiCode, FiExternalLink, FiMessageSquare } from "react-icons/fi";
import "../../styles/skill-proof.css";

export default function ProofCard({ proof, children, expanded = false }) {
  const approved = proof.reviews?.some((review) => review.status === "approved");
  const needsWork = proof.reviews?.some((review) => review.status === "needs_work");
  return (
    <article className="spv-proof-card">
      <div className="spv-card-top"><span className="spv-project-icon"><FiCode /></span><span className={`spv-badge ${approved ? "spv-approved" : needsWork ? "spv-needs-work" : "spv-pending"}`}>{approved ? <FiCheckCircle /> : needsWork ? <FiMessageSquare /> : <FiClock />}{approved ? "Recruiter approved" : needsWork ? "Improvements requested" : "Awaiting review"}</span></div>
      <div className="spv-proof-type">{proof.challenge ? `${proof.challenge.skill} challenge` : "Independent project"} · Version {proof.revision}</div>
      <h3>{proof.title}</h3>
      <div className="spv-tags">{proof.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
      <p className="spv-proof-summary">{proof.summary}</p>
      <div className="spv-evidence-links">
        <a href={proof.sourceUrl} target="_blank" rel="noopener noreferrer"><FiCode /> Source code <FiArrowUpRight /></a>
        {proof.demoUrl && <a href={proof.demoUrl} target="_blank" rel="noopener noreferrer"><FiExternalLink /> Live demo <FiArrowUpRight /></a>}
        {proof.writeupUrl && <a href={proof.writeupUrl} target="_blank" rel="noopener noreferrer">Walkthrough <FiArrowUpRight /></a>}
      </div>
      <details className="spv-proof-details" open={expanded || undefined}>
        <summary>Contribution & review feedback</summary>
        <h4>My contribution & technical decisions</h4><p>{proof.contribution}</p>
        {proof.challenge && <><h4>Challenge acceptance criteria</h4><ul>{proof.challenge.criteria.map((criterion) => <li key={criterion}>{criterion}</li>)}</ul></>}
        {proof.reviews?.length ? <div className="spv-reviews">{proof.reviews.map((review) => <div key={review.companyId} className="spv-review"><div><strong>{review.companyName}</strong><span>{review.status === "approved" ? "Approved" : "Improvements requested"} · {new Date(review.reviewedAt).toLocaleDateString()}</span></div><p>{review.note}</p></div>)}</div> : <p className="spv-muted">No recruiter review yet. Submission does not automatically verify a skill.</p>}
      </details>
      {children && <footer className="spv-card-actions">{children}</footer>}
    </article>
  );
}
