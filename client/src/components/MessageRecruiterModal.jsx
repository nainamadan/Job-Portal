import { useCallback, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import ChatThread from "./ChatThread";

const QUICK_QUESTIONS = [
  "Is this position still open?",
  "Has anything changed in this job post?",
  "What is the status of my application?",
  "Is remote or hybrid work possible?",
  "What are the next steps in the hiring process?",
];

const POLL_MS = 8000;

// Pop-up chat between a signed-in job seeker and the recruiter who posted `job`.
const MessageRecruiterModal = ({ job, open, onClose }) => {
  const { backendUrl } = useContext(AppContext);
  const { getToken } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const token = await getToken();
        const { data } = await axios.get(`${backendUrl}/api/messages/user/job/${job._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) setMessages(data.conversation?.messages || []);
        setLoadError("");
      } catch (error) {
        if (!silent) setLoadError(error.response?.data?.message || error.message);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [backendUrl, getToken, job._id]
  );

  useEffect(() => {
    if (!open) return undefined;
    const first = setTimeout(() => load(), 0);
    const timer = setInterval(() => load(true), POLL_MS);
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, load, onClose]);

  const send = async (text) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/messages/user/send`,
        { jobId: job._id, text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!data.success) throw new Error(data.message);
      setMessages(data.conversation?.messages || []);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Message could not be sent.");
      return false;
    }
  };

  if (!open) return null;

  const company = job.companyId || {};

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-label={`Message ${company.name || "the recruiter"}`}
        onClick={(e) => e.stopPropagation()}
        className="recruiter-chat-panel w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-3 flex items-center gap-3">
          {company.image ? (
            <img src={company.image} alt="" className="w-10 h-10 rounded-full bg-white object-contain p-0.5" />
          ) : (
            <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">🏢</span>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{company.name || "Recruiter"}</p>
            <p className="text-xs text-indigo-100 truncate">About: {job.title}</p>
          </div>
          <Link to="/messages" onClick={onClose} className="text-xs underline text-indigo-100 hover:text-white">
            All messages
          </Link>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full hover:bg-white/20 transition">
            ✕
          </button>
        </div>

        <div className="flex-1 min-h-0">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">Loading messages…</div>
          ) : loadError ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-3">
              <span className="text-3xl">⚠️</span>
              <p className="text-sm text-red-600">{loadError}</p>
              <button onClick={() => load()} className="text-sm text-indigo-600 underline">
                Try again
              </button>
            </div>
          ) : (
            <ChatThread
              messages={messages}
              me="user"
              onSend={send}
              quickReplies={messages.some((m) => m.sender === "user") ? [] : QUICK_QUESTIONS}
              emptyHint="Ask the recruiter about this job, any updates to the post, or your application. Pick a question below or write your own."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageRecruiterModal;
