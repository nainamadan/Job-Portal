# Changes Log

This file lists every change made to the project, written in simple English.
The newest changes are at the top.

---

## How to read this file

Each entry has:
- **Date** – when the change was made
- **What changed** – a short, simple description
- **Files** – which files were touched
- **Why** – the reason for the change

---

## 2026-11-19

### ATS-friendly resume is now instant ⚡
- **Before:** "Generate Improved Resume" waited for the AI, which took **30 seconds to 3 minutes**.
- **Now:** the button is **"⚡ Generate ATS-Friendly Resume (instant)"**, and the resume appears **immediately**, because it's built right in your browser. It:
  - uses a clean, single-column layout with the standard headings ATS systems look for;
  - puts your name on top and your contact details on one line;
  - lists the skills and projects that match the job **first**;
  - keeps work experience in date order;
  - tidies bullet points (capital letter, no stray full stops) and removes duplicate skills;
  - writes a short summary from your own degree and skills if you didn't have one;
  - **never invents** skills, jobs or achievements. Missing job keywords are shown as a tip ("add these only if you really have them").
- **Want AI wording?** After the instant resume appears, an optional **"✨ Polish wording with AI"** button lets the AI rewrite it. That step is slower (about 30 seconds or more on this setup), and it now stops after about 1.5 minutes with a clear message instead of waiting forever. I also made the AI request quicker by asking it to think less.
- **Files:** New: `client/src/utils/atsResumeBuilder.js`, `client/tests/atsResumeBuilder.test.mjs`. Changed: `client/src/pages/ResumeATSSimulator.jsx`, `client/package.json` (`npm test`), `server/controllers/aiController.js`.
- **Why:** Resume generation was too slow.
- **Checks:** New tests pass, and building a resume takes well under a millisecond. The sample resume came out correctly, with nothing invented. The website builds. I haven't clicked through it in the browser myself, so please try it.

### Forms now fill themselves from your resume 📄✨
- **What changed:**
  - **Apply for a job:** when you choose your resume, the website reads it and fills in your **name, email and phone** if those boxes are empty. You'll see "🔍 Reading your resume…" and then "✅ Filled from your resume: phone". Check the details before applying.
  - **ATS Simulator → Build Your Resume:** a new **"📄 Auto-fill from Resume"** button. Upload your resume (PDF, Word .docx or text) and the whole form is filled: name, email, phone, city, LinkedIn, GitHub, website, summary, degree, college, year, grade, skills, projects, experience, certificates, achievements and languages. It then tells you which parts weren't in your resume, so you can add them.
  - **Privacy:** your file is only read, never saved.
- **Good to know:**
  - Old `.doc` files and scanned photos of a resume can't be read. Please use PDF or .docx.
  - It works best when the resume has clear headings like "Education", "Skills" and "Projects".
  - The AI helper (Gemini) is very slow on this setup: about 3 minutes for a tiny test. So the website uses its own built-in reading rules instead. The first upload after the server starts waits about 12 seconds; after that it's instant.
- **Files:** New: `server/utils/resumeParser.js`, `server/routes/resumeRoutes.js`, `server/tests/resumeParser.test.js`, `client/src/utils/resumeAutofill.js`. Changed: `server/server.js`, `server/package.json` (added the `pdf-parse` and `mammoth` packages for reading PDF and Word files), `client/src/pages/Applyjob.jsx`, `client/src/pages/ResumeATSSimulator.jsx`.
- **Why:** So people don't have to type details that are already in their resume.
- **Checks:** New automatic tests pass. Uploading the sample resume PDF to the running server filled 13 fields correctly. The new button shows on the ATS page. The website builds. I haven't clicked through it in a browser with a real resume yet.

### Expired jobs now disappear automatically ⏰
- **What changed:**
  - When a job's application period ends (7, 15, 30, 45 or 60 days, at the end of the last day), the job **disappears by itself** from the job list, search results, Saved Jobs, and the job lists in AI Match and the ATS checker.
  - If someone leaves the page open, the job still disappears within about a minute of the deadline.
  - If someone opens an **old link** to a closed job, they see a friendly **"⏰ This job has closed"** page with the closing date and a "Browse open jobs" button.
  - **Recruiters** still see their expired jobs in **Manage Jobs**, marked **"⏰ Expired · hidden"**.
  - **Nothing is deleted.** Applications, chats and hiring progress for that job stay. Older jobs that never had a deadline stay listed.
- **Files:** New: `client/src/utils/jobDeadline.js`. Changed: `server/utils/jobFilters.js`, `server/controllers/jobController.js`, `server/tests/jobFilters.test.js`, `server/tests/workflows.test.js`, `client/src/components/JobListing.jsx`, `client/src/pages/SavedJobs.jsx`, `client/src/pages/ManageJobs.jsx`, `client/src/pages/JobDetails.jsx`.
- **Why:** So people only see jobs they can still apply for.
- **Checks:** Automatic tests pass. On the real database, the job list went from **18 to 9 jobs**: the other 9 had passed their deadline. A screenshot confirmed the "This job has closed" page. The website builds.

### Job chats now start with a welcome message 👋
- **What changed:**
  - When someone **applies to a job**, a chat for **that job** opens automatically **with the recruiter of that job**. It starts with a friendly message, for example: *"Hi Asha! 👋 Thanks for applying for Frontend Developer at Acme. We've received your application and our team will review it soon… message us here any time if you have questions about this job."*
  - The welcome is marked **"🎉 Automatic welcome"** and is only sent once per job.
  - People who applied **before today** also get their welcome chat the next time they or the recruiter open Messages.
  - **Each chat is about one job only.** The chat header shows the job, company and location, plus a note: "📌 This chat is only about Frontend Developer with the recruiter from Acme."
  - Both the job seeker's and the recruiter's Messages pages have a **"filter by job"** menu to see the chats for one job at a time.
  - The ready-made questions ("Is this position still open?"…) still show after the welcome, until the job seeker writes their first message.
- **Files:** New: `server/utils/welcomeMessage.js` (the welcome wording is in `buildWelcomeText`), `server/tests/welcomeMessage.test.js`. Changed: `server/models/Conversation.js`, `server/controllers/userController.js`, `server/controllers/messageController.js`, `server/tests/messages.test.js`, `client/src/components/ChatThread.jsx`, `client/src/components/MessagesInbox.jsx`, `client/src/components/MessageRecruiterModal.jsx`.
- **Why:** So every application starts a clear, job-specific chat with the right recruiter.
- **Checks:** New automatic tests pass. The website builds. The running backend restarted without errors. I haven't applied to a job in the browser myself, so please try it.

### Light ☀️ and dark 🌙 mode
- **What changed:** There's a new sliding switch in the top bar, and in the recruiter dashboard header, to swap between light and dark mode.
  - At first the site matches your phone or computer setting (light or dark).
  - Once you use the switch, the website remembers your choice in that browser.
  - The page opens straight in the right mode, with no white flash.
  - Colours change smoothly when you switch (unless your device asks for reduced motion).
  - All pages go dark: cards, text, borders, form boxes, coloured labels, the Help chatbot, chat messages, the progress tracker, Job Alerts and pop-up notifications. The Insiderjobs logo turns to light lettering, and partner logos (Microsoft, Amazon…) sit on small light tiles so they stay readable.
- **Files:** New: `client/src/utils/theme.js` (remembers and applies the mode), `client/src/components/ThemeToggle.jsx` (the switch), `client/src/theme-dark.css` (the dark colours), `client/scripts/generate-dark-theme.cjs` (rebuilds the dark colours file: run `npm run theme:dark` in `client/`). Changed: `client/index.html`, `client/src/main.jsx`, `client/tailwind.config.js`, `client/package.json`, `client/src/App.jsx`, `client/src/components/Navbar.jsx`, `client/src/components/Footer.jsx`, `client/src/components/Hero.jsx`, `client/src/pages/Dashboard.jsx`.
- **Why:** So the site works like modern apps that offer light and dark modes.
- **Checks:** The website builds. I checked screenshots of the main pages and the newer features in dark mode, and confirmed light mode looks the same as before. Not yet checked in dark mode: pages that need a login (the recruiter dashboard forms, Add Job, real job details). The Clerk login pop-up stays light. If any spot still looks light in dark mode, add its colour class to the generator script and run it again.

### Hiring process: recruiters update progress, job seekers track it 📈
- **The process:** Every application now moves through clear steps:
  📝 Applied → 👀 Under Review → ⭐ Shortlisted → 🗓️ Interview → 🎁 Offer Made → 🎉 Hired
  (or ❌ Not Selected at any point).
- **Recruiters:** On **View Applications**, the new **Hiring Stage** column shows where each candidate is, with a **Move to…** menu.
  - Most steps open a small pop-up where you can add a note for the candidate (or use a suggested one) and choose whether to email them.
  - **Interview** opens the existing Accept form with interview date and time, and **Not Selected** opens the existing Reject form with feedback. Their emails work as before.
- **Job seekers:** On **My Applications**, each job shows a **progress tracker** with the current step highlighted, plus the recruiter's latest note. **Show timeline** lists every update with its date.
- **Emails:** When a recruiter moves a candidate forward and ticks "Email the candidate", the candidate gets a short "Your application moved forward" email. If the email fails, the progress update is still saved.
- **Older applications:** They show a step based on their old status (Pending = Applied, Accepted = Interview, Rejected = Not Selected).
- **Help chatbot:** It now explains the progress tracker.
- **Files:** New: `server/utils/hiringStages.js`, `server/tests/hiringStages.test.js`, `client/src/utils/hiringStages.js`, `client/src/components/ApplicationProgress.jsx`, `client/src/components/StageUpdateModal.jsx`. Changed: `server/models/JobAppliaction.js`, `server/controllers/companyController.js`, `server/routes/companyRoutes.js`, `server/controllers/userController.js`, `server/utils/statusEmail.js`, `client/src/pages/ViewApplications.jsx`, `client/src/pages/ApplicationDashboard.jsx`, `client/src/components/HelpChatbot.jsx`.
- **Why:** So candidates always know where they stand, and recruiters can update progress step by step.
- **Checks:** New automatic tests pass. They cover moving through steps, the same step not being added twice, other companies being blocked, and Accept recording the Interview step. The website builds. The tracker and pop-up were checked in a screenshot with sample data. Real updates and emails weren't tried on this computer because the database, login and email settings aren't set up here.
- **Small limit:** Once someone is at Offer Made or Hired, picking Interview again won't move them back.

### New job emails now go only to people whose profile fits the job 🎯
- **Before:** Every time a recruiter posted a job, **every** registered user got an email.
- **Now:** Only people whose profile matches the job get the email. A person matches when:
  1. **Their Job Alert choices fit the job.** There's a new **🔔 Job Alerts** card on the **My Applications** page. Users pick roles/categories (e.g. "Programming", "Frontend Developer"), skills (e.g. "React"), locations (e.g. "Pune", "Remote") and experience (e.g. "1-3 Years"). Every group they fill in must fit; for example, "React" + "Pune" means only React jobs in Pune.
  2. **Or, if they haven't chosen anything yet:** the job is similar to jobs they already applied to or saved (same category, or shared skills).
- **Who gets no email:** people who turned off "Email me", and people with no choices and no applied or saved jobs.
- **In the email:** a new "🎯 Why you got this" line shows what matched, e.g. "React, Pune".
- **Files:** New: `server/utils/jobAlertMatcher.js` (the matching rules), `server/utils/jobAlerts.js` (finds matching users and sends), `server/tests/jobAlerts.test.js`, `client/src/components/JobAlertPreferences.jsx` (the Job Alerts card). Changed: `server/models/User.js`, `server/controllers/companyController.js`, `server/controllers/userController.js`, `server/routes/userRoutes.js`, `server/utils/sendEmail.js`, `client/src/pages/ApplicationDashboard.jsx`.
- **Why:** So people only get emails about jobs that suit them.
- **Checks:** New automatic tests confirm the matching rules and that only matching people are emailed, and they pass. The website builds. The Job Alerts card was checked with a screenshot. Real emails weren't sent from this computer because the database and email settings aren't set up here.
- **Good to know:** Existing users haven't set any choices yet. Until they do, only users who have applied to or saved jobs will get new-job emails.

### Fixed: "Accepted" emails were never sent (only "Rejected" ones were)
- **The problem:** When a recruiter pressed **Accept**, the candidate got no email, but **Reject** emails worked.
- **The cause:** Accepting also saves the interview details (date, time, type, link). In the database layout file, the interview detail called `type` was written in a way the database library treats as a special instruction. Because of that, it thought the whole "interview details" section was plain text. Saving date, time and so on then failed with an error, so **the Accepted status wasn't saved and the email never went out**. Rejecting doesn't save interview details, so it was never affected.
- **The fix:** Wrote that one field the correct way (`type: { type: String }`). Accepting now saves the interview details, updates the status and sends the "Congratulations" email with the interview details.
- **Files:** `server/models/JobAppliaction.js` (the fix), `server/tests/applicationModel.test.js` (new test so this can't quietly break again).
- **Checks:** Before the fix, a test of the Accept save failed with "Cast to string failed … interviewDetails". After the fix it passes. A real email wasn't sent from this computer because the email and database settings aren't set up here. **Restart the backend** (or redeploy it) so the fix takes effect.

### Job seekers can now message recruiters 💬
- **What changed:**
  - Every job page has a new **💬 Message Recruiter** button. It opens a chat window where the job seeker can ask the recruiter about the job, changes to the job post, or their application. There are ready-made questions such as "Is this position still open?" and "Has anything changed in this job post?"
  - A new **💬 Messages** button in the top bar opens the job seeker's inbox (`/messages`), with all their chats and the recruiters' replies.
  - Recruiters have a new **Messages** tab in their dashboard (`/dashboard/messages`) to read questions and reply. There are ready-made replies such as "Yes, the position is still open."
  - Both sides see a number badge for unread messages. Open chats check for new messages every few seconds.
  - The Help chatbot now also answers "How do I message a recruiter?"
- **Safety:** You must be logged in to send a message. Recruiters only see messages about their own jobs, and job seekers only see their own chats. Messages can be up to 2000 characters.
- **Files:** New: `server/models/Conversation.js`, `server/controllers/messageController.js`, `server/routes/messageRoutes.js`, `server/tests/messages.test.js`, `client/src/components/ChatThread.jsx`, `client/src/components/MessagesInbox.jsx`, `client/src/components/MessageRecruiterModal.jsx`, `client/src/pages/Messages.jsx`, `client/src/pages/RecruiterMessages.jsx`. Changed: `server/server.js`, `client/src/App.jsx`, `client/src/pages/JobDetails.jsx`, `client/src/pages/Dashboard.jsx`, `client/src/components/Navbar.jsx`, `client/src/components/HelpChatbot.jsx`.
- **Why:** So job seekers can ask recruiters about a job post or job updates directly on the website.
- **Not included yet:** No email or phone notification when a new message arrives; you see it the next time you open Messages.
- **Checks:** A new automatic test checks the full back-and-forth between a job seeker and a recruiter, including that one company can't read another company's messages. It passes. The website builds without errors. The new Messages page was checked with a screenshot. Real sending couldn't be tried in the browser because the database and login keys aren't set up on this computer. Two older email tests fail because of an earlier change to the email code, not because of this feature.

### Fixed the blank page when the login key is missing
- **What changed:** The website used to stop completely and show an empty page if the job seeker login key (`VITE_CLERK_PUBLISHABLE_KEY` in `client/.env`) was missing. Now it opens normally in a **"no-login mode"**. Every page shows up, including the top bar, the job filters, AI Match, the ATS checker, the recruiter login window and the 🤖 Help chatbot. Pressing **Login / Register** shows a small message saying login isn't set up yet.
- **How it works:** When the key is missing, the website quietly uses a harmless stand-in for the login system. Once you add the real key to `client/.env` and restart the website, real login comes back on its own. Nothing else needs changing.
- **Files:** `client/src/auth/clerkFallback.jsx` (new: the stand-in), `client/vite.config.js` (uses the stand-in only when the key is missing), `client/src/main.jsx` (removed the line that crashed the site).
- **Still needed for real data:** The job list shows "Network Error" because the backend server isn't running. It needs a `server/.env` file with a MongoDB database address (`MONGODB_URI`) and other settings, plus running `npm install` inside `server/`. No database is installed on this computer.
- **Why:** So the whole project can be seen and checked before the private keys are added.
- **Checks:** The website builds without errors, and the changed files pass the code checker. Screenshots taken with Chrome confirmed the home page and AI Match page appear correctly, with the top bar and chatbot button visible. Real login and the backend couldn't be tested because their keys and database are missing.

### Added a temporary chatbot test page
- **What changed:** Added a small test page that shows only the Help chatbot, at `http://127.0.0.1:5173/chatbot-preview.html` while the website is running.
- **Files:** `client/chatbot-preview.html`, `client/src/chatbot-preview.jsx` (both new, both temporary).
- **Why:** The main site shows a blank page because the Clerk login key (`client/.env`) is missing. This page doesn't need that key, so the chatbot can be tested now.
- **Note:** Delete both files when you no longer need them. They don't change the real website.

### Added a Help chatbot in the bottom-right corner
- **What changed:** A round button with a waving robot emoji 🤖 now sits in the bottom-right corner of every page. Clicking it opens a small chat window. People can tap a ready-made question or type their own, and the bot answers right away. Some answers include a button that takes you straight to the right page (for example "Open My Applications").
- **Questions it answers (14 in total, in 4 tabs):**
  - *Job seekers:* searching for jobs, applying, creating an account, uploading a resume, checking application status, saving jobs.
  - *Resume tools:* what the ATS checker is, how AI job matching works.
  - *Recruiters:* registering as a recruiter, posting a job, viewing and answering applicants, hiding a job.
  - *General:* not receiving an email, why you can't apply for a job.
- **How it works:** All answers are stored inside the website itself. It does not use AI or the internet, so it is fast and free to run. If it can't find an answer, it politely says so and shows the question buttons.
- **On phones:** The button sits a bit higher so it doesn't cover the "Filters" button on the job list.
- **Files:** `client/src/components/HelpChatbot.jsx` (new: the chatbot and its questions/answers), `client/src/App.jsx` (shows the chatbot on every page), `client/src/index.css` (small animations).
- **How to change answers:** Edit the `FAQS` list at the top of `HelpChatbot.jsx`. Each item has a question, some keywords, and an answer.
- **Why:** So users can quickly get help without contacting anyone.
- **Checks:** The website builds without errors, and the new file passes the code checker. I tested 10 typed questions and each got the right answer (a question it doesn't know, like "tell me a joke", correctly gets the "sorry" reply). I haven't clicked through it in a real browser yet.

### Created this changes log
- **What changed:** Added this `CHANGES.md` file to keep track of all changes in easy words.
- **Files:** `CHANGES.md`
- **Why:** So anyone can quickly see what was changed and why, without reading the code.
