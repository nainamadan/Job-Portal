import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ReactFlow, Background, Controls, MiniMap, MarkerType } from "@xyflow/react";
import { FiMaximize, FiRefreshCw } from "react-icons/fi";
import { useTheme } from "../../utils/theme";
import { layoutRoadmap, getPrerequisites } from "../../utils/roadmapGraph";
import RoadmapNode from "./RoadmapNode";
import "@xyflow/react/dist/style.css";

const nodeTypes = { learning: RoadmapNode };
const fitOptions = { padding: 0.16, maxZoom: 0.8 };

// This component is keyed by roadmap id so a newly opened map gets its own viewport.
export default function RoadmapCanvas({ roadmap, selectedId, onSelect, onSaveLayout, layoutStatus }) {
  const theme = useTheme();
  const [instance, setInstance] = useState(null);
  const previousSelection = useRef(selectedId);
  const initialFit = useMemo(() => ({ ...fitOptions, maxZoom: 0.9, nodes: roadmap.nodes.slice(0, 5).map(({ id }) => ({ id })) }), [roadmap.nodes]);
  const automatic = useMemo(() => layoutRoadmap(roadmap.nodes, roadmap.edges), [roadmap.nodes, roadmap.edges]);
  const [flowNodes, setFlowNodes] = useState(() => roadmap.nodes.map((node) => ({
    id: node.id, type: "learning", position: node.position || automatic.get(node.id), data: node,
  })));
  const nodes = useMemo(() => roadmap.nodes.map((node) => ({
    ...flowNodes.find((item) => item.id === node.id),
    selected: selectedId === node.id,
    data: { ...node, ready: getPrerequisites(roadmap, node.id).every((parent) => parent.completed) },
    ariaLabel: `${node.title}, ${node.kind}, ${node.completed ? "completed" : "not completed"}. Press Enter to view learning details.`,
  })), [roadmap, selectedId, flowNodes]);
  const edges = useMemo(() => roadmap.edges.map((edge) => {
    const complete = roadmap.nodes.find((node) => node.id === edge.source)?.completed;
    const color = complete ? "#10b981" : theme === "dark" ? "#64748b" : "#94a3b8";
    return {
      ...edge, type: "smoothstep", style: { stroke: color, strokeWidth: 1.8 },
      markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color },
    };
  }), [roadmap, theme]);
  const handleChanges = useCallback((changes) => {
    // React Flow 13 batches measurements, dragging, positions and selection in a Changeset.
    // Preserve all of them; dropping measured dimensions causes drag/reinitialization loops.
    setFlowNodes((current) => changes.applyTo(current));
  }, []);
  useEffect(() => {
    if (selectedId && previousSelection.current !== selectedId) {
      instance?.fitView({ nodes: [{ id: selectedId }], minZoom: 0.6, maxZoom: 0.85, padding: 0.35, duration: 250 });
    }
    previousSelection.current = selectedId;
  }, [selectedId, instance]);
  const resetLayout = () => {
    setFlowNodes((current) => current.map((node) => ({ ...node, position: automatic.get(node.id) })));
    onSaveLayout(roadmap.nodes.map((node) => ({ id: node.id, ...automatic.get(node.id) })));
    requestAnimationFrame(() => instance?.fitView({ ...fitOptions, duration: 300 }));
  };
  return (
    <div className="lr-canvas-wrap">
      <div className="lr-canvas-toolbar">
        <div><span className="lr-live-dot" /> Visual learning path <span className="lr-canvas-save" role="status">{layoutStatus}</span></div>
        <div className="lr-canvas-actions">
          <button type="button" onClick={resetLayout} title="Arrange nodes automatically" aria-label="Arrange nodes automatically"><FiRefreshCw /><span>Arrange</span></button>
          <button type="button" onClick={() => instance?.fitView({ ...fitOptions, duration: 300 })} title="Fit full roadmap" aria-label="Fit full roadmap"><FiMaximize /><span>Fit view</span></button>
        </div>
      </div>
      <div className="lr-canvas" data-testid="roadmap-canvas">
        <ReactFlow
          nodes={nodes} edges={edges} nodeTypes={nodeTypes}
          onNodesChange={handleChanges} onInit={setInstance}
          onNodeClick={(_event, node) => onSelect(node.id)}
          onNodeDragStop={(_event, node) => onSaveLayout([{ id: node.id, ...node.position }])}
          onKeyDown={(event) => {
            const id = event.target.closest(".react-flow__node")?.dataset.id;
            if (id && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onSelect(id); }
          }}
          fitView fitViewOptions={initialFit} minZoom={0.12} maxZoom={1.6}
          nodesConnectable={false} edgesReconnectable={false} deleteKeyCode={null}
          forceColorMode={theme} aria-label="Interactive learning roadmap. Drag to pan, scroll to zoom, select a topic to explore it."
        >
          <Background color={theme === "dark" ? "#334155" : "#cbd5e1"} gap={22} size={1} />
          <Controls showInteractive={false} />
          <MiniMap pannable zoomable nodeColor={(node) => node.data.completed ? "#10b981" : node.data.kind === "project" ? "#a78bfa" : "#60a5fa"} />
        </ReactFlow>
      </div>
      <div className="lr-canvas-footer"><span>Drag to pan · Scroll or pinch to zoom · Select a box to learn</span><span>Move boxes to make this path yours</span></div>
    </div>
  );
}
