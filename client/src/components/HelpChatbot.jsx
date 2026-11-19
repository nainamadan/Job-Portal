import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// Help answers live here. Each entry has the question shown as a quick button,
// extra keywords that help match questions people type, and the answer.
// To add a new answer, add one more object to this list.
const FAQS = [
  // Job seekers
  {
    id: "search",
    group: "Job seekers",
    question: "How do I search for jobs?",
    keywords: ["search", "find", "browse", "filter", "look", "salary", "location", "category"],
    answer:
      "Use the search bar on the home page to enter a job title and location. Then narrow the list with filters for category, location, experience level, skills and salary (in LPA). Press Clear Filters to start over.",
    link: { to: "/", label: "Browse jobs" },
  },
  {
    id: "apply",
    group: "Job seekers",
    question: "How do I apply for a job?",
    keywords: ["apply", "application", "submit", "applying"],
    answer:
      "Open a job, then press Apply Now. You need to be logged in, and your resume is sent with the application. You can apply only once per job, and only before the job's application deadline.",
  },
  {
    id: "account",
    group: "Job seekers",
    question: "How do I create an account or log in?",
    keywords: ["login", "log in", "sign in", "signup", "sign up", "register", "account", "create"],
    answer:
      "Press Login / Register at the top right. You can sign up with your email or a supported social account. After signing in, your profile picture appears in the top bar.",
  },
  {
    id: "resume",
    group: "Job seekers",
    question: "How do I upload or update my resume?",
    keywords: ["resume", "cv", "upload", "update", "pdf", "change"],
    answer:
      "Go to My Applications and use the resume section to upload your resume as a PDF. Uploading a new file replaces the old one, and future applications will use the new resume.",
    link: { to: "/my-applications", label: "Open My Applications" },
  },
  {
    id: "status",
    group: "Job seekers",
    question: "How do I check my application status?",
    keywords: ["status", "track", "progress", "stage", "applied", "pending", "accepted", "rejected", "result", "update", "shortlisted", "hired"],
    answer:
      "Open My Applications to see a progress tracker for every job you applied to: 📝 Applied → 👀 Under Review → ⭐ Shortlisted → 🗓️ Interview → 🎁 Offer → 🎉 Hired. Tap Show timeline to see each update and any note from the recruiter. You also get an email when your application moves forward.",
    link: { to: "/my-applications", label: "Open My Applications" },
  },
  {
    id: "save",
    group: "Job seekers",
    question: "How do I save a job for later?",
    keywords: ["save", "saved", "bookmark", "later", "favourite", "favorite"],
    answer:
      "Open the job's details page and press the save button. All your saved jobs are listed on the Saved Jobs page so you can come back and apply later.",
    link: { to: "/saved-jobs", label: "Open Saved Jobs" },
  },
  {
    id: "message-recruiter",
    group: "Job seekers",
    question: "How do I message a recruiter?",
    keywords: ["message", "chat", "contact", "ask", "question", "talk", "recruiter", "inbox", "reply"],
    answer:
      "Open any job and press 💬 Message Recruiter. You can ask about the job, changes to the post, or your application. You need to be logged in. All your chats and the recruiter's replies are in Messages at the top of the page.",
    link: { to: "/messages", label: "Open Messages" },
  },
  {
    id: "ats",
    group: "Resume tools",
    question: "What is the ATS resume checker?",
    keywords: ["ats", "score", "simulator", "checker", "improve", "analysis", "keywords"],
    answer:
      "The ATS simulator compares your resume with a job description and gives a match score, missing keywords and AI tips to improve your resume. The score is a helpful guide, not a guarantee of what an employer decides.",
    link: { to: "/ats-simulator", label: "Try the ATS checker" },
  },
  {
    id: "match",
    group: "Resume tools",
    question: "How does AI job matching work?",
    keywords: ["ai", "match", "matching", "skills", "missing", "compare"],
    answer:
      "Paste your resume text and a job description in AI Match. It shows which skills you already have and which skills are missing, so you know what to add or learn.",
    link: { to: "/ai-match", label: "Open AI Match" },
  },
  // Recruiters
  {
    id: "recruiter-account",
    group: "Recruiters",
    question: "How do I register as a recruiter?",
    keywords: ["recruiter", "company", "employer", "register", "hire", "hiring", "login"],
    answer:
      "Press Recruiter Login at the top, then choose to sign up. Add your company name, email, password and logo. After that, log in with your email and password to open the Recruiter Dashboard.",
  },
  {
    id: "post-job",
    group: "Recruiters",
    question: "How do I post a new job?",
    keywords: ["post", "add", "create", "publish", "new job", "listing", "deadline", "duration"],
    answer:
      "In the Recruiter Dashboard, open Add Job. Fill in the title, description, location, salary (LPA), category, level and how long applications stay open (7 to 60 days). You can let AI draft the job description for you.",
  },
  {
    id: "applicants",
    group: "Recruiters",
    question: "How do I view and respond to applicants?",
    keywords: ["applicants", "candidates", "view applications", "accept", "reject", "shortlist", "respond", "stage", "progress", "hire", "offer"],
    answer:
      "Open View Applications in the Recruiter Dashboard. Use the Move to… menu under Hiring Stage to move a candidate through Under Review, Shortlisted, Interview, Offer Made and Hired (or Not Selected). You can add a note and email the candidate, who sees every update in their progress tracker.",
  },
  {
    id: "hide-job",
    group: "Recruiters",
    question: "How do I hide or close a job?",
    keywords: ["hide", "close", "visible", "visibility", "remove", "delete", "manage"],
    answer:
      "Go to Manage Jobs in the Recruiter Dashboard and switch off the Visible toggle for that job. It stops showing to job seekers, and you can turn it back on any time.",
  },
  // General
  {
    id: "email",
    group: "General",
    question: "I didn't get an email. What should I do?",
    keywords: ["email", "mail", "notification", "didn't get", "not received", "spam", "inbox"],
    answer:
      "First check your Spam or Promotions folder. Make sure the email on your account is correct. Your application status is always shown in My Applications, even if an email is delayed.",
  },
  {
    id: "cant-apply",
    group: "General",
    question: "Why can't I apply for a job?",
    keywords: ["can't", "cannot", "unable", "error", "deadline", "expired", "already", "closed"],
    answer:
      "Usually it is one of three things: you are not logged in, you have already applied for this job, or the job's application deadline has passed. Check My Applications to see jobs you have already applied for.",
    link: { to: "/my-applications", label: "Open My Applications" },
  },
];

const GROUPS = ["Job seekers", "Resume tools", "Recruiters", "General"];

const GREETING = {
  from: "bot",
  text: "Hi there! 👋 I'm your Job Portal helper. Pick a question below or type your own.",
};

// Words that are too common to help find the right answer.
const STOP_WORDS = new Set([
  "how", "do", "i", "a", "an", "the", "to", "my", "is", "it", "can", "what",
  "for", "of", "on", "in", "me", "and", "or", "you", "your", "does", "with",
]);

// Finds the best answer for a typed question by counting matching words.
const findAnswer = (input) => {
  const text = input.toLowerCase();
  const words = text.split(/[^a-z0-9']+/).filter((w) => w && !STOP_WORDS.has(w));
  let best = null;
  let bestScore = 0;

  for (const faq of FAQS) {
    let score = 0;
    for (const keyword of faq.keywords) {
      if (keyword.includes(" ")) {
        if (text.includes(keyword)) score += 3;
      } else if (words.some((w) => w === keyword || (w.length > 3 && w.startsWith(keyword)))) {
        score += 2;
      }
    }
    for (const w of faq.question.toLowerCase().split(/[^a-z0-9']+/)) {
      if (w && !STOP_WORDS.has(w) && words.includes(w)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = faq;
    }
  }
  return bestScore >= 2 ? best : null;
};

const HelpChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [group, setGroup] = useState(GROUPS[0]);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  // Close with the Escape key.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const reply = (userText, faq) => {
    setMessages((prev) => [...prev, { from: "user", text: userText }]);
    setTyping(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        faq
          ? { from: "bot", text: faq.answer, link: faq.link }
          : {
              from: "bot",
              text: "Sorry, I don't have an answer for that yet 🤔. Try one of the questions below, or ask about jobs, applying, resumes or recruiters.",
            },
      ]);
    }, 600);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || typing) return;
    setInput("");
    reply(text, findAnswer(text));
  };

  const resetChat = () => {
    clearTimeout(timerRef.current);
    setTyping(false);
    setMessages([GREETING]);
  };

  return (
    <div className="fixed right-4 sm:right-6 bottom-24 md:bottom-6 z-[60] flex flex-col items-end gap-3">
      {open && (
        <div
          role="dialog"
          aria-label="Help chat"
          className="hc-pop w-[calc(100vw-2rem)] sm:w-96 h-[min(560px,calc(100vh-9rem))] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-2xl">
              🤖
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold leading-tight">Help Assistant</p>
              <p className="text-xs text-blue-100 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                Online · answers instantly
              </p>
            </div>
            <button
              onClick={resetChat}
              title="Start over"
              aria-label="Start over"
              className="w-8 h-8 rounded-full hover:bg-white/20 transition text-lg"
            >
              ↺
            </button>
            <button
              onClick={() => setOpen(false)}
              title="Close"
              aria-label="Close help chat"
              className="w-8 h-8 rounded-full hover:bg-white/20 transition text-lg"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"} gap-2`}>
                {m.from === "bot" && <span className="text-xl leading-none mt-1">🤖</span>}
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    m.from === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-sm"
                  }`}
                >
                  {m.text}
                  {m.link && (
                    <Link
                      to={m.link.to}
                      onClick={() => setOpen(false)}
                      className="mt-2 block font-semibold text-blue-600 hover:underline"
                    >
                      {m.link.label} →
                    </Link>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-2 items-center">
                <span className="text-xl leading-none">🤖</span>
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-3 py-3 flex gap-1">
                  <span className="hc-dot" />
                  <span className="hc-dot" style={{ animationDelay: "0.15s" }} />
                  <span className="hc-dot" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick questions */}
          <div className="border-t border-gray-100 bg-white px-3 pt-2 pb-1">
            <div className="flex gap-1 overflow-x-auto pb-2">
              {GROUPS.map((g) => (
                <button
                  key={g}
                  onClick={() => setGroup(g)}
                  className={`shrink-0 text-xs px-3 py-1 rounded-full transition ${
                    group === g ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {FAQS.filter((f) => f.group === group).map((faq) => (
                <button
                  key={faq.id}
                  disabled={typing}
                  onClick={() => reply(faq.question, faq)}
                  className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition disabled:opacity-50"
                >
                  {faq.question}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-3 border-t border-gray-100 bg-white">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              aria-label="Type your question"
              maxLength={200}
              className="flex-1 text-sm px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              aria-label="Send"
              className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition disabled:opacity-40"
            >
              ➤
            </button>
          </form>
        </div>
      )}

      {/* Floating launcher button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close help chat" : "Open help chat"}
        aria-expanded={open}
        className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl hover:scale-110 transition-transform flex items-center justify-center text-3xl"
      >
        {!open && <span className="absolute inset-0 rounded-full bg-blue-500 opacity-40 animate-ping" />}
        <span className={`relative ${open ? "" : "hc-wave"}`}>{open ? "✖️" : "🤖"}</span>
        {!open && (
          <span className="absolute -top-1 -right-1 text-lg bg-white rounded-full w-7 h-7 flex items-center justify-center shadow">
            💬
          </span>
        )}
      </button>
    </div>
  );
};

export default HelpChatbot;
