import { useCallback, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import ChatThread from "./ChatThread";

const POLL_MS = 10000;

const timeAgo = (value) => {
  if (!value) return "";
  const mins = Math.round((Date.now() - new Date(value).getTime()) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  if (mins < 1440) return `${Math.round(mins / 60)}h`;
  return new Date(value).toLocaleDateString([], { day: "numeric", month: "short" });
};

const Avatar = ({ who, size = "w-11 h-11" }) =>
  who.image ? (
    <img src={who.image} alt="" className={`${size} rounded-full object-cover bg-white border shrink-0`} />
  ) : (
    <span className={`${size} rounded-full bg-indigo-100 flex items-center justify-center text-xl shrink-0`}>
      {who.fallback}
    </span>
  );


/**
 * Two-pane inbox (list on the left, chat on the right; one pane at a time on phones).
 * side = "user"    -> job seeker, `getHeaders` returns Clerk Authorization header
 * side = "company" -> recruiter,  `getHeaders` returns the company token header
 */
const MessagesInbox = ({ side, getHeaders }) => {
  const { backendUrl } = useContext(AppContext);
  const [conversations, setConversations] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [active, setActive] = useState(null); // conversation summary
  const [thread, setThread] = useState(null); // full conversation
  const [jobFilter, setJobFilter] = useState("all"); // show chats for one job only

  const base = `${backendUrl}/api/messages/${side}`;
  const isUser = side === "user";

  const loadList = useCallback(
    async (silent = false) => {
      if (!silent) setListLoading(true);
      try {
        const { data } = await axios.get(`${base}/conversations`, { headers: await getHeaders() });
        if (!data.success) throw new Error(data.message);
        setConversations(data.conversations || []);
        setListError("");
      } catch (error) {
        if (!silent) setListError(error.response?.data?.message || error.message);
      } finally {
        if (!silent) setListLoading(false);
      }
    },
    [base, getHeaders]
  );

  const loadThread = useCallback(
    async (summary) => {
      try {
        const url = isUser ? `${base}/job/${summary.job?._id}` : `${base}/conversations/${summary._id}`;
        const { data } = await axios.get(url, { headers: await getHeaders() });
        if (data.success) setThread(data.conversation);
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
      }
    },
    [base, getHeaders, isUser]
  );

  useEffect(() => {
    const first = setTimeout(() => loadList(), 0);
    const timer = setInterval(() => loadList(true), POLL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [loadList]);

  // Refresh the open chat regularly so new replies show up.
  useEffect(() => {
    if (!active) return undefined;
    const first = setTimeout(() => loadThread(active), 0);
    const timer = setInterval(() => loadThread(active), POLL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [active, loadThread]);

  const open = (c) => {
    setThread(null);
    setActive(c);
    setConversations((prev) => prev.map((x) => (x._id === c._id ? { ...x, unread: 0 } : x)));
  };

  const send = async (text) => {
    try {
      const headers = await getHeaders();
      const { data } = isUser
        ? await axios.post(`${base}/send`, { jobId: active.job?._id, text }, { headers })
        : await axios.post(`${base}/conversations/${active._id}/reply`, { text }, { headers });
      if (!data.success) throw new Error(data.message);
      setThread(data.conversation);
      loadList(true);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Message could not be sent.");
      return false;
    }
  };

  // The "other person" shown for each conversation.
  const other = (c) =>
    isUser
      ? { name: c.company?.name || "Recruiter", image: c.company?.image, fallback: "🏢" }
      : { name: c.user?.name || "Job seeker", image: c.user?.image, fallback: "👤" };

  const activeWho = active ? other(active) : null;

  // Every chat belongs to one job; let people narrow the list to a single job.
  const jobOptions = [...new Map(conversations.filter((c) => c.job?._id).map((c) => [c.job._id, c.job.title])).entries()];
  const shown = jobFilter === "all" ? conversations : conversations.filter((c) => c.job?._id === jobFilter);
  const companyName = (c) => (isUser ? c.company?.name : null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex h-[calc(100vh-12rem)] min-h-[480px]">
      {/* Conversation list */}
      <aside className={`${active ? "hidden md:flex" : "flex"} w-full md:w-80 border-r border-slate-200 flex-col min-h-0`}>
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">💬 {isUser ? "Your job chats" : "Candidate chats"}</h2>
          <button onClick={() => loadList()} title="Refresh" aria-label="Refresh" className="text-slate-500 hover:text-indigo-600">
            ↻
          </button>
        </div>
        {jobOptions.length > 1 && (
          <div className="px-3 py-2 border-b border-slate-200">
            <select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              aria-label="Filter by job"
              className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">📂 All jobs ({conversations.length})</option>
              {jobOptions.map(([id, title]) => (
                <option key={id} value={id}>
                  💼 {title} ({conversations.filter((c) => c.job?._id === id).length})
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {listLoading ? (
            <p className="p-6 text-sm text-slate-500">Loading…</p>
          ) : listError ? (
            <div className="p-6 text-sm">
              <p className="text-red-600">{listError}</p>
              <button onClick={() => loadList()} className="mt-2 text-indigo-600 underline">Try again</button>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              <p className="text-3xl mb-2">📭</p>
              {isUser ? (
                <>
                  No messages yet. Open any job and press <b>Message Recruiter</b> to ask a question.
                  <Link to="/" className="block mt-3 text-indigo-600 font-semibold">Browse jobs →</Link>
                </>
              ) : (
                "No messages yet. When job seekers ask about your jobs, their messages appear here."
              )}
            </div>
          ) : (
            shown.map((c) => {
              const who = other(c);
              return (
                <button
                  key={c._id}
                  onClick={() => open(c)}
                  className={`w-full text-left px-4 py-3 flex gap-3 border-b border-slate-100 hover:bg-slate-50 transition ${
                    active?._id === c._id ? "bg-indigo-50" : ""
                  }`}
                >
                  <Avatar who={who} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <p className={`truncate text-sm ${c.unread ? "font-bold text-slate-900" : "font-semibold text-slate-800"}`}>
                        {who.name}
                      </p>
                      <span className="text-[11px] text-slate-400 shrink-0">{timeAgo(c.lastMessageAt)}</span>
                    </div>
                    <p className="text-xs text-indigo-600 truncate">💼 {c.job?.title || "Job removed"}</p>
                    <div className="flex justify-between gap-2 items-center">
                      <p className={`text-xs truncate ${c.unread ? "text-slate-800" : "text-slate-500"}`}>
                        {c.lastMessage ? `${c.lastMessage.sender === side ? "You: " : ""}${c.lastMessage.text}` : ""}
                      </p>
                      {c.unread > 0 && (
                        <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Chat */}
      <section className={`${active ? "flex" : "hidden md:flex"} flex-1 flex-col min-w-0 min-h-0`}>
        {!active ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm p-6 text-center">
            <span className="text-5xl mb-3">💬</span>
            Select a conversation to read and reply.
          </div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-3">
              <button onClick={() => setActive(null)} className="md:hidden text-slate-600 text-lg" aria-label="Back">
                ←
              </button>
              <Avatar who={activeWho} size="w-9 h-9" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 truncate">{activeWho.name}</p>
                {active.job?._id ? (
                  <Link to={`/job/${active.job._id}`} className="text-xs text-indigo-600 hover:underline truncate block">
                    💼 {active.job.title}{companyName(active) ? ` · ${companyName(active)}` : ""}{active.job.location ? ` · 📍 ${active.job.location}` : ""} ↗
                  </Link>
                ) : (
                  <p className="text-xs text-slate-500">Job removed</p>
                )}
              </div>
            </div>
            <p className="px-4 py-1.5 text-[11px] bg-indigo-50 text-indigo-700 border-b border-slate-200">
              📌 This chat is only about <b>{active.job?.title || "this job"}</b>
              {isUser ? ` with the recruiter from ${active.company?.name || "the company"}.` : ` with ${activeWho.name}.`}
            </p>
            <div className="flex-1 min-h-0">
              {thread ? (
                <ChatThread
                  messages={thread.messages || []}
                  me={side}
                  onSend={send}
                  disabled={isUser && !active.job?._id}
                  quickReplies={
                    isUser
                      ? []
                      : [
                          "Thanks for your interest! 😊",
                          "Yes, the position is still open.",
                          "We've updated the job post. Please take a look.",
                          "We'll get back to you about your application soon.",
                        ]
                  }
                />
              ) : (
                <p className="p-6 text-sm text-slate-500">Loading messages…</p>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default MessagesInbox;
