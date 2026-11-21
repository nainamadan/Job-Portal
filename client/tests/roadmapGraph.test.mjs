import { test } from "node:test";
import assert from "node:assert/strict";
import { layoutRoadmap, getPrerequisites, getRoadmapProgress } from "../src/utils/roadmapGraph.js";
import { roadmapPreview } from "../src/data/roadmapPreview.js";

test("branching roadmap layout keeps prerequisites above dependents without overlapping boxes", () => {
  const { nodes, edges } = roadmapPreview;
  const layout = layoutRoadmap(nodes, edges);
  assert.equal(layout.size, nodes.length);
  assert.equal(new Set([...layout.values()].map(({ x, y }) => `${x},${y}`)).size, nodes.length);
  for (const { source, target } of edges) assert.ok(layout.get(source).y < layout.get(target).y);
  const positions = [...layout.values()];
  positions.forEach((a, i) => positions.slice(i + 1).forEach((b) => {
    assert.ok(a.y !== b.y || Math.abs(a.x - b.x) >= 320, "nodes on the same row have enough space");
  }));
  assert.equal(layout.get("styling").y, layout.get("state").y, "parallel learning branches share a level");
  assert.deepEqual(getPrerequisites(roadmapPreview, "first-project").map((node) => node.id).sort(), ["rendering", "styling"]);
  assert.deepEqual(getPrerequisites(roadmapPreview, "foundations"), []);
});

test("roadmap progress supports completion, undo, and realistic pacing", () => {
  const roadmap = structuredClone(roadmapPreview);
  const initial = getRoadmapProgress(roadmap);
  assert.equal(initial.percentage, 0);
  assert.equal(initial.totalNodes, 14);
  roadmap.nodes[0].completed = true;
  assert.equal(getRoadmapProgress(roadmap).percentage, 7);
  roadmap.nodes.forEach((node) => { node.completed = true; });
  assert.equal(getRoadmapProgress(roadmap).percentage, 100);
  roadmap.nodes[0].completed = false;
  assert.equal(getRoadmapProgress(roadmap).completedCount, 13);
  roadmap.hoursPerWeek = 10;
  assert.equal(getRoadmapProgress(roadmap).estimatedWeeks, Math.ceil(initial.totalHours / 10));
});
