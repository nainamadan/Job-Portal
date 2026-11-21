import { useEffect, useRef } from "react";
import { FiBookOpen, FiCheck, FiCheckCircle, FiClock, FiExternalLink, FiPlay, FiX, FiFlag } from "react-icons/fi";
import { getPrerequisites, NODE_LABELS } from "../../utils/roadmapGraph";

export default function TopicPanel({ roadmap, node, onComplete, onSelect, onClose, saving, isPreview }) {
  const panel = useRef(null);
  useEffect(() => {
    if (node) panel.current?.scrollTo({ top: 0 });
  }, [node]);
  if (!node) return (
    <aside className="lr-topic-panel lr-topic-empty"><FiBookOpen /><h2>Every box is a new possibility.</h2><p>Select a topic to find an explanation, resources and a task to put it into practice.</p></aside>
  );
  const prerequisites = getPrerequisites(roadmap, node.id);
  const remaining = prerequisites.filter((parent) => !parent.completed);
  return (
    <aside className="lr-topic-panel" ref={panel} aria-label="Selected topic details">
      <div className="lr-topic-heading"><span className={`lr-kind-pill lr-kind-pill--${node.kind}`}>{NODE_LABELS[node.kind]}</span><button type="button" onClick={onClose} className="lr-icon-button" aria-label="Close topic details"><FiX /></button></div>
      <h2>{node.title}</h2>
      <div className="lr-topic-meta"><span><FiClock /> {node.estimatedHours} {node.estimatedHours === 1 ? "hour" : "hours"}</span><span className={node.completed ? "lr-text-green" : ""}>{node.completed ? <><FiCheckCircle /> Completed</> : "Self-paced learning"}</span></div>
      <p className="lr-explanation">{node.explanation}</p>
      {prerequisites.length > 0 && <section className="lr-topic-section"><h3>Before you start</h3><div className="lr-prerequisites">{prerequisites.map((parent) => <button type="button" key={parent.id} onClick={() => onSelect(parent.id)} className={parent.completed ? "is-complete" : ""}>{parent.completed && <FiCheck />}{parent.title}</button>)}</div>{remaining.length > 0 && <p className="lr-helper">{remaining.length} prerequisite{remaining.length === 1 ? " is" : "s are"} unfinished. You can still explore this topic.</p>}</section>}
      <section className="lr-topic-section"><h3><FiPlay /> Watch & learn</h3><a className="lr-resource lr-video" href={`https://www.youtube.com/results?search_query=${encodeURIComponent(node.youtubeQuery)}`} target="_blank" rel="noopener noreferrer"><span className="lr-resource-icon"><FiPlay /></span><span><strong>Find tutorials on YouTube</strong><small>{node.youtubeQuery}</small></span><FiExternalLink /></a><p className="lr-helper">Opens a tutorial search so you can choose a video that fits.</p></section>
      <section className="lr-topic-section"><h3><FiBookOpen /> Read & understand</h3><div className="lr-resources">{node.documentation.map((resource, index) => <a key={`${resource.url}-${index}`} className="lr-resource" href={resource.url} target="_blank" rel="noopener noreferrer"><span className="lr-resource-icon"><FiBookOpen /></span><span><strong>{resource.title}</strong><small>{new URL(resource.url).hostname}</small></span><FiExternalLink /></a>)}</div></section>
      <section className="lr-topic-section"><h3><FiFlag /> {node.kind === "milestone" ? "Your checkpoint" : node.kind === "project" ? "Project success criteria" : "Put it into practice"}</h3><ol className="lr-exercises">{node.exercises.map((exercise, index) => <li key={index}><span>{index + 1}</span><p>{exercise}</p></li>)}</ol></section>
      <div className="lr-complete-area"><button type="button" className={`lr-button lr-complete-button${node.completed ? " is-complete" : ""}`} onClick={() => onComplete(node)} disabled={saving}><FiCheckCircle />{saving ? "Saving progress…" : node.completed ? "Mark as incomplete" : "Mark as complete"}</button><p className="lr-helper">{isPreview ? "Preview progress lasts for this visit. Generate a roadmap to save your learning." : "Your progress is saved to your account."}</p></div>
    </aside>
  );
}
