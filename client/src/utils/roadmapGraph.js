export const NODE_LABELS = {
  prerequisite: "Prerequisite", topic: "Learn", practice: "Practice", project: "Project", milestone: "Milestone",
};

// Longest-path layers keep every prerequisite above its dependent topics.
// Centering each layer makes independent branches visible without another layout dependency.
export const layoutRoadmap = (nodes, edges) => {
  const depth = new Map(nodes.map((node) => [node.id, 0]));
  const incoming = new Map(nodes.map((node) => [node.id, 0]));
  const children = new Map(nodes.map((node) => [node.id, []]));
  edges.forEach(({ source, target }) => {
    if (children.has(source) && incoming.has(target)) {
      children.get(source).push(target);
      incoming.set(target, incoming.get(target) + 1);
    }
  });
  const queue = nodes.filter((node) => !incoming.get(node.id)).map((node) => node.id);
  for (let i = 0; i < queue.length; i++) {
    const id = queue[i];
    children.get(id).forEach((target) => {
      depth.set(target, Math.max(depth.get(target), depth.get(id) + 1));
      incoming.set(target, incoming.get(target) - 1);
      if (!incoming.get(target)) queue.push(target);
    });
  }
  const layers = new Map();
  nodes.forEach((node) => {
    const row = depth.get(node.id);
    if (!layers.has(row)) layers.set(row, []);
    layers.get(row).push(node);
  });
  const positions = new Map();
  layers.forEach((layer, row) => layer.forEach((node, column) => {
    positions.set(node.id, { x: (column - (layer.length - 1) / 2) * 340, y: row * 250 });
  }));
  return positions;
};

export const getRoadmapProgress = (roadmap) => {
  const completedCount = roadmap.nodes.filter((node) => node.completed).length;
  const totalHours = roadmap.nodes.reduce((sum, node) => sum + node.estimatedHours, 0);
  return {
    completedCount, totalNodes: roadmap.nodes.length,
    percentage: Math.round(completedCount / Math.max(roadmap.nodes.length, 1) * 100),
    totalHours, estimatedWeeks: Math.ceil(totalHours / roadmap.hoursPerWeek),
  };
};

export const getPrerequisites = (roadmap, nodeId) => {
  const ids = new Set(roadmap.edges.filter((edge) => edge.target === nodeId).map((edge) => edge.source));
  return roadmap.nodes.filter((node) => ids.has(node.id));
};
