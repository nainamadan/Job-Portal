import "dotenv/config";
import { generateLearningRoadmap } from "../utils/learningRoadmap.js";

// Makes a real Gemini request with a public example skill. Does not connect to MongoDB.
const started = Date.now();
try {
  const roadmap = await generateLearningRoadmap({ skill: "Python", level: "beginner", hoursPerWeek: 5 });
  console.log(JSON.stringify({
    success: true, nodes: roadmap.nodes.length, connections: roadmap.edges.length,
    kinds: [...new Set(roadmap.nodes.map((node) => node.kind))],
    seconds: Math.round((Date.now() - started) / 1000),
  }, null, 2));
} catch (error) {
  // Never log API keys or request headers. Diagnostic output only concerns this public example.
  console.error(JSON.stringify({ success: false, status: error.status || 500, message: error.message }, null, 2));
  if (process.argv.includes("--diagnose") && error.cause) {
    let detail = String(error.cause.message || "");
    try { detail = JSON.parse(detail).error?.message || detail; } catch { /* SDK messages are not always JSON. */ }
    const key = process.env.GEMINI_API_KEY;
    if (key) detail = detail.split(key).join("[redacted]");
    detail = detail.replace(/AIza[\w-]+/g, "[redacted]").replace(/([?&](?:key|api_key)=)[^&\s]+/gi, "$1[redacted]");
    console.error(JSON.stringify({ providerStatus: error.cause.status, providerMessage: detail.slice(0, 1200) }, null, 2));
  }
  process.exitCode = 1;
}
