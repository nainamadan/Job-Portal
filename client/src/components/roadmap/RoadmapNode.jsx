import { Handle, Position } from "@xyflow/react";
import { FiBookOpen, FiCheck, FiCode, FiFlag, FiLayers, FiTool, FiClock } from "react-icons/fi";
import { NODE_LABELS } from "../../utils/roadmapGraph";

const icons = { prerequisite: FiLayers, topic: FiBookOpen, practice: FiTool, project: FiCode, milestone: FiFlag };

export default function RoadmapNode({ data, selected }) {
  const Icon = data.completed ? FiCheck : icons[data.kind] || FiBookOpen;
  return (
    <div className={`lr-node lr-node--${data.kind}${data.completed ? " is-complete" : ""}${selected ? " is-selected" : ""}`}>
      <Handle type="target" position={Position.Top} isConnectable={false} />
      <div className="lr-node-top">
        <span className="lr-node-icon"><Icon aria-hidden="true" /></span>
        <span className="lr-node-kind">{data.completed ? "Completed" : NODE_LABELS[data.kind]}</span>
        <span className="lr-node-time"><FiClock aria-hidden="true" /> {data.estimatedHours}h</span>
      </div>
      <h3>{data.title}</h3>
      <p>{data.summary}</p>
      <span className="lr-node-hint">{data.ready ? "Ready to explore" : "Explore topic"}</span>
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
    </div>
  );
}
