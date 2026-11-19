import { useEffect, useRef, useState } from "react";

export const MAX_MESSAGE_LENGTH = 2000;

const formatTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};

/**
 * Message list + text box, shared by the job seeker and recruiter screens.
 * `me` is "user" or "company": your own messages appear on the right.
 * `onSend(text)` must return a promise; it resolves true when the message was sent.
 */
const ChatThread = ({ messages = [], me, onSend, emptyHint, quickReplies = [], disabled = false }) => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages.length]);

  const submit = async (e) => {
    e?.preventDefault();
    const value = text.trim();
    if (!value || sending || disabled) return;
    setSending(true);
    const ok = await onSend(value);
    setSending(false);
    if (ok) setText("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) submit(e);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50" aria-live="polite">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 px-6">
            <span className="text-4xl mb-2">💬</span>
            <p className="text-sm">{emptyHint || "No messages yet. Say hello!"}</p>
          </div>
        )}
        {messages.map((m, i) => {
          const mine = m.sender === me;
          return (
            <div key={m._id || i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
                  mine
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm"
                }`}
              >
                {m.kind === "welcome" && (
                  <div className={`text-[10px] font-semibold uppercase tracking-wide mb-1 ${mine ? "text-indigo-200" : "text-indigo-500"}`}>
                    🎉 Automatic welcome
                  </div>
                )}
                {m.text}
                <div className={`text-[10px] mt-1 text-right ${mine ? "text-indigo-200" : "text-slate-400"}`}>
                  {formatTime(m.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {quickReplies.length > 0 && !disabled && (
        <div className="flex gap-2 overflow-x-auto px-3 pt-2 bg-white border-t border-slate-100">
          {quickReplies.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setText(q)}
              className="shrink-0 text-xs px-3 py-1.5 mb-1 rounded-full border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="flex items-end gap-2 p-3 bg-white border-t border-slate-100">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          maxLength={MAX_MESSAGE_LENGTH}
          disabled={disabled}
          placeholder={disabled ? "Messaging is unavailable" : "Write a message… (Enter to send)"}
          aria-label="Message"
          className="flex-1 resize-none max-h-32 text-sm px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending || disabled}
          aria-label="Send message"
          className="h-10 px-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition disabled:opacity-40"
        >
          {sending ? "…" : "Send ➤"}
        </button>
      </form>
    </div>
  );
};

export default ChatThread;
