import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth, useClerk } from "@clerk/clerk-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FiBookOpen, FiCheckCircle, FiClock, FiCompass, FiLayers, FiLoader, FiMap, FiPlus, FiZap } from "react-icons/fi";
import { AppContext } from "../context/AppContext";
import RoadmapCanvas from "../components/roadmap/RoadmapCanvas";
import TopicPanel from "../components/roadmap/TopicPanel";
import { roadmapPreview } from "../data/roadmapPreview";
import { getPrerequisites, getRoadmapProgress } from "../utils/roadmapGraph";
import "../styles/learning-roadmap.css";

const suggestions = ["React", "Python", "Machine Learning", "UI/UX Design", "DevOps"];
const messageFor = (error) => error.response?.data?.message || (error.code === "ECONNABORTED" ? "The request took too long. Please try again." : error.message === "Please sign in again to continue." ? error.message : "Could not reach the server. Check your connection and try again.");
const summaryFor = (roadmap) => ({
  _id: roadmap._id, skill: roadmap.skill, title: roadmap.title, description: roadmap.description,
  level: roadmap.level, hoursPerWeek: roadmap.hoursPerWeek, progress: roadmap.progress,
});

function RoadmapWorkspace({ userId, getToken }) {
  const { backendUrl } = useContext(AppContext);
  const { openSignIn } = useClerk();
  const { roadmapId } = useParams();
  const navigate = useNavigate();
  const [skill, setSkill] = useState("");
  const [level, setLevel] = useState("beginner");
  const [hoursPerWeek, setHoursPerWeek] = useState(5);
  const [roadmap, setRoadmap] = useState(() => structuredClone(roadmapPreview));
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedId, setSelectedId] = useState(roadmapPreview.nodes[0].id);
  const [generating, setGenerating] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(Boolean(userId));
  const [openingId, setOpeningId] = useState("");
  const [failedId, setFailedId] = useState("");
  const [completionSaving, setCompletionSaving] = useState(false);
  const [error, setError] = useState("");
  const [generationError, setGenerationError] = useState(null);
  const [libraryError, setLibraryError] = useState("");
  const [reload, setReload] = useState(0);
  const [layoutStatus, setLayoutStatus] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const loadedId = useRef("preview");
  const alive = useRef(true);
  const generationAbort = useRef(null);
  const activeId = useRef("preview");
  const queuedPositions = useRef(new Map());
  const savingLayout = useRef(false);
  const isPreview = roadmap._id === "preview";
  const mapLoading = Boolean(userId && roadmapId && roadmap._id !== roadmapId && failedId !== roadmapId);
  const progress = getRoadmapProgress(roadmap);
  const selectedNode = roadmap.nodes.find((node) => node.id === selectedId);
  const nextNode = roadmap.nodes.find((node) => !node.completed && getPrerequisites(roadmap, node.id).every((parent) => parent.completed));
  const busy = generating || mapLoading || completionSaving;

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; generationAbort.current?.abort(); };
  }, []);

  const request = useCallback(async (path, options = {}) => {
    const token = await getToken();
    if (!token) throw new Error("Please sign in again to continue.");
    const response = await axios({
      url: `${backendUrl}/api/roadmaps${path}`, timeout: 20000, ...options,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.data.success) throw new Error(response.data.message || "Request failed.");
    return response.data;
  }, [backendUrl, getToken]);

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    request("/", { signal: controller.signal }).then(({ roadmaps: saved }) => {
      if (controller.signal.aborted) return;
      setRoadmaps(saved);
      setLibraryError("");
    }).catch((err) => {
      if (!controller.signal.aborted) setLibraryError(messageFor(err));
    }).finally(() => { if (!controller.signal.aborted) setLibraryLoading(false); });
    return () => controller.abort();
  }, [userId, request, reload]);

  // A direct URL reopens the saved map. Otherwise open the most recently updated one.
  useEffect(() => {
    if (userId && !roadmapId && roadmaps.length && loadedId.current === "preview") {
      navigate(`/learning-roadmap/${roadmaps[0]._id}`, { replace: true });
    }
  }, [userId, roadmapId, roadmaps, navigate]);

  useEffect(() => {
    if (!userId || !roadmapId || loadedId.current === roadmapId) return;
    const controller = new AbortController();
    request(`/${roadmapId}`, { signal: controller.signal }).then(({ roadmap: saved }) => {
      if (controller.signal.aborted) return;
      loadedId.current = saved._id;
      activeId.current = saved._id;
      queuedPositions.current.clear();
      setRoadmap(saved);
      setSelectedId((saved.nodes.find((node) => !node.completed) || saved.nodes[0]).id);
      setError("");
      setLayoutStatus("Layout saved");
      setFailedId("");
      setOpeningId("");
    }).catch((err) => {
      if (!controller.signal.aborted) { setError(messageFor(err)); setFailedId(roadmapId); setOpeningId(""); }
    });
    return () => controller.abort();
  }, [userId, roadmapId, request, reload]);

  useEffect(() => {
    if (!generating) return;
    const start = Date.now();
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [generating]);

  const remember = (saved) => {
    const summary = summaryFor(saved);
    setRoadmaps((current) => [summary, ...current.filter((item) => item._id !== saved._id)].slice(0, 50));
  };

  const generate = async (event) => {
    event.preventDefault();
    if (!userId) { openSignIn(); return; }
    if (busy) return;
    setError("");
    setGenerationError(null);
    setGenerating(true);
    setElapsed(0);
    const controller = new AbortController();
    generationAbort.current = controller;
    try {
      const { roadmap: saved } = await request("/generate", {
        method: "POST", data: { skill: skill.trim(), level, hoursPerWeek },
        timeout: 105000, signal: controller.signal,
      });
      if (!alive.current) return;
      loadedId.current = saved._id;
      activeId.current = saved._id;
      queuedPositions.current.clear();
      setRoadmap(saved);
      remember(saved);
      setSelectedId(saved.nodes[0].id);
      setLayoutStatus("Saved to your account");
      navigate(`/learning-roadmap/${saved._id}`);
      requestAnimationFrame(() => document.querySelector(".lr-workspace")?.scrollIntoView({ block: "start", behavior: "smooth" }));
    } catch (err) {
      if (alive.current && !controller.signal.aborted) setGenerationError({ message: messageFor(err), retryable: err.response?.data?.retryable !== false });
    } finally {
      if (alive.current) setGenerating(false);
    }
  };

  const completeNode = async (node) => {
    if (completionSaving) return;
    if (isPreview) {
      setRoadmap((current) => ({ ...current, nodes: current.nodes.map((item) => item.id === node.id ? { ...item, completed: !item.completed } : item) }));
      return;
    }
    setCompletionSaving(true);
    setError("");
    try {
      const { roadmap: saved } = await request(`/${roadmap._id}/nodes/${encodeURIComponent(node.id)}`, {
        method: "PATCH", data: { completed: !node.completed },
      });
      if (!alive.current || activeId.current !== saved._id) return;
      // Keep this canvas's local positions; completion only changes learning progress.
      setRoadmap((current) => ({ ...current, nodes: current.nodes.map((item) => item.id === node.id ? { ...item, completed: !node.completed } : item), progress: saved.progress }));
      remember(saved);
    } catch (err) {
      if (alive.current) setError(messageFor(err));
    } finally { if (alive.current) setCompletionSaving(false); }
  };

  // Serialize layout writes and coalesce repeated drags so older requests cannot win.
  const saveLayout = async (positions) => {
    if (isPreview) { setLayoutStatus("Preview layout"); return; }
    const id = roadmap._id;
    positions.forEach((position) => queuedPositions.current.set(position.id, position));
    if (savingLayout.current) return;
    savingLayout.current = true;
    setLayoutStatus("Saving layout…");
    try {
      while (queuedPositions.current.size && activeId.current === id && alive.current) {
        const batch = [...queuedPositions.current.values()];
        queuedPositions.current.clear();
        try { await request(`/${id}/layout`, { method: "PATCH", data: { positions: batch } }); } catch (err) {
          batch.forEach((position) => { if (!queuedPositions.current.has(position.id)) queuedPositions.current.set(position.id, position); });
          throw err;
        }
      }
      if (alive.current && activeId.current === id) setLayoutStatus("Layout saved");
    } catch (err) {
      if (alive.current && activeId.current === id) {
        setLayoutStatus("Layout not saved");
        setError(`${messageFor(err)} Your layout is still visible; move a box or use Arrange to retry saving.`);
      }
    } finally { savingLayout.current = false; }
  };

  const openSaved = (id) => {
    if (!id || busy || savingLayout.current) return;
    if (id === loadedId.current) return;
    setOpeningId(id);
    setFailedId("");
    setError("");
    navigate(`/learning-roadmap/${id}`);
  };

  const selectNode = (id) => {
    setSelectedId(id);
    if (window.matchMedia("(max-width: 850px)").matches) {
      requestAnimationFrame(() => document.querySelector(".lr-topic-panel")?.scrollIntoView({ block: "start", behavior: "smooth" }));
    }
  };

  return (
    <main className="learning-roadmap">
      <div className="lr-shell">
        <header className="lr-hero">
          <div className="lr-hero-copy"><span className="lr-eyebrow"><FiCompass /> HIREPATH LEARNING LAB</span><h1>A clear path.<br /><span>A new possibility.</span></h1><p>Turn any skill into a visual learning journey. Know what to learn, what to build, and where to go next.</p><div className="lr-hero-tags"><span><FiZap /> Powered by Gemini</span><span><FiCheckCircle /> Built around your pace</span></div></div>
          <form id="roadmap-generator" className="lr-generator" onSubmit={generate}>
            <label htmlFor="learning-skill" className="lr-form-title"><FiMap /> What do you want to learn?</label>
            <div className="lr-input-wrap"><FiBookOpen /><input id="learning-skill" value={skill} onChange={(event) => setSkill(event.target.value)} placeholder="Try Python, React, product design…" minLength={2} maxLength={100} required disabled={generating} autoComplete="off" /></div>
            <div className="lr-form-options"><label htmlFor="learning-level">Starting level<select id="learning-level" value={level} onChange={(event) => setLevel(event.target.value)} disabled={generating}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label><label htmlFor="learning-pace">Weekly commitment<select id="learning-pace" value={hoursPerWeek} onChange={(event) => setHoursPerWeek(Number(event.target.value))} disabled={generating}><option value={3}>3 hours / week</option><option value={5}>5 hours / week</option><option value={10}>10 hours / week</option><option value={20}>20 hours / week</option><option value={40}>40 hours / week</option></select></label></div>
            <button type="submit" className="lr-button lr-generate-button" disabled={busy || libraryLoading}><span>{generating ? <FiLoader className="lr-spin" /> : <FiZap />}{generating ? "Designing your learning path…" : userId ? "Generate my roadmap" : "Sign in & generate roadmap"}</span><span className="lr-ai-badge">AI</span></button>
            <div className="lr-suggestions"><span>Explore</span>{suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => setSkill(suggestion)} disabled={generating}>{suggestion}</button>)}</div>
          </form>
        </header>

        {generating && <div className="lr-generation-status" role="status" aria-live="polite"><FiLoader className="lr-spin" /><div><strong>{elapsed < 12 ? "Mapping the foundations and prerequisites…" : elapsed < 35 ? "Connecting topics, practice and projects…" : "Preparing explanations and learning resources…"}</strong><p>We automatically retry if the AI service is busy. This can take up to 90 seconds.</p></div></div>}
        {generationError && <div className="lr-error" role="alert"><span>{generationError.message}</span>{generationError.retryable && <button type="submit" form="roadmap-generator" disabled={busy}>Try again</button>}<button type="button" onClick={() => setGenerationError(null)} aria-label="Dismiss generation error">×</button></div>}
        {error && <div className="lr-error" role="alert"><span>{error}</span>{failedId && <button type="button" onClick={() => { setFailedId(""); setReload((value) => value + 1); }}>Retry opening</button>}<button type="button" onClick={() => setError("")} aria-label="Dismiss error">×</button></div>}
        {libraryError && <div className="lr-error" role="alert"><span>Your saved roadmaps could not be loaded. {libraryError}</span><button type="button" onClick={() => { setLibraryLoading(true); setReload((value) => value + 1); }}>Retry</button></div>}
        {!userId && roadmapId && <div className="lr-info"><span>Sign in to open your saved roadmap.</span><button type="button" onClick={() => openSignIn()}>Sign in</button></div>}

        <section className="lr-workspace" aria-label="Learning roadmap workspace" aria-busy={mapLoading || libraryLoading}>
          <div className="lr-workspace-heading"><div><div className="lr-map-eyebrow"><span className={isPreview ? "lr-preview-badge" : "lr-saved-badge"}>{isPreview ? "INTERACTIVE PREVIEW" : "YOUR LEARNING ROADMAP"}</span><span>{roadmap.level} · {roadmap.hoursPerWeek}h / week</span></div><h2>{roadmap.title}</h2><p>{roadmap.description}</p></div><div className="lr-library"><label htmlFor="saved-roadmaps"><FiLayers /> My roadmaps</label><select id="saved-roadmaps" value={openingId || (isPreview ? "" : roadmap._id)} onChange={(event) => openSaved(event.target.value)} disabled={!userId || busy || libraryLoading}><option value="" disabled>{libraryLoading ? "Loading your library…" : roadmaps.length ? "Choose a saved roadmap" : "Your saved paths will appear here"}</option>{roadmaps.map((item) => <option key={item._id} value={item._id}>{item.skill} · {item.progress?.percentage ?? 0}% complete</option>)}</select></div></div>

          <div className="lr-stats"><div className="lr-progress-stat"><span className="lr-stat-icon"><FiCheckCircle /></span><div><strong>{progress.percentage}% <small>complete</small></strong><span>{progress.completedCount} of {progress.totalNodes} steps{isPreview ? " · preview" : ""}</span></div><div className="lr-progress-track" role="progressbar" aria-label="Roadmap completion" aria-valuenow={progress.percentage} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress.percentage}%` }} /></div></div><div className="lr-stat"><FiClock /><div><strong>{progress.totalHours} <small>hours</small></strong><span>Estimated learning time</span></div></div><div className="lr-stat"><FiCompass /><div><strong>~{progress.estimatedWeeks} <small>weeks</small></strong><span>At your chosen pace</span></div></div><button type="button" className="lr-next-step" disabled={!nextNode || mapLoading} onClick={() => setSelectedId(nextNode.id)}>{nextNode ? <><FiPlus /> Next unfinished step</> : <><FiCheckCircle /> Roadmap complete</>}</button></div>

          {isPreview && <div className="lr-preview-note"><FiCompass /><p>This is an example React roadmap. Explore the boxes and try completion tracking, then generate a personal path for any skill.</p></div>}
          <div className="lr-legend" aria-label="Roadmap node types"><span><i className="lr-legend-prerequisite" />Prerequisite</span><span><i className="lr-legend-topic" />Learn</span><span><i className="lr-legend-practice" />Practice</span><span><i className="lr-legend-project" />Project</span><span><i className="lr-legend-milestone" />Milestone</span><span><i className="lr-legend-complete" />Completed</span></div>
          {mapLoading ? <div className="lr-map-loading" role="status"><FiLoader className="lr-spin" /> Opening your learning path…</div> : <div className={`lr-map-grid${selectedNode ? " has-topic" : ""}`}><RoadmapCanvas key={roadmap._id} roadmap={roadmap} selectedId={selectedId} onSelect={selectNode} onSaveLayout={saveLayout} layoutStatus={layoutStatus} /><TopicPanel roadmap={roadmap} node={selectedNode} onComplete={completeNode} onSelect={selectNode} onClose={() => setSelectedId(null)} saving={completionSaving} isPreview={isPreview} /></div>}
          <div className="lr-workspace-footnote"><span><FiCheckCircle />{isPreview ? "Example content · progress is temporary" : "Private to your account · progress saved automatically"}</span><span>AI resources and time estimates may need review.</span></div>
        </section>
      </div>
    </main>
  );
}

export default function LearningRoadmap() {
  const { isLoaded, userId, getToken } = useAuth();
  if (!isLoaded) return <main className="learning-roadmap lr-map-loading" role="status"><FiLoader className="lr-spin" /> Loading your learning space…</main>;
  // Changing accounts remounts all private state and cancels outstanding generation.
  return <RoadmapWorkspace key={userId || "guest"} userId={userId} getToken={getToken} />;
}
