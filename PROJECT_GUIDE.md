# Project guide

This file explains the project in simple English. Codex must keep it up to date when changing the code, following `AGENTS.md` in this folder. Updates happen during Codex tasks; this file does not watch for changes on its own.

## What this project does

The main project is a job portal. People can browse jobs, save jobs, apply, manage their resume, and track applications. Recruiters can create accounts, publish jobs, view applicants, and change application statuses.

The project also includes resume matching, an ATS resume simulator, and AI writing tools. ATS means applicant tracking system: the simulator estimates how well resume text matches a job. Its score is a guide, not a guarantee of an employer's result.

There are three separately runnable parts in this repository:

| Folder | Purpose |
| --- | --- |
| `client/` | The job portal website, built with React and Vite. |
| `server/` | The Express backend. It handles requests from the website and stores records in MongoDB. |
| Root `app/` and `public/` | A separate Next.js creative studio footer demo, with a video background. The root start command runs this demo. |

## Features present in the code

### For everyone

- Light and dark mode. A ☀️/🌙 switch sits in the top bar and in the recruiter dashboard header. Until someone uses it, the site follows the device's light or dark setting. After that, their choice is remembered in that browser. The saved theme is applied before the page draws, so there is no white flash. Pop-up notifications follow the theme too. The Clerk sign-in window stays light.

### For job seekers

- Browse and search job listings, then open a job's details. Combine title, location, category, experience, skills, and minimum or maximum annual salary in LPA. Clear Filters resets all of these fields.
- Sign in through Clerk, which manages job seeker accounts.
- Save jobs. The website uses browser storage and also has server endpoints for signed-in users' saved jobs.
- Choose which new-job emails to receive in the **🔔 Job Alerts** card on My Applications: roles/categories, skills, locations and experience levels, plus an on/off switch. Every group you fill in must fit the job; for example, choosing skill "React" and location "Pune" means only React jobs in Pune.
- Message the recruiter about a job. Each job page has a 💬 **Message Recruiter** button, and the **Messages** page (`/messages`) lists every conversation and its replies. You must be logged in. Each conversation is about one job, between one job seeker and the recruiter of the company that posted that job; the company is always taken from the job, never from the browser. Applying to a job automatically starts that job's chat with a welcome message on the recruiter's behalf, marked "Automatic welcome". Applications made before this feature get their welcome chat the first time Messages or that job's chat is opened. The inbox has a "filter by job" menu, and each chat says which job and company it is about. Ready-made questions such as "Has anything changed in this job post?" show until the job seeker sends their first message. New replies show up within about 10 seconds; there are no email or push notifications for messages.
- Upload a resume and apply for jobs. The backend rejects duplicate applications and applications after a job's deadline. Choosing a resume on the Apply page reads it and fills any empty name, email and phone fields; the phone becomes 10 digits. A note shows what was filled. Old `.doc` files and scanned images can't be read, but can still be attached.
- Track each application's progress on My Applications. A step tracker shows 📝 Applied → 👀 Under Review → ⭐ Shortlisted → 🗓️ Interview → 🎁 Offer Made → 🎉 Hired, or ❌ Not Selected. A timeline lists every update with its date and any note from the recruiter. Older applications without saved stages show a stage worked out from their old status.
- Compare resume text with job descriptions and see matching or missing skills.
- Use the ATS simulator for analysis, AI improvement suggestions, and improved resume generation. **⚡ Generate ATS-Friendly Resume (instant)** builds the resume in the browser in milliseconds, with no AI. It uses a single column, standard headings, contact details on one line, job-matching skills and projects first, tidy bullets, and duplicates removed. It only uses the person's own content; if there is no summary, one is written from their degree and skills. Missing job keywords are shown as a tip, not added. **✨ Polish wording with AI** is an optional slower step that sends the resume to Gemini; on this setup it takes roughly 30 seconds or more, and it gives up after 90 seconds. Its **📄 Auto-fill from Resume** button reads an uploaded PDF, DOCX or TXT resume and fills the "Build Your Resume" form: contact details, links, summary, education, skills, projects, experience, certifications, achievements and languages. It then lists what wasn't found, so the person can review and complete it. The resume download flow uses the browser's print window to save as PDF.

### For recruiters

- Register a company account with an image, then sign in with email and password.
- Create jobs with a title, description, location, salary, category, experience level, and application duration.
- Choose an application duration of 7, 15, 30, 45, or 60 days. The backend calculates the deadline (23:59:59 on the last day). Once it passes, the job disappears automatically from the public job list, search results, Saved Jobs, and the job pickers in AI Match and the ATS Simulator. Open pages re-check every minute. An old link to an expired job shows "This job has closed" with the closing date. Recruiters still see expired jobs in Manage Jobs with an "⏰ Expired · hidden" label. Applications to expired jobs stay in My Applications, and older jobs with no deadline stay listed.
- Ask the AI service to draft a job description.
- Manage job visibility, view applicants, and move each applicant through the hiring stages. Use the **Move to…** menu in the Hiring Stage column of View Applications. Under Review, Shortlisted, Offer Made, Hired, and back to Applied open a pop-up for an optional note and an optional progress email. Interview and Not Selected open the existing Accept and Reject forms, so interview details and feedback are still collected and those emails are still sent. Moving to the same stage twice adds nothing.
- Posting a job emails only the job seekers whose profile fits it, not every user, if email delivery is configured. A job seeker matches when the job fits their **Job Alerts** choices, or, if they have made no choices, when it is similar to jobs they applied to or saved. People with no choices and no activity, or who turned alerts off, get no email. Each email says why it was sent. Changing an application to Accepted or Rejected sends a professional HTML and plain-text email to the candidate's registered address, with job, company, status, and company reply contact.
- Status notifications wait for the SMTP response. If delivery fails, the application decision stays saved and the recruiter sees a warning. Repeated or concurrent requests for the same status do not send another email.
- Read and reply to job seekers' messages in the dashboard's **Messages** tab (`/dashboard/messages`). Unread counts are shown, and a recruiter can only see conversations about their own company's jobs. Every applicant automatically has a chat that starts with the welcome message, and the list can be filtered by job.
- Real interview details and optional rejection feedback entered in the existing recruiter form are saved and included in the corresponding status email. No interview schedule is invented.

## How the parts work together

1. A person opens the React website in `client/`.
2. The website asks the Express server for jobs, account information, or application updates.
3. The server reads or saves records in MongoDB.
4. Clerk handles job seeker sign-in. Clerk account events reach the server through `/webhooks`, where their original bytes are checked before parsing. Primary account emails are saved through repeat-safe updates. Legacy missing or placeholder addresses are repaired from Clerk when the account is used or a notification is sent; browser-supplied addresses are not used for delivery.
5. Recruiters use a separate company sign-in system. The server issues a JWT, a token that identifies the signed-in company.
6. Upload handling writes files to an `uploads/` folder under the server's working directory. Cloudinary is also configured for image uploads.
7. Gemini provides AI writing features. Basic resume matching and ATS scoring use rules in the project's own skill matcher files rather than a Gemini response.
8. Nodemailer sends notifications using configured SMTP or Gmail credentials. It does not silently replace real delivery with a test inbox or console log. Sentry is configured to collect backend errors.

## Where to find things

| File or folder | What it controls |
| --- | --- |
| `client/src/App.jsx` | Website page addresses and recruiter dashboard routing. |
| `client/src/pages/` | Job pages, applications, saved jobs, recruiter tools, and resume tools. |
| `client/src/components/` | Shared website pieces, including navigation, job cards, sign-in, and resume display. |
| `client/src/components/ChatThread.jsx`, `MessagesInbox.jsx`, `MessageRecruiterModal.jsx` | Job seeker ↔ recruiter messaging: the chat bubbles and text box, the two-pane inbox used by both sides, and the pop-up chat on a job page. |
| `client/src/pages/Messages.jsx` and `client/src/pages/RecruiterMessages.jsx` | The job seeker's inbox and the recruiter dashboard's inbox. |
| `server/models/Conversation.js`, `server/controllers/messageController.js`, `server/routes/messageRoutes.js` | Stores conversations, with messages of up to 2000 characters, and handles the `/api/messages` requests. |
| `server/utils/welcomeMessage.js` | Writes the welcome message (edit `buildWelcomeText` to change its wording). It also starts the job's chat when someone applies, and adds welcome chats for older applications. Welcome messages are stored with `kind: "welcome"`, at most one per chat. |
| `client/src/utils/theme.js`, `client/src/components/ThemeToggle.jsx`, and the small script in `client/index.html` | Light/dark mode: remembering the choice (browser storage key `theme`), following the device setting, and the switch button. |
| `client/src/theme-dark.css` | The dark colours. It re-colours the light Tailwind classes the site already uses (white and grey backgrounds, dark text, grey borders, light colour tints) when `<html>` has the `dark` class. It is generated by `client/scripts/generate-dark-theme.cjs` (`npm run theme:dark` in `client/`); edit the script, not the CSS. If a new page uses a light class that isn't covered, add it to the script, or use Tailwind `dark:` classes, which also work (`darkMode: "class"`). Logos with dark lettering use the `theme-logo` class, and partner logos use `theme-chip`. |
| `client/src/components/HelpChatbot.jsx` | Floating help chatbot in the bottom-right corner; edit its `FAQS` list to change questions and answers. |
| `client/src/auth/clerkFallback.jsx` | No-login stand-in for Clerk. `client/vite.config.js` uses it automatically when `VITE_CLERK_PUBLISHABLE_KEY` is missing, so the site still opens. |
| `client/src/context/AppContext.jsx` | Shared job data, search state, backend address, and recruiter sign-in state. |
| `client/src/utils/clientSkillMatcher.js` | Resume matching and ATS scoring rules available in the browser. |
| `client/src/assets/` | Images, icons, a sample resume, and sample job data. |
| `server/server.js` | Starts the backend, connects services, and mounts request routes. |
| `server/routes/` | Lists the backend addresses the website can call. |
| `server/controllers/` | Handles accounts, jobs, applications, AI requests, and Clerk events. |
| `server/models/` | Defines stored users, companies, jobs, and applications. The application model file is named `JobAppliaction.js`. |
| `server/middleware/` | Checks company sign-in and handles file uploads. |
| `server/config/` | MongoDB, Cloudinary, and Sentry setup. |
| `server/utils/` | Matching rules, email delivery, and company token creation. |
| `server/utils/jobFilters.js` and `server/utils/salary.js` | Validate search filters and normalize salaries before storing and comparing them. `openJobsOnly` in `jobFilters.js` hides jobs past their application deadline from `GET /api/jobs`; `GET /api/jobs/:id` still returns them. |
| `client/src/utils/jobDeadline.js` | The website's matching "is this job still open?" check (`isJobOpen`) and a clock that refreshes every minute (`useNow`). |
| `server/utils/emailTransport.js` and `server/utils/statusEmail.js` | Configure real SMTP delivery and format accepted/rejected notifications. The existing `sendEmail.js` remains the shared email entry point. |
| `server/utils/hiringStages.js` and `client/src/utils/hiringStages.js` | The list of hiring stages and how they map to the older Pending / Accepted / Rejected status. Keep the two files in step. Applications store `stage` and `stageHistory`; recruiters change them through `PUT /api/company/applications/:applicationId/stage`. |
| `client/src/components/ApplicationProgress.jsx` and `client/src/components/StageUpdateModal.jsx` | The job seeker's progress tracker and timeline, and the recruiter's "move to stage" pop-up. |
| `client/src/utils/atsResumeBuilder.js` | The instant ATS-friendly resume builder (`buildAtsResume`). Tests are in `client/tests/atsResumeBuilder.test.mjs`; run them with `npm test` in `client/`. |
| `server/utils/resumeParser.js`, `server/routes/resumeRoutes.js`, `client/src/utils/resumeAutofill.js` | Resume auto-fill. `POST /api/resume/parse` takes one file (form field `resume`; PDF, DOCX or TXT; up to 5MB). The file is kept in memory only and never saved. The server reads its text (`pdf-parse`, `mammoth`), finds details with built-in rules, and, if `GEMINI_API_KEY` is set, asks Gemini as well. Email, phone and profile links always come from the text itself. If Gemini fails or takes more than 12 seconds, the rules are used, and Gemini is skipped for 5 minutes. Each address can read 15 resumes per 10 minutes. |
| `server/utils/jobAlertMatcher.js` and `server/utils/jobAlerts.js` | Decide which users fit a newly posted job, and send the new-job emails only to them. Preferences are stored on the user as `jobPreferences` and edited through `GET`/`PUT /api/users/job-preferences`. |
| `client/src/components/JobAlertPreferences.jsx` | The 🔔 Job Alerts card on My Applications. |
| `server/utils/candidateProfile.js` | Finds registered candidate email addresses and repairs placeholder account records using Clerk. |
| `server/tests/` | Salary validation tests and simulated recruiter/candidate request workflows with a local SMTP receiver. |
| `server/.env.example` | Configuration names and email settings, with no credentials. |
| `app/page.tsx` | The separate creative studio demo page. |
| `app/components/FooterVideo.tsx` | Moves through video frames with the mouse on desktop and plays the video on mobile. |
| `AGENTS.md` | Tells future Codex sessions to maintain this guide. |

## Main website pages

| Address | Purpose |
| --- | --- |
| `/` | Job portal home and listings. |
| `/job/:id` | Details of one job. |
| `/apply-job/:id` | Apply for one job. |
| `/ai-match` | Resume and job matching. |
| `/ats-simulator` | Resume analysis and improvement tools. |
| `/my-applications` | The job seeker's applications. |
| `/saved-jobs` | Saved jobs. |
| `/messages` | The job seeker's conversations with recruiters. |
| `/dashboard` or `/dashboard/add-job` | Recruiter job creation. |
| `/dashboard/manage-jobs` | Recruiter's job listings and visibility controls. |
| `/dashboard/view-applications` | Recruiter's applicants and status controls. |
| `/dashboard/messages` | Recruiter's inbox for job seekers' questions. |

The backend groups its requests under `/api/jobs`, `/api/users`, `/api/company`, and `/api/messages`. These page addresses describe the Vite client, not the separate root demo.

## Running the project locally

### Files kept out of GitHub

The root `.gitignore` excludes installed dependencies, private environment files (while allowing `.env.example`), uploaded resumes, generated builds and caches, logs, and local PDF editing/review outputs. These files stay on your computer. Install dependencies and configure your own environment files after downloading or cloning the project. The PDF helper scripts remain available for version control.

When starting from a downloaded ZIP, connect Git to the intended repository and fetch its history before uploading changes to an existing branch. A ZIP does not contain the original commit history.

This working folder is connected to `https://github.com/nainamadan/Job-Portal.git` as `origin`, with local changes based on its existing `main` history. For later updates, review `git status`, stage the intended changes, commit them, and use `git push origin main`. Previously tracked build and PDF review outputs are removed from tracking, while their local copies are preserved.

Install Node.js and npm first. Run each set of commands from this repository's root. Run the job portal backend and frontend in separate terminals.

Backend:

```powershell
cd server
npm install
npm run server
```

The backend defaults to port 5000. `npm start` runs it without the automatic restart tool used by `npm run server`.

Job portal frontend:

```powershell
cd client
npm install
npm run dev
```

Use the local address printed by Vite. The frontend uses `http://localhost:5000` for the backend unless `VITE_BACKEND_URL` is set.

Separate footer demo, from the repository root:

```powershell
npm install
npm run dev
```

### Settings needed for connected features

Use local environment files such as `client/.env` and `server/.env` for configuration. Keep their values private.

| Location | Variable names | Purpose |
| --- | --- | --- |
| Client | `VITE_CLERK_PUBLISHABLE_KEY` | Job seeker sign-in. If it is missing, the site opens in no-login mode instead of a blank page. Restart `npm run dev` after adding it. |
| Client | `VITE_BACKEND_URL` | Backend address; optional for the default local address. |
| Server | `MONGODB_URI` | Database connection. |
| Server | `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET` | Clerk middleware and account event verification. |
| Server | `JWT_SECRET` | Company sign-in tokens. |
| Server | `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary uploads. |
| Server | `GEMINI_API_KEY` | AI writing features. |
| Server | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | SMTP email delivery. |
| Server | `SMTP_SECURE`, `EMAIL_FROM` | SMTP TLS mode and an authorized sender address. |
| Server | `GMAIL_USER`, `GMAIL_PASS` | Alternative Gmail email delivery. |
| Server | `FRONTEND_URL` | Website address used in notification links. |
| Server | `SENTRY_DSN` | Backend error reporting. |
| Server | `PORT` | Optional backend port override. |

Providing these variables alone does not configure the external services: the database, Clerk application and webhook, upload account, AI access, and email account must also be set up.

### Configuring status notification emails

Use the names in `server/.env.example` in the backend hosting environment, or in local `server/.env`. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS`. Set `EMAIL_FROM` to an address your SMTP provider authorizes. Use `SMTP_SECURE=false` on port 587 (STARTTLS), or `SMTP_SECURE=true` on port 465 (TLS). If `SMTP_SECURE` is omitted, the port determines this setting. As an alternative, configure `GMAIL_USER` and `GMAIL_PASS` with a Gmail App Password. Incomplete SMTP settings fail explicitly.

`EMAIL_FROM` defaults to the SMTP username or Gmail address when omitted. The company's database email is included in the message and used as Reply-To, rather than impersonating the company as the sender. Keep credentials on the server; do not use `VITE_` variables for secrets.

From `server/`, run `npm run email:verify` to check SMTP connection and authentication without sending a message. A successful check does not guarantee inbox placement. Redeploy the backend after changing its hosting environment variables.

### Salary values and the existing jobs API

The existing recruiter form uses LPA: one lakh INR per year. Plain numeric values keep that meaning. A salary of `10` matches a 10–20 LPA search. Values such as `10 LPA`, `12.5 lakhs`, `INR 10,00,000`, and `1000000 INR` are normalized to numeric LPA on job creation. API callers can also supply `salaryUnit: "INR"` for an annual rupee amount. Negative, invalid, and reversed ranges are rejected.

Existing numeric salaries are not silently converted based on their size. Older records that were actually entered in annual rupees need their unit confirmed before a separate data correction; guessing would change existing listings incorrectly.

The existing `GET /api/jobs` endpoint accepts `minSalary` and `maxSalary` in LPA, inclusive of both endpoints. Either bound can be omitted. It also accepts `title`, `location`, repeated `categories`, repeated `locations`, repeated `levels`, and comma-separated `skills`. Filters combine: a job must match all selected filter groups, any selected category/location/level within a group, and every requested skill. Older jobs without a separate skills field are searched through their title and description.

Example: `/api/jobs?minSalary=10&maxSalary=20&title=Developer&skills=React`. The database applies the filter before returning jobs. The frontend handles paging, loading, validation messages, and request cancellation. Empty results stay empty and failed requests display an error rather than showing sample jobs.

## Checks and current limitations

- The client offers `npm run build`, `npm run lint` and `npm test` (instant resume builder tests), run from `client/`. The root demo offers `npm run build` from the repository root.
- Run `npm test` from `server/` for regression tests. The request tests use real local HTTP, company token verification, and a local SMTP receiver, with database model methods replaced by controlled test data. They do not prove behavior against the hosted database or an external email provider.
- The older `test-email.js` and `test-cloudinary.js` files are manual service checks; running them can contact external services, and the email check sends a message. Prefer `npm run email:verify` for a connection-only check.
- The job listing and shared job data no longer replace empty or failed database results with sample jobs.
- Several source files contain large blocks of old, commented-out code. Read the active implementation when checking behavior.
- A resume details form exists as a source file but is not registered as a standalone page in `App.jsx`.
- Backend deployment configuration exists in `server/vercel.json`. Deployment and upload persistence have not been verified during this documentation task.
- Notification outcomes are recorded on applications with a status revision. A failed send is not automatically retried by repeating the same decision, which avoids duplicate delivery attempts after uncertain SMTP responses. There is no background retry worker; a process killed during delivery can leave a notification marked as sending.
- Live hosted database operations, external SMTP inbox delivery, browser interaction, and deployed behavior still require verification in the target environment. Full frontend lint reports 43 existing errors and 5 warnings (the original code reports 49 errors and 5 warnings). The changed search components pass focused lint checks.

## Change history

Add new completed tasks above older entries. Explain the result in everyday language and name the main files affected.

### 2026-11-19 - Connect local changes to the existing GitHub history

- **What changed:** Connected `origin` to the supplied Job-Portal repository and attached its existing `main` history without overwriting local files. Prepared the local feature changes for a normal commit, and removed ignored build and PDF review outputs from tracking.
- **Why:** Keep the earlier commits and upload the changes made after downloading the ZIP.
- **Files:** Git repository configuration/index and `PROJECT_GUIDE.md`; the commit also includes the earlier local feature changes documented below.
- **Checks:** Successfully read and fetched the remote branch; inspected the file list, largest upload candidates, and common credential patterns in application files (no matches). Application tests and builds were not rerun for this Git upload task; earlier results and limitations remain documented below.

### 2026-11-19 - Prepare local files for GitHub

- **What changed:** Expanded `.gitignore` to keep generated builds, logs, caches, and local PDF review outputs out of commits; documented the exclusions and ZIP download limitation.
- **Why:** Upload the project source without including generated files or local review material.
- **Files:** `.gitignore`, `PROJECT_GUIDE.md`.
- **Checks:** Inspected Git status, local Git configuration, and existing ignore rules. Git has no commits or remote address yet. GitHub CLI is unavailable. Application tests were not run because application code was not changed. Upload awaits the destination repository address.

### 2026-11-19 - Instant ATS-friendly resume generation

- **What changed:** "Generate Improved Resume" used to wait for Gemini, which took about 30 seconds to 3 minutes on this setup.
  - **Instant:** the button is now "⚡ Generate ATS-Friendly Resume (instant)". It builds the resume in the browser (`client/src/utils/atsResumeBuilder.js`) from the person's resume text and the ATS scan, in under 1 millisecond.
  - **What the instant builder does:** standard sections in a fixed order, matching skills and projects first, work experience kept in date order, tidy bullets, duplicates removed, and contact details on one line. It never adds skills, jobs or numbers. Missing keywords appear as a tip.
  - **Preview:** for the instant version it now shows the text as built. The old merge with the original resume is kept only for AI output, as a safety net against dropped details.
  - **AI polish:** the old AI rewrite is now an optional "✨ Polish wording with AI" button shown after the instant resume exists. It sends the instant version, asks Gemini with low thinking (about 6 times faster in testing), and gives up after 90 seconds (100 seconds in the browser) with a clear message.
- **Why:** The user said ATS-friendly resume generation was too slow.
- **Files:** New: `client/src/utils/atsResumeBuilder.js`, `client/tests/atsResumeBuilder.test.mjs`. Changed: `client/src/pages/ResumeATSSimulator.jsx`, `client/package.json` (`test` script), `server/controllers/aiController.js` (`generateImprovedResume`: low thinking and time limit).
- **Checks:** 4 new client tests pass (`npm test` in `client/`): skill and project ordering, no invented content, unchanged experience order, a kept summary, empty sections, job keywords, and speed (about 0.2 ms per resume). The builder was also run against the page's real `parseResume` and `buildResumeText` with the "Load Sample Data" resume. It took 3 ms, the output re-parsed into the same sections, and every skill came from the input. The client builds and the new file passes lint; the page keeps its 4 lint errors that were already there. The backend module loads. Not checked: clicking through the ATS flow in a browser, and a real "Polish with AI" call (one takes ~30 s or more here).

### 2026-11-19 - Forms fill themselves from an uploaded resume

- **What changed:**
  - **Apply page:** choosing a resume reads it and fills any empty name, email and phone fields. It shows "Reading your resume…" and then what was filled.
  - **ATS Simulator:** a new "📄 Auto-fill from Resume" button fills the whole Build Your Resume form, keeps anything the resume doesn't contain, and lists missing items.
  - **Server:** a new endpoint, `POST /api/resume/parse`, reads PDF, DOCX and TXT files using two new packages, `pdf-parse` and `mammoth`. Built-in rules find the name, email, phone, city, links, headed sections (summary, education, skills, projects, experience, certifications, achievements, languages), degree, college, year and grade. Gemini can improve the result when it answers in time.
  - **Privacy:** files are processed in memory and not stored.
- **Why:** The user asked for resume data to be retrieved and entered into the forms automatically.
- **Files:** New: `server/utils/resumeParser.js`, `server/routes/resumeRoutes.js`, `server/tests/resumeParser.test.js`, `client/src/utils/resumeAutofill.js`. Changed: `server/server.js`, `server/package.json` and `server/package-lock.json` (new packages), `client/src/pages/Applyjob.jsx`, `client/src/pages/ResumeATSSimulator.jsx`.
- **Checks:** 4 new tests pass. They cover the rules on a typical resume, AI merging and its fallback, the real sample PDF, file-type errors, empty files, and the upload endpoint's limits. The client builds and the new helper passes lint; the two changed pages still have lint errors that were already there. A live upload of the sample PDF to the running backend filled 13 fields. The ATS page showed the new button.
- **Not checked:** clicking through either form with a real resume in the browser.
- **Known limits:**
  - On this machine Gemini answered a one-word test only after about 3 minutes. Reducing its thinking still took about 30 seconds (`thinkingLevel: "low"`) or about 58 seconds (`thinkingBudget: 0`). So the delay comes from the AI service, the API key, or the network, not the request settings. Resume reading therefore uses the rules, and the first upload after a restart waits 12 seconds. Other AI features in the project are likely slow for the same reason.
  - Rules work best on resumes with clear section headings.
  - Old `.doc` files and scanned (image-only) PDFs can't be read.

### 2026-11-19 - Expired jobs disappear automatically

- **What changed:** Jobs whose application deadline has passed are no longer shown to job seekers.
  - **Server:** `GET /api/jobs` now adds an "open jobs only" rule (`openJobsOnly`): the deadline is in the future, or the job has no deadline.
  - **Website:** the job list, search count, pages and Saved Jobs also drop expired jobs. The job list re-checks every minute, so a card vanishes even if the page was left open. AI Match and ATS Simulator job pickers use the same list.
  - **Old links:** opening an expired job shows a "This job has closed" page with the date, instead of "Job Not Found".
  - **Recruiters:** Manage Jobs still lists expired jobs, with an "⏰ Expired · hidden" label.
  - **Unchanged:** nothing is deleted. Applications, messages and the hiring progress for expired jobs stay. Applying after the deadline was already refused by the server.
- **Why:** The user asked for jobs to disappear automatically when their application period ends.
- **Files:** New: `client/src/utils/jobDeadline.js`. Changed: `server/utils/jobFilters.js`, `server/controllers/jobController.js`, `server/tests/jobFilters.test.js`, `server/tests/workflows.test.js` (expects the new rule), `client/src/components/JobListing.jsx`, `client/src/pages/SavedJobs.jsx`, `client/src/pages/ManageJobs.jsx`, `client/src/pages/JobDetails.jsx`.
- **Checks:** The new filter test passes, and the jobs-API test now confirms the deadline rule reaches the database. 25 of 27 backend tests pass; the 2 failures are the earlier unrelated email-wording mismatch. On the live database, the public list went from 18 to 9 jobs; the other 9 visible jobs had passed their deadline, and none of the remaining ones are expired (checked with a read-only query). A screenshot of an expired job's link showed the "This job has closed" page. The client builds and the new helper passes lint. The changed pages still have lint errors that were there before. Not checked in the browser: the Manage Jobs label, which needs a recruiter login.

### 2026-11-19 - Job-specific chats start with a welcome message

- **What changed:**
  - **Welcome on apply:** applying to a job now starts that job's chat with a welcome message from the job's recruiter. Example: "Hi Asha! 👋 Thanks for applying for Frontend Developer at Acme. We've received your application… message us here any time."
  - **Saved once:** the message is stored as an automatic welcome (`kind: "welcome"`), at most once per chat. If the person had already messaged before applying, the welcome is added to that same chat.
  - **Older applications:** they get their welcome chat when the job seeker or recruiter next opens Messages, or when the job seeker opens that job's chat.
  - **Clearer screens:** both inboxes have a "filter by job" menu, a job/company/location line in the chat header, and a "📌 This chat is only about …" note. The welcome bubble has an "Automatic welcome" label. The job-page chat keeps its ready-made questions until the job seeker writes.
  - **Unchanged:** each conversation was already tied to one job seeker and one job, with the recruiter taken from the job.
- **Why:** The user asked for job-specific chats with the specific recruiter, starting with a welcome message whenever someone applies.
- **Files:** New: `server/utils/welcomeMessage.js`, `server/tests/welcomeMessage.test.js`. Changed: `server/models/Conversation.js`, `server/controllers/userController.js` (apply), `server/controllers/messageController.js`, `server/tests/messages.test.js`, `client/src/components/ChatThread.jsx`, `client/src/components/MessagesInbox.jsx`, `client/src/components/MessageRecruiterModal.jsx`.
- **Checks:** The new tests pass. They cover the welcome wording, one welcome per chat, separate chats and recruiters for different jobs, adding to an existing chat, an unknown job, and the older-application backfill. 24 of 26 backend tests pass; the 2 failures are the earlier unrelated email-wording mismatch. The client builds and the changed files pass lint. The running backend restarted cleanly, and its message routes still refuse visitors who aren't logged in. Not checked: applying and viewing the welcome through the browser with a real login. The older-application backfill runs every time an inbox list loads (about every 10 seconds); it does little work once all welcomes exist.

### 2026-11-19 - Light and dark mode

- **What changed:** The website has a light/dark mode switch (☀️/🌙) in the top bar and the recruiter dashboard header.
  - **Default:** it follows the device setting until the user picks a mode, then remembers the choice in that browser.
  - **No flash:** a small script in `client/index.html` applies the theme before the page draws.
  - **Colours:** they come from one generated CSS layer (`client/src/theme-dark.css`), so every existing page goes dark without editing each component. Deliberately dark parts, such as the ATS banner and coloured buttons, keep their look.
  - **Logos and widgets:** the Insiderjobs logo is flipped to light lettering. Partner logos sit on light chips. The Quill editor toolbar, form fields and pop-up notifications are themed.
  - **Tailwind:** it now uses `darkMode: "class"`, so future code can also use `dark:` classes.
- **Why:** The user asked for modern light and dark modes.
- **Files:** New: `client/src/utils/theme.js`, `client/src/components/ThemeToggle.jsx`, `client/src/theme-dark.css`, `client/scripts/generate-dark-theme.cjs`. Changed: `client/index.html`, `client/src/main.jsx`, `client/tailwind.config.js`, `client/package.json` (`theme:dark` script), `client/src/App.jsx`, `client/src/components/Navbar.jsx`, `client/src/components/Footer.jsx`, `client/src/components/Hero.jsx`, `client/src/pages/Dashboard.jsx`.
- **Checks:** The client builds and the new files pass lint. The `React` unused-import lint error in `App.jsx` was already there. Running the generator script from the project gives the same CSS file. Dark-mode screenshots checked the home, AI Match, ATS Simulator and My Applications pages, plus the progress tracker, chat, Job Alerts and status chips (with sample data). A light-mode screenshot confirmed the light look is unchanged. Not checked: clicking the switch in a real browser, logged-in pages (the recruiter dashboard and its forms, Add Job with the Quill editor, saved jobs, job details with real data), and the Clerk sign-in window, which stays light. Some less-used page areas may still show light colours; the fix is to add their class to the generator script.

### 2026-11-19 - Hiring process with progress tracking

- **What changed:** Applications now move through hiring stages: Applied, Under Review, Shortlisted, Interview, Offer Made and Hired, or Not Selected at any point.
  - **Recruiters:** in View Applications, a new Hiring Stage column has a "Move to…" menu. Normal stages open a pop-up with an optional note, a suggested note, and an "email the candidate" option. Interview and Not Selected reuse the existing Accept and Reject forms and emails, and those now also record the stage.
  - **Job seekers:** My Applications shows a step tracker, the latest note, and an expandable timeline for each application.
  - **Data:** new applications start with an "Applied" entry. The older `status` field is kept in sync (Pending for early stages, Accepted for Interview onwards, Rejected for Not Selected), so existing screens and emails still work.
  - **Email:** there is a new progress email for stage moves. If `FRONTEND_URL` is set, it links to My Applications. An email failure never undoes a stage change.
  - **Help chatbot:** its answers about status and applicants were updated.
- **Why:** So candidates can follow their progress and recruiters can update it step by step.
- **Files:** New: `server/utils/hiringStages.js`, `server/tests/hiringStages.test.js`, `client/src/utils/hiringStages.js`, `client/src/components/ApplicationProgress.jsx`, `client/src/components/StageUpdateModal.jsx`. Changed: `server/models/JobAppliaction.js`, `server/controllers/companyController.js`, `server/routes/companyRoutes.js`, `server/controllers/userController.js` (first "Applied" entry), `server/utils/statusEmail.js` (progress email), `client/src/pages/ViewApplications.jsx`, `client/src/pages/ApplicationDashboard.jsx`, `client/src/components/HelpChatbot.jsx`.
- **Checks:** 2 new tests pass. They cover each stage move, status sync, no duplicate entries for the same stage, email failure keeping the change, invalid stages and notes, another company being blocked, a bad token, and Accept recording an Interview entry with the interview date. 22 of 24 backend tests pass; the 2 failures are the earlier unrelated email-wording mismatch. The client builds and the new files pass lint. The two changed pages still have lint errors that were there before this change. The tracker, timeline and recruiter pop-up were checked in a rendered preview with sample data. Real updates and emails weren't tried because this machine has no database, login key or email settings.
- **Known limits:** Once an application is at Offer Made or Hired, choosing Interview again doesn't move it back, because Accept sees the status is already Accepted. Older applications have no timeline entries before this change.

### 2026-11-19 - New-job emails go only to matching profiles

- **What changed:** Posting a job used to email every registered user. Now only users whose profile fits the job are emailed.
  - **Preferences:** users can set Job Alerts on My Applications (roles/categories, skills, locations, levels, and an on/off switch). Every group they fill in must fit the job.
  - **Activity fallback:** users who have set nothing are matched against the jobs they applied to or saved. They match on the same category, or on two shared skills (one, if the new job lists only one skill).
  - **No email:** users with nothing to go on, or with alerts turned off, get no email. So do users whose stored address is a placeholder.
  - **Email wording:** the email now has a "Why you got this" line listing what matched. It now reports a failed send instead of hiding it, so the server log shows how many people matched, were sent, or failed.
- **Why:** So job seekers only get emails about jobs that suit them, instead of every job.
- **Files:** New: `server/utils/jobAlertMatcher.js`, `server/utils/jobAlerts.js`, `server/tests/jobAlerts.test.js`, `client/src/components/JobAlertPreferences.jsx`. Changed: `server/models/User.js` (new `jobPreferences`), `server/controllers/companyController.js` (job posting uses the matcher), `server/controllers/userController.js` and `server/routes/userRoutes.js` (preference endpoints), `server/utils/sendEmail.js` (reason line, failures reported), `client/src/pages/ApplicationDashboard.jsx`.
- **Checks:** 4 new tests pass. They cover each matching rule, "Java" not matching "JavaScript", opt-out, the activity fallback, input validation, and that only matching users are emailed (with failures counted). Overall, 20 of 22 backend tests pass; the 2 failures are the earlier unrelated email-wording mismatch. The client builds and the new component passes lint. A rendering of the Job Alerts card was checked. Saving real preferences and sending real emails weren't tried because this machine has no database, login key or email settings. **Existing users have no preferences yet**, so until they set some, only those with past applications or saved jobs will get new-job emails.

### 2026-11-19 - Fixed missing "Accepted" status emails

- **What changed:** Accepting an application now works and sends the acceptance email. Before, only rejection emails were delivered.
- **Why:** In `server/models/JobAppliaction.js`, `interviewDetails` had a sub-field written as `type: String`. Mongoose reads a `type` key as a type declaration, so it treated the whole `interviewDetails` field as a String. Accepting saves interview details as an object, so the database update failed with a CastError. That meant the status wasn't saved and no email was sent. Rejections don't save interview details, so they worked. The sub-field is now declared as `type: { type: String }`.
- **Files:** `server/models/JobAppliaction.js`, `server/tests/applicationModel.test.js` (new regression test).
- **Checks:** Before the fix, a test of the accept update failed with "Cast to string failed for value … at path interviewDetails". After the fix, the new test passes. Overall, 16 of 18 backend tests pass. The 2 failures are the earlier email-wording mismatch in `server/utils/emailTransport.js`, unrelated to this fix. No real email was sent or hosted database checked from this machine. The backend must be restarted or redeployed for the fix to apply.

### 2026-11-19 - Job seekers can message recruiters

- **What changed:** Job seekers can now message the recruiter about a job, a change to a job post, or their application. Job pages have a 💬 Message Recruiter button that opens a chat with suggested questions. A new **Messages** button in the top bar opens `/messages`, which lists every conversation. Recruiters get a **Messages** tab in their dashboard where they can read and reply, with suggested replies. Both sides see unread counts, and chats refresh every 8–10 seconds. The Help chatbot gained a "How do I message a recruiter?" answer.
- **How it is protected:** Job seekers must be signed in with Clerk. Recruiters use their company login token. The recruiter on a conversation is always taken from the job itself, not from what the browser sends. Recruiters can only open or reply to their own company's conversations, and job seekers can only see their own. Messages must be 1–2000 characters.
- **Why:** So job seekers can ask questions about jobs and job updates directly.
- **Files:** New: `server/models/Conversation.js`, `server/controllers/messageController.js`, `server/routes/messageRoutes.js`, `server/tests/messages.test.js`, `client/src/components/ChatThread.jsx`, `client/src/components/MessagesInbox.jsx`, `client/src/components/MessageRecruiterModal.jsx`, `client/src/pages/Messages.jsx`, `client/src/pages/RecruiterMessages.jsx`. Changed: `server/server.js`, `client/src/App.jsx`, `client/src/pages/JobDetails.jsx`, `client/src/pages/Dashboard.jsx`, `client/src/components/Navbar.jsx`, `client/src/components/HelpChatbot.jsx`.
- **Checks:** The new messaging test passes. It covers sign-in checks, empty or too-long messages, unknown jobs, reuse of the same conversation, recruiter-only access, unread counts and replies, using real HTTP and token checks with the database replaced by test data. 14 of 16 older backend tests pass. The 2 failures come from an earlier edit in `server/utils/emailTransport.js` that changed an error message the tests expect; this task didn't touch email code. The client builds and the new files pass lint. A screenshot confirmed the Messages page and top-bar button. Sending real messages couldn't be tried in a browser because there's no database or login key on this machine. Messages don't send email or push notifications.

### 2026-11-19 - Website opens without the login key (no-login mode)

- **What changed:** The website no longer shows a blank page when `VITE_CLERK_PUBLISHABLE_KEY` is missing. In that case, `client/vite.config.js` swaps the Clerk login library for a small stand-in (`client/src/auth/clerkFallback.jsx`). Everyone is treated as signed out, and Login / Register shows a "login not set up" message. `client/src/main.jsx` no longer throws an error. When the key is present, real Clerk login works as before.
- **Why:** Without the private key, the whole site was invisible, so nobody could view or check it.
- **Files:** `client/vite.config.js`, `client/src/main.jsx`, `client/src/auth/clerkFallback.jsx` (new). A plain-English note was added to `CHANGES.md`.
- **Checks:** The client production build passes and the changed files pass lint. An unused `StrictMode` import that was already in `main.jsx` is still there. Headless Chrome screenshots show the home and AI Match pages with the navbar and chatbot. Job listings show "Network Error" because the backend isn't running: this machine has no `server/.env` and no database. Real Clerk login was not tested.

### 2026-11-19 - Added a Help chatbot

- **What changed:** A floating help button (robot emoji) appears in the bottom-right corner of every page and opens a chat window. It answers 14 common questions grouped into Job seekers, Resume tools, Recruiters and General. Users can tap a question or type their own; typed questions are matched by keywords. Some answers include a link to the relevant page.
- **Why:** Give users quick self-service help.
- **Files:** `client/src/components/HelpChatbot.jsx` (new; answers are in its `FAQS` list), `client/src/App.jsx`, `client/src/index.css`. A plain-English log is also kept in `CHANGES.md`.
- **Checks:** Client production build passes and the new component passes lint. Keyword matching was tested with 10 sample questions. Not yet checked by clicking through it in a browser. Answers are fixed text with no AI or server calls; they must be updated by hand if features change.

### 2026-11-13 - Fixed application emails and added database salary filtering

- **What changed:** Accepted and rejected status changes now wait for a real email attempt, use registered account addresses, include company contact details, and report delivery failures without losing the decision. Repeated/concurrent same-status requests send no duplicate notification. Salary inputs now use LPA and search the database alongside title, location, category, experience, and skills. Clear Filters also resets the hero search fields. Added configuration examples and an SMTP verification command.
- **Why:** Candidates were missing status emails, and the existing salary controls used inconsistent labels and only filtered browser data.
- **Files:** Client job listing, hero, shared state, recruiter applications and salary form; server job/company/user controllers, Clerk webhook, job/application models, email/profile/salary/filter utilities, tests, scripts, and configuration example.
- **Checks:** All 16 backend tests pass, along with the frontend production build, focused search-component lint, backend syntax checks, and Git whitespace checks. Tests cover duplicate requests, ownership, delivery failures, registered addresses, actual recruiter details, primary-email webhooks, range boundaries, combined filters, invalid inputs, and empty results. Request tests use controlled database model methods and a real local SMTP receiver. Hosted database, interactive browser flows, and real inbox delivery were not tested; full frontend lint has pre-existing failures.

### 2026-11-13 - Added the project guide and Codex maintenance instructions

- **What changed:** Created this guide and `AGENTS.md`, covering the job portal, backend, separate footer demo, setup, and known limitations.
- **Why:** Make the project understandable and require future Codex code changes to include a plain-English documentation update.
- **Files:** `PROJECT_GUIDE.md`, `AGENTS.md`.
- **Checks:** Reviewed package scripts, page routes, backend routes, data models, service configuration, shared client state, matching code, and key controller flows. Checked documentation links and Git changes. Application builds and live service tests were not run because this task changes documentation only.
