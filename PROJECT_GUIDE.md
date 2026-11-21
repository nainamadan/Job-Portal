# Project guide

This file explains the project in simple English. Codex must keep it up to date when changing the code, following `AGENTS.md` in this folder. Updates happen during Codex tasks; this file does not watch for changes on its own.

## What this project does

The main project is a job portal. People can browse jobs, save jobs, apply, manage their resume, and track applications. Recruiters can create accounts, publish jobs, view applicants, and change application statuses.

The project also includes resume matching, an ATS resume simulator, AI writing tools, and an AI visual learning roadmap generator. People can turn a skill into a connected learning path and save their progress. ATS means applicant tracking system: the simulator estimates how well resume text matches a job. Its score is a guide, not a guarantee of an employer's result.

The **Skill Proof Vault** lets candidates back up technical skills with working projects, source code, optional demos or walkthroughs, and an explanation of their own contribution. Recruiters at companies they have applied to can inspect this evidence and approve it or request improvements. These are human reviews of submitted evidence, not automatic skill certifications.

The **Auto Portfolio Generator** combines resume details and selected public GitHub projects into a personal website. Candidates review the content, choose a style, and optionally add a profile photo in the last step. The result is a downloadable HTML website with the photo and styling included. A private draft can be saved to the candidate's account; the tool does not publish a website automatically.

If the portfolio saving service cannot be reached, local editing, the photo step and HTML generation/download remain available. Saving stays disabled until the server confirms the saved-draft state. On reconnection, existing saved work and current unsaved work are kept separate until the candidate chooses which version to continue with.

The job portal adapts to phone, tablet and desktop screens. Phone users get a compact navigation menu, stacked forms and cards, and dialogs that scroll within the available screen height. Recruiter job and applicant tables become labeled cards on phones, so all actions remain available without making the page wider than the screen.

There are three separately runnable parts in this repository:

| Folder | Purpose |
| --- | --- |
| `client/` | The job portal website, built with React and Vite. |
| `server/` | The Express backend. It handles requests from the website and stores records in MongoDB. |
| Root `app/` and `public/` | A separate Next.js creative studio footer demo, with a video background. The root start command runs this demo. |

## Features present in the code

### For everyone

- Responsive navigation: the menu button opens all main links below desktop width, closes after choosing a destination, and also closes with Escape or a tap outside. Theme and account controls stay in the header. Long names, email addresses, project text and job descriptions wrap within their cards. Shared form fields use a readable size on phones, while job filters and Help occupy separate corners. Footers stack on narrow screens.
- Light and dark mode. A ☀️/🌙 switch sits in the top bar and in the recruiter dashboard header. Until someone uses it, the site follows the device's light or dark setting. After that, their choice is remembered in that browser. The saved theme is applied before the page draws, so there is no white flash. Pop-up notifications follow the theme too. The Clerk sign-in window stays light.

### For job seekers

- Open **Portfolio Generator** in the navigation menu (`/portfolio-generator`) and sign in. The four steps are **Resume → GitHub → Review & style → Photo & generate**. Import a PDF, DOCX or TXT resume under 5MB or enter details manually. Resume import fills empty fields and preserves existing edits; the professional headline is entered by the candidate. Import a GitHub username/profile URL and select up to six public projects, or add projects manually. Review the profile, skills, projects, experience, education and optional contact information, then choose Studio (light) or Midnight (dark) with an indigo, teal or rose accent. The final step accepts an optional JPEG, PNG or WebP image under 5MB; it can be replaced or removed. Without a photo, the website uses initials. **Generate portfolio** enables **Download website** and **Open preview**. The HTML file opens independently in a browser and contains its own styling and processed image. **Save draft** stores one private draft per account, including the photo and featured projects, so it can be reopened later. Changes are not saved automatically. Both the builder and generated website adapt to phones; the preview also has a phone-width option.
- Open **Skill Proof Vault** in the top bar (`/skill-proof-vault`). Add your own project or complete one of five practical challenges for React, JavaScript, Node.js, Python or SQL. Each challenge lists what the submission should demonstrate. A proof needs a title, 1–8 skills, a description of what works, your personal contribution and technical decisions, and an HTTPS source-code link. A live demo and a walkthrough/video link are optional. Search your vault by title or skill and filter by review status. Candidates can read each reviewing company's feedback. Editing a proof creates a new version and clears every previous review and approval; deleting it removes it from candidate and recruiter views. Visitors can browse challenges, but saving and opening a personal vault require sign-in. The page supports phones and light/dark mode.
- Browse and search job listings, then open a job's details. Combine title, location, category, experience, skills, and minimum or maximum annual salary in LPA. Clear Filters resets all of these fields.
- Sign in through Clerk, which manages job seeker accounts.
- Open **Learning Roadmap** in the top bar (`/learning-roadmap`). Enter a skill or technology, choose a starting level and weekly learning hours, and Gemini creates a branching visual path with prerequisites, topics, practice, projects and milestones. If the first Gemini model is busy, unavailable or too slow, generation automatically tries a second Gemini model within the same time limit. Temporary failures offer a **Try again** button and keep the previous map visible. The main view is an interactive React Flow canvas: pan, zoom, drag boxes, use the minimap, fit the whole path, or arrange the boxes again. Selecting a box opens its explanation, estimated hours, documentation, YouTube tutorial search and exercises. Completed boxes turn green and the progress percentage changes. Signed-in users' generated roadmaps, completion choices and box positions are stored in MongoDB. The saved-path menu shows their 50 most recently updated roadmaps, and `/learning-roadmap/:roadmapId` reopens one directly. Visitors can explore a clearly labeled React example; example progress lasts only for that page visit. The page supports light/dark mode and stacks the topic details below the canvas on phones.
- Save jobs. The website uses browser storage and also has server endpoints for signed-in users' saved jobs.
- Choose which new-job emails to receive in the **🔔 Job Alerts** card on My Applications: roles/categories, skills, locations and experience levels, plus an on/off switch. Every group you fill in must fit the job; for example, choosing skill "React" and location "Pune" means only React jobs in Pune.
- Message the recruiter about a job. Each job page has a 💬 **Message Recruiter** button, and the **Messages** page (`/messages`) lists every conversation and its replies. You must be logged in. Each conversation is about one job, between one job seeker and the recruiter of the company that posted that job; the company is always taken from the job, never from the browser. Applying to a job automatically starts that job's chat with a welcome message on the recruiter's behalf, marked "Automatic welcome". Applications made before this feature get their welcome chat the first time Messages or that job's chat is opened. The inbox has a "filter by job" menu, and each chat says which job and company it is about. Ready-made questions such as "Has anything changed in this job post?" show until the job seeker sends their first message. New replies show up within about 10 seconds; there are no email or push notifications for messages.
- Upload a resume and apply for jobs. The backend rejects duplicate applications and applications after a job's deadline. Choosing a resume on the Apply page reads it and fills any empty name, email and phone fields; the phone becomes 10 digits. A note shows what was filled. Old `.doc` files and scanned images can't be read, but can still be attached.
- Track each application's progress on My Applications. A step tracker shows 📝 Applied → 👀 Under Review → ⭐ Shortlisted → 🗓️ Interview → 🎁 Offer Made → 🎉 Hired, or ❌ Not Selected. A timeline lists every update with its date and any note from the recruiter. Older applications without saved stages show a stage worked out from their old status.
- On phones, swipe within the hiring-stage tracker to read every stage. Job search no longer scrolls the page on arrival; it moves to results after pressing Search. The Messages inbox uses one pane at a time on phones and tablets, with a back button to return to the conversation list. Its composer remains clear of the floating Help button. Long messages wrap, and quick replies scroll inside the chat.
- Compare resume text with job descriptions and see matching or missing skills.
- Use the ATS simulator for analysis, AI improvement suggestions, and improved resume generation. **⚡ Generate ATS-Friendly Resume (instant)** builds the resume in the browser in milliseconds, with no AI. It uses a single column, standard headings, contact details on one line, job-matching skills and projects first, tidy bullets, and duplicates removed. It only uses the person's own content; if there is no summary, one is written from their degree and skills. Missing job keywords are shown as a tip, not added. **✨ Polish wording with AI** is an optional slower step that sends the resume to Gemini; on this setup it takes roughly 30 seconds or more, and it gives up after 90 seconds. Its **📄 Auto-fill from Resume** button reads an uploaded PDF, DOCX or TXT resume and fills the "Build Your Resume" form: contact details, links, summary, education, skills, projects, experience, certifications, achievements and languages. It then lists what wasn't found, so the person can review and complete it. The resume download flow uses the browser's print window to save as PDF.

### For recruiters

- Recruiter navigation sits above page content on phones and stays in a sidebar on larger screens. Manage Jobs and View Applications show labeled cards below 768px, including visibility, resume links, skill proofs, stage selection and decision buttons. On tablets, wide tables scroll within their own region. Login, resume, hiring-stage, interview, rejection and match dialogs stay inside the available viewport and scroll internally when needed, including short landscape screens.
- In **View Applications**, choose **Review skill proofs** below a candidate's resume to inspect their current vault. Open the source code, demo or walkthrough, read their contribution and any challenge acceptance criteria, then approve the evidence or request improvements with written feedback. The reviewer must confirm they inspected the evidence. Each company has its own review; recruiters see only their own company's feedback, while the candidate sees all reviews. Access is checked against an application belonging to the signed-in company. An outdated proof version cannot be reviewed, and simultaneous reviews cannot silently overwrite one another. Reviews do not change the existing resume match score or the hiring stage.
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
7. Gemini provides AI writing features and structured visual learning roadmaps. The roadmap server checks topics, resource URLs and connections before saving a roadmap; it rejects cycles, disconnected paths and simple linear lists. Basic resume matching and ATS scoring use rules in the project's own skill matcher files rather than a Gemini response.
8. Nodemailer sends notifications using configured SMTP or Gmail credentials. It does not silently replace real delivery with a test inbox or console log. Sentry is configured to collect backend errors.

## Where to find things

| File or folder | What it controls |
| --- | --- |
| `client/src/App.jsx` | Website page addresses and recruiter dashboard routing. |
| `client/src/styles/responsive.css` and `client/src/main.jsx` | Shared phone/tablet layouts, compact main navigation, wrapping for long content, readable mobile form fields, viewport-limited dialogs, recruiter table-to-card layouts, contained progress scrolling, and chat/Help sizing. The stylesheet is loaded after the base theme. It fixes component sizing without hiding page-wide overflow. |
| `client/src/components/Navbar.jsx` and `client/src/pages/Dashboard.jsx` | Collapsible main navigation with Escape/outside-tap handling, and the recruiter's responsive header, sidebar and phone navigation. |
| `client/src/pages/ManageJobs.jsx` and `client/src/pages/ViewApplications.jsx` | Table cells carry labels for the phone card layout; desktop/tablet tables retain their headers and contained horizontal scrolling. |
| `client/src/pages/` | Job pages, applications, saved jobs, recruiter tools, and resume tools. |
| `client/src/pages/PortfolioGenerator.jsx` | The four-step portfolio builder, resume/GitHub import, project selection, private draft saving/reopening, image selection in the last step, theme controls, live preview and HTML download. Changing accounts remounts private state. |
| `client/src/components/portfolio/` and `client/src/styles/portfolio-generator.css` | Editable profile/project forms and the generator's responsive light/dark interface. |
| `client/src/utils/portfolioGenerator.js`, `client/src/utils/portfolioPhoto.js`, `client/tests/portfolioGenerator.test.mjs` | Resume-to-portfolio mapping, GitHub username/link checks, escaped standalone HTML generation and filenames, local image resizing/re-encoding, and content/export regression tests. |
| `client/src/utils/portfolioApi.js` and `client/tests/portfolioApi.test.mjs` | Checks saved-draft response shape and revisions, distinguishes an explicitly empty draft from a missing/broken endpoint, and explains service errors without exposing a raw HTTP failure. |
| `server/models/Portfolio.js`, `server/routes/portfolioRoutes.js`, `server/utils/portfolio.js`, `server/tests/portfolio.test.js` | One private MongoDB draft per Clerk user, revision checks, bounded text/project/photo validation, public GitHub imports and HTTP/model/import regression tests. |
| `client/src/pages/SkillProofVault.jsx` | Candidate vault, public challenge catalog, search/status filters, loading/error states, and authenticated create/edit/delete requests. Changing the signed-in account remounts private state. |
| `client/src/components/skill-proof/` and `client/src/styles/skill-proof.css` | `ProofCard.jsx` presents evidence and feedback; `ProofEditor.jsx` collects project evidence; `VaultDialog.jsx` uses a native dialog for focus and Escape behavior; `RecruiterProofVault.jsx` opens applicant evidence and saves company reviews. The stylesheet provides responsive light/dark layouts. |
| `server/models/SkillProof.js`, `server/controllers/skillProofController.js`, `server/routes/skillProofRoutes.js` | MongoDB evidence and per-company feedback, owner-only candidate writes, application-scoped recruiter access, and version guards. |
| `server/utils/skillProof.js` and `server/tests/skillProof.test.js` | Five authored practical challenges, input/link checks, response privacy, and HTTP/model regression tests for the vault. |
| `client/src/pages/LearningRoadmap.jsx` | Learning preferences, Gemini generation, saved-path selection, authenticated requests, completion and layout saving. Private state is cleared when the signed-in account changes. |
| `client/src/components/roadmap/` | `RoadmapCanvas.jsx` renders the connected React Flow diagram and its controls; `RoadmapNode.jsx` draws topic boxes; `TopicPanel.jsx` shows explanations, prerequisites, resources, exercises and the completion button. |
| `client/src/utils/roadmapGraph.js`, `client/src/data/roadmapPreview.js`, `client/src/styles/learning-roadmap.css` | Automatic layered layout and progress calculations, the labeled authored example, and responsive light/dark styling. The roadmap page is loaded separately so React Flow does not join the initial home-page bundle. |
| `server/models/LearningRoadmap.js`, `server/controllers/roadmapController.js`, `server/routes/roadmapRoutes.js` | MongoDB learning records and `/api/roadmaps` requests. Every request requires Clerk sign-in and every database operation is scoped to the signed-in owner. Single-topic completion and position-only updates avoid overwriting other progress. |
| `server/utils/learningRoadmap.js`, `server/tests/learningRoadmap.test.js`, `client/tests/roadmapGraph.test.mjs` | Gemini's structured response format, content/graph/link validation, generation timeout, progress calculations, and roadmap regression checks. |
| `server/scripts/verify-roadmap-ai.js` | Makes a real Python-roadmap request to check the configured Gemini models without connecting to MongoDB. `--diagnose` adds a redacted provider error message if generation fails. |
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
| `/skill-proof-vault` | Candidate project evidence, recruiter feedback and practical technical challenges. |
| `/portfolio-generator` | Sign-in welcome or the candidate's private portfolio builder, preview and website export. |
| `/learning-roadmap` | Generate and explore interactive visual learning roadmaps, or resume the most recently updated saved path. |
| `/learning-roadmap/:roadmapId` | Reopen a specific roadmap belonging to the signed-in user. |
| `/dashboard` or `/dashboard/add-job` | Recruiter job creation. |
| `/dashboard/manage-jobs` | Recruiter's job listings and visibility controls. |
| `/dashboard/view-applications` | Recruiter's applicants and status controls. |
| `/dashboard/messages` | Recruiter's inbox for job seekers' questions. |

The backend groups its requests under `/api/jobs`, `/api/users`, `/api/company`, `/api/messages`, `/api/resume`, `/api/roadmaps`, `/api/skill-proofs`, and `/api/portfolios`. These page addresses describe the Vite client, not the separate root demo.

Portfolio requests require the existing Clerk bearer token. `GET /api/portfolios/mine` returns the signed-in user's saved draft or `null`. `PUT /api/portfolios/mine` validates and saves the editable fields, selected projects, theme, accent and processed `photo` data URL. Send `revision: 0` to create the first draft; later saves require the current numeric revision. A unique owner index and atomic revision check return HTTP 409 for concurrent/stale saves instead of overwriting a newer draft. Owner identity always comes from Clerk. `GET /api/portfolios/github/:username` imports a public GitHub profile and its 100 most recently pushed repositories through [GitHub's public repositories API](https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28). The server removes private, forked, archived and other-owner records, returns safe source/demo links, and never fetches repository code or README content. Each import uses two fixed GitHub API addresses with a shared 12-second deadline; candidate tokens are not forwarded. Each user can make five imports per ten minutes per server process. GitHub's shared unauthenticated rate limits can still cause a retry message. Resume import reuses `POST /api/resume/parse`.

Skill vault requests: public `GET /api/skill-proofs/challenges` lists the authored tasks. Clerk-authenticated `GET` and `POST /api/skill-proofs/mine` list or create a candidate's proofs; `PATCH` and `DELETE /api/skill-proofs/mine/:id` edit or remove one. Edits and deletes require the current numeric `revision` in the JSON body. Recruiters use their existing company token for `GET /api/skill-proofs/company/applications/:applicationId` and `PUT /api/skill-proofs/company/applications/:applicationId/:id/review`. Review requests include `revision`, `status` (`approved` or `needs_work`), feedback `note`, and `reviewedEvidence: true`. The application determines the candidate and must belong to the company; browser-supplied candidate or company identities are not accepted. HTTP 409 means the content or reviews changed and the reviewer/editor must refresh. Proof records are shared automatically with companies the candidate has applied to, including past applications; there is no public portfolio link.

Roadmap requests use the existing Clerk bearer token: `GET /api/roadmaps` lists saved summaries, `POST /api/roadmaps/generate` takes `skill`, `level` and `hoursPerWeek`, and `GET /api/roadmaps/:id` opens a saved path. `PATCH /api/roadmaps/:id/nodes/:nodeId` sets a boolean `completed`; `PATCH /api/roadmaps/:id/layout` saves an array of `{ id, x, y }` positions. The server calculates progress from saved nodes instead of accepting a percentage from the browser. Another user's roadmap is returned as not found.

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

Skill Proof Vault uses the existing Clerk, company login and MongoDB settings. It adds no dependencies, API keys or upload service. Restart the backend and rebuild/restart the client after updating. MongoDB creates the new `SkillProof` collection when proofs are first saved; existing users and applications need no migration. Open `/skill-proof-vault` as a candidate, add a proof, and open **Review skill proofs** on an application as its recruiter to check the connected flow.

Responsive layout changes need no new dependency or environment setting. Restart the client development server or rebuild the client for deployment. They apply to the job portal in `client/`; the separate root footer demo keeps its existing layout.

Portfolio Generator adds no dependency or API key. It uses the existing Clerk and MongoDB setup; restart the backend and restart/rebuild the client after updating. MongoDB creates the `Portfolio` collection on the first saved draft, with no migration for existing users. Resume reading uses the existing optional Gemini setup and its rule-based fallback; website generation itself is local and immediate. Public GitHub import needs outbound HTTPS access to `api.github.com`, with no GitHub sign-in/token configuration. Photo processing runs in the browser and sends only the resized JPEG when the candidate saves a draft. The original image is not uploaded. To check the feature, sign in, import or enter resume details, select projects, add an image in the final step, generate/download, save, and reopen the page.

If Portfolio Generator reports an unavailable saving service or `GET /api/portfolios/mine` returns 404, restart the backend from this checkout's `server/` folder with `npm run server`, then press **Try again** or refresh the page. A plain `node server.js` process keeps its old routes in memory until restarted; the development command uses nodemon to reload changed backend files. Only one backend should listen on the configured port. A working draft endpoint returns JSON with `portfolio: null` for a new signed-in user; a 404 is not an empty draft. Without a sign-in token, the current endpoint returns 401. Draft loading has a 15-second timeout. After a failed load, the form stays usable and saving remains disabled until a successful, validated response. If a retry finds a saved draft while local edits exist, choose **Open saved draft** to replace local changes or **Keep current work** to retain them before saving.

The client dependency installation includes `@xyflow/react` (React Flow 13). Learning roadmaps use the existing MongoDB connection, Clerk configuration and server-side `GEMINI_API_KEY`; there is no additional external account to create. Restart the backend after adding or changing the roadmap routes and reinstall client dependencies before starting the updated frontend. `GEMINI_ROADMAP_MODEL` can optionally choose a model that supports structured JSON output and low thinking; by default the feature first uses the same `gemini-3.8-flash` model as the existing AI controller. `GEMINI_ROADMAP_FALLBACK_MODEL` optionally chooses its backup, defaulting to `gemini-3.1-flash-lite`. No environment changes are required to enable automatic recovery. Never put the Gemini key in the frontend.

To check real roadmap generation, run `node scripts/verify-roadmap-ai.js` from `server/`. This uses the configured Gemini API key and counts as real AI usage, but only sends a public Python-learning example and creates no MongoDB records. Add `--diagnose` to see a redacted provider error message. Model-list access alone does not prove that a model will accept generation requests.

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
| Server | `GEMINI_API_KEY` | AI writing features and visual learning roadmap generation. |
| Server | `GEMINI_ROADMAP_MODEL` | Optional learning-roadmap model override; defaults to the existing AI controller's model. |
| Server | `GEMINI_ROADMAP_FALLBACK_MODEL` | Optional backup model for learning roadmaps; defaults to `gemini-3.1-flash-lite`. |
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

- Portfolio Generator does not host/deploy the output, provide a public share URL, import private GitHub repositories, verify GitHub identity/project authorship, execute repository code, or invent experience/credentials. GitHub import looks only at the first 100 most recently pushed repositories, and the candidate selects up to six; the other imported choices are not stored in the draft. GitHub access/rate limits and unreadable/scanned resumes can require manual entry. Resume parsing retains the existing optional AI behavior and needs review. Saved drafts require live Clerk/MongoDB services. There is one saved draft per account and no automatic saving, draft history or deletion control yet. Editing and website downloads work even if draft loading/saving fails; local edits remain in memory until explicitly saved, and a retry cannot silently replace them with server data. Unreachable or malformed draft responses keep saving disabled until the service recovers. Exported contact information and photos are visible to anyone receiving the HTML file, so unwanted details should be removed before sharing.
- Portfolio photos are limited to JPEG/PNG/WebP under 5MB and up to 40 megapixels; they are decoded locally, resized to a maximum edge of 640px and re-encoded as JPEG, which removes the original metadata and flattens transparency onto white. The processed data URL must be under 700,000 characters. The browser rejects unreadable images; the server checks supported MIME types, base64 structure and format headers, and rejects SVG. The generated HTML escapes imported/user text, omits unsafe links, includes a content security policy and uses no scripts or external styles/fonts; in-app preview uses a sandboxed frame. These controls do not determine whether the candidate has permission to share the submitted work.
- Portfolio tests cover resume merging, preservation of edits, unsafe URLs and HTML injection, image format/size checks, safe filenames, MongoDB model/index declarations, owner-only drafts, spoofed ownership, simultaneous saves, GitHub filtering/provider failures and per-user import limits. Controlled browser checks cover resume import, project selection and failure recovery, themes, final-step photo validation/resizing, generation, draft save/reload and account isolation, failed saves, guest sign-in, and a real HTML download with the image embedded. Builder and downloaded-site layouts were checked at 320, 390, 768 and 1440px with synthetic auth/API data. A real, read-only GitHub import from the public Octocat example account returned six projects. Live Clerk/MongoDB persistence, physical devices and deployment were not tested.
- Responsive checks use local, synthetic candidate/company accounts and populated API fixtures, including long names, emails, job titles and messages. The earlier audit covered the 14 routes present at that time at 320, 390, 768, 1024 and 1440 CSS pixels. The added Portfolio Generator and its exported website were checked separately at 320, 390, 768 and 1440px. This does not replace testing physical iPhones/Android phones, a device keyboard, real Clerk dialogs, or deployed data. Wide recruiter tables on tablets, hiring stages, quick replies and the learning canvas intentionally scroll or pan within their own component. The separate root Next.js demo was not changed or rebuilt in these tasks.
- Skill Proof Vault stores links and explanations; it does not upload project files, execute code, run challenge tests, verify repository ownership, detect plagiarism, or proctor candidates. Recruiters must inspect the evidence and assess authorship themselves. Link validation checks HTTPS format and obvious local addresses; the server does not fetch links or check availability. External repository/demo content can change without editing the saved proof, so approval is an assessment of what the recruiter inspected, not a tamper-proof snapshot. Challenges and completion estimates are authored suggestions. Reviews have no email notifications or live refresh; use the refresh control to see new feedback. There is no public sharing, per-proof visibility choice, or application-time snapshot; companies with an application can inspect the candidate's whole current vault.
- Vault regression tests cover validation, defaults, candidate/company identity spoofing, ownership, unauthorized access, per-company feedback privacy, approval invalidation, stale edits/deletes/reviews, simultaneous company reviews and deletion. Tests use real local HTTP and JWT checks with controlled database methods and Clerk identity. A headless browser check with synthetic authentication and an in-memory API covered guest sign-in prompts, challenges, dialog focus, form retention after failed saves, create/reload, mobile/dark layouts, recruiter reviews, edit invalidation and delete confirmation. Real Clerk accounts and a live MongoDB write were not tested.
- The client offers `npm run build`, `npm run lint` and `npm test` (instant resume builder, roadmap layout/progress, portfolio mapping/HTML safety, and portfolio service-response tests), run from `client/`. The root demo offers `npm run build` from the repository root.
- Learning roadmap generation allows one active request and five user attempts per ten minutes for each signed-in user, per server process. Invalid input does not use an attempt. These limits reset on restart and are not shared between server instances. Each user attempt makes at most two Gemini calls. A stalled primary model is cancelled after 30 seconds so the backup has time to finish; both calls and the brief retry delay share one 90-second deadline. The browser allows 105 seconds. Duplicate model names are only tried once, and authentication or request-configuration errors are not retried. Hosting must allow long enough requests. The schema sent to Gemini describes the response's structure without nested array/numeric bounds that can exceed Gemini's serving limits; the server still enforces the original 12–32-topic limits, time ranges, resource checks and graph rules before saving. Provider errors display a useful message and preserve the previous map; no generated sample is substituted for a failed AI request.
- Roadmap documentation URLs come from Gemini and are checked for safe HTTPS format, not whether each page exists or is the best resource. YouTube links open a topic-specific tutorial search instead of inventing video IDs. Time estimates are guides, and completing a topic is self-reported. Prerequisites are recommendations and do not lock later topics. Personal saved maps require Clerk and MongoDB; the public example needs neither.
- Roadmap tests cover graph validation, resource safety, structured Gemini configuration and failure cases, model fallback, stalled-request cancellation, bounded retries, ownership, progress undo/retries, concurrent topic updates, position saving, layout and pacing. HTTP tests replace database calls and Gemini with controlled data; model tests verify Mongoose field types. Browser checks covered desktop/mobile layouts, dark mode, zoom, drag, keyboard selection and completion. A controlled browser auth/API test covered generation, saved-path reload, progress/layout restoration and failed saves. These do not replace a real Clerk sign-in and live MongoDB persistence check. After correcting the schema and adding fallback, a real Gemini request generated a Python roadmap with 15 topics and 16 connections in about 16 seconds. This live check did not write to MongoDB.
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

### 2026-11-21 - Prepared the accumulated feature update for GitHub

- **What changed:** Collected the pending learning-roadmap, Skill Proof Vault, responsive layout, Portfolio Generator and portfolio-recovery changes for the existing `nainamadan/Job-Portal` repository on `main`. Included their tests, dependency/configuration updates, documentation and the supplied error screenshot. Private environment files, server logs and generated builds remain excluded by `.gitignore`.
- **Why:** Keep the GitHub project up to date with the completed local work.
- **Main files:** The pending source and tests under `client/` and `server/`, package manifests/lockfiles, `server/.env.example`, the screenshot and this guide. No additional feature behavior changed during preparation.
- **Checks:** Fetched GitHub history and confirmed there were no newer remote commits to merge. The client production build and all 12 client tests passed; the full backend suite reports 43 passing and the same 2 existing email-wording failures. Git whitespace checks passed. Earlier browser and live-service checks are recorded in their individual task entries and were not repeated for this preparation.

### 2026-11-21 - Fixed the portfolio draft 404 shown in the screenshot

- **What changed:** Inspected the new screenshot and reproduced both portfolio endpoints returning HTML 404 responses while the jobs endpoint worked. The running backend still had the earlier routes loaded. Restarted the local backend on port 5000 using the current checkout and nodemon; portfolio endpoints now return the expected JSON 401 when called without a token, and jobs still return 200. Added clear service errors and validated draft responses. Local editing, photos and website generation no longer depend on a successful draft load. Saving stays blocked until a valid response, and reconnection asks which draft to keep when local edits and saved data both exist.
- **Why:** A missing service route was displayed as a generic error and disabled the entire form. Candidates can now continue local work safely while a saving service recovers, without silently losing or overwriting a draft.
- **Main files:** `client/src/pages/PortfolioGenerator.jsx`, `client/src/utils/portfolioApi.js`, `client/src/styles/portfolio-generator.css`, `client/tests/portfolioApi.test.mjs`, and this guide. No backend source or account data was changed for this repair; the existing backend process was restarted with current code.
- **Checks:** Live route probes confirmed 404 → 401 for both portfolio endpoints and 200 for jobs after restart. All 12 client tests, focused lint, production build and Git whitespace checks passed. Controlled browser checks reproduced the missing-route and malformed-response cases, verified local editing/generation/export controls and blocked unsafe saves, then checked both draft recovery choices, reconnection to an empty draft, and phone/desktop layouts with no uncaught exceptions. The browser check used synthetic auth/API records; authenticated live draft reads/writes and deployment were not tested. Backend regression tests were not rerun because no backend source changed.

### 2026-11-21 - Added Auto Portfolio Generator with a final photo step

- **What changed:** Added a four-step resume/GitHub portfolio builder with editable content, up to six featured projects, two themes, three accents, a live preview and an optional photo in the last step. Candidates can generate/download a complete HTML website, open a full preview, and save/reopen one private account draft. Photos are resized locally and embedded in the download. The backend checks ownership, stale saves, input sizes and image/link formats, and fetches public GitHub metadata with bounded requests. Added a navigation link and help answer.
- **Why:** Candidates can turn existing resume details and project work into a personal website without writing website code, while reviewing the details and choosing a profile image before export.
- **Main files:** `client/src/pages/PortfolioGenerator.jsx`, `client/src/components/portfolio/`, `client/src/styles/portfolio-generator.css`, `client/src/utils/portfolioGenerator.js`, `client/src/utils/portfolioPhoto.js`, `client/tests/portfolioGenerator.test.mjs`, `client/src/App.jsx`, `client/src/components/Navbar.jsx`, `client/src/components/HelpChatbot.jsx`, `server/models/Portfolio.js`, `server/routes/portfolioRoutes.js`, `server/utils/portfolio.js`, `server/tests/portfolio.test.js`, `server/server.js`, and this guide. Earlier roadmap, vault and responsive changes were preserved.
- **Checks:** Client production build, focused lint, all 9 client tests, all 3 new backend portfolio tests, backend syntax and Git whitespace checks passed. The full backend suite reports 43 passing and 2 failing tests: the existing email-configuration error-wording assertion and its parent workflow test. Controlled browser checks passed for the full import/review/photo/generate/export/save flow, error recovery, account isolation and responsive layouts. A real public GitHub import succeeded. Real Clerk sign-in, live MongoDB writes and deployment were not tested. The generated HTML is a downloadable website, not an automatically hosted page.

### 2026-11-21 - Made the job portal work on phone and tablet screens

- **What changed:** Added compact main navigation and a phone layout for recruiter navigation. Recruiter job/applicant tables become labeled cards on phones and scroll within their own region on tablets. Shared sizing rules let long content and form fields fit smaller screens. Login, resume and recruiter decision dialogs scroll within the viewport. Adjusted job cards, search, filters, pagination, footers, resume controls, application progress, and chat sizing; Help stays clear of the message composer. Search now scrolls to results only after someone submits a search.
- **Why:** So candidates and recruiters can use the same pages and actions on phones without a page-wide horizontal scrollbar, cramped sidebars or clipped dialogs.
- **Main files:** `client/src/styles/responsive.css`, `client/src/styles/skill-proof.css`, `client/src/main.jsx`, `client/src/components/Navbar.jsx`, `Hero.jsx`, `JobListing.jsx`, `JobCard.jsx`, `Footer.jsx`, `AppDownload.jsx`, `MessagesInbox.jsx`, `ChatThread.jsx`, `HelpChatbot.jsx`, `MessageRecruiterModal.jsx`, `ResumeModal.jsx`, `RecruiterLogin.jsx`, `StageUpdateModal.jsx`, `ApplicationProgress.jsx`; `client/src/pages/Dashboard.jsx`, `ManageJobs.jsx`, `ViewApplications.jsx`, `AddJob.jsx`, `Applyjob.jsx`, `JobDetails.jsx`, `ApplicationDashboard.jsx`, `SavedJobs.jsx`; and this guide. Existing roadmap and vault work was preserved.
- **Checks:** The client production build, all 6 existing client tests, focused lint and Git whitespace checks passed. A controlled headless Chrome audit checked all 14 routes at five phone/tablet/desktop widths with populated synthetic data: 84 page/dialog checks passed with no page-wide horizontal overflow or uncaught browser exceptions. A further 14 focused checks passed after fixing the proof editor's internal overflow. Interaction checks covered phone navigation, Escape, filters, login/registration, resume and hiring dialogs, chat list/back navigation, composer visibility, generated resumes, roadmap topics and proof forms. Screenshots were reviewed for phones, dark mode and short landscape dialogs. Physical devices, real login/database services and deployment were not tested; backend tests were not rerun because this task changes only the client layout. Older unrelated frontend lint issues remain.

### 2026-11-21 - Added Skill Proof Vault for candidate project evidence

- **What changed:** Added a candidate vault with five practical technical challenges, project evidence forms, source/demo/walkthrough links, contribution notes, search, status filters, editing and deletion. Recruiters open a candidate's vault from View Applications and record an approval or improvement request with feedback. Reviews are scoped to the company's own applicants and the saved proof version. Editing clears all reviews; concurrent or stale saves cannot silently replace a newer review or proof. Added navigation and help answers.
- **Why:** Candidates can show concrete work and technical decisions alongside their resumes, and recruiters can assess that evidence and give feedback.
- **Main files:** `client/src/pages/SkillProofVault.jsx`, `client/src/components/skill-proof/`, `client/src/styles/skill-proof.css`, `client/src/App.jsx`, `client/src/components/Navbar.jsx`, `client/src/components/HelpChatbot.jsx`, `client/src/pages/ViewApplications.jsx`, `server/models/SkillProof.js`, `server/controllers/skillProofController.js`, `server/routes/skillProofRoutes.js`, `server/utils/skillProof.js`, `server/tests/skillProof.test.js`, `server/server.js`, and this guide. Existing unfinished roadmap changes were preserved.
- **Checks:** Client production build, all 6 client tests, focused lint for the new vault components and changed navigation/help/routing files, backend syntax checks, Git whitespace checks, and both new backend tests passed. View Applications still reports its existing lint issues. The full backend run reported 40 passing and 2 failing tests: the existing missing-email-configuration wording assertion and its parent workflow test. Browser checks with synthetic auth/API data passed for guest access, challenge selection, dialog focus, failed-save recovery, create/reload, mobile/dark layout, recruiter approval, edit invalidation and deletion. Real Clerk sign-in, live MongoDB persistence and deployment were not tested. Approval represents a recruiter's assessment, not automatic execution or certification.

### 2026-11-19 - Fix the roadmap generation error shown in the screenshot

- **What changed:** Simplified the response schema sent to Gemini, keeping the full server-side content and connection checks. Added one automatic fallback to another Gemini model for busy/unavailable models, bad AI responses and timeouts. Both models share the existing 90-second deadline, and a stalled first request is cancelled after 30 seconds. Added clearer errors, a retry button for temporary failures, an optional fallback-model setting and a real AI verification script.
- **Why:** The screenshot showed a generic service-unavailable error. Live checks confirmed the primary model returned 503 even for a tiny request, and the original nested schema made the backup reject generation with "too many states for serving". The API key itself worked.
- **Files:** `server/utils/learningRoadmap.js`, `server/controllers/roadmapController.js`, `server/tests/learningRoadmap.test.js`, `server/scripts/verify-roadmap-ai.js`, `server/.env.example`, `client/src/pages/LearningRoadmap.jsx`, `PROJECT_GUIDE.md`.
- **Checks:** All nine roadmap backend tests pass, including schema compatibility, fallback, early cancellation, no retries for invalid configuration and identical-model deduplication. A real Python generation passed with 15 topics, 16 connections and all five topic kinds in about 16 seconds. Client production build, focused page lint, backend syntax and Git whitespace checks pass. A controlled-auth/API browser check confirmed the previous map stays visible after failure, **Try again** resubmits successfully, the error clears, and saved progress/positions still survive reload; there were no canvas warnings or browser errors. Full backend suite: 38 passed, the same 2 existing email-wording failures remain. Real Clerk sign-in and MongoDB writes were not exercised. Earlier probes intentionally observed primary-model 503, unavailable-model 404 and oversized-schema 400 responses while diagnosing the failure.

### 2026-11-19 - AI visual learning roadmaps

- **What changed:** Added a Learning Roadmap link and page with a premium, responsive React Flow diagram. Gemini generates branching skill-specific paths with prerequisite links, practice, projects, milestones, explanations, documentation, tutorial searches and time estimates. Users can complete or undo steps, see green boxes and progress, reopen private saved paths and save dragged box positions. A labeled interactive React example is available before sign-in. Added owner-scoped Express endpoints, a MongoDB roadmap model, graph/content validation, generation limits, cancellation and clear failure states. The feature uses the existing Clerk authentication and Gemini key.
- **Why:** Let job seekers learn a new skill through an explorable visual path and keep their progress between visits.
- **Files:** `client/src/pages/LearningRoadmap.jsx`, `client/src/components/roadmap/`, `client/src/utils/roadmapGraph.js`, `client/src/data/roadmapPreview.js`, `client/src/styles/learning-roadmap.css`, client App/Navbar, client dependency files and tests; server roadmap model/controller/routes/utility/tests, `server/server.js`, `server/.env.example`; this guide. Existing unrelated lockfile edits were preserved.
- **Checks:** Six client tests and all five new backend roadmap tests pass. Client production build, focused lint on changed client code, backend syntax checks and Git whitespace checks pass. Full backend suite: 34 passed, 2 failures from the previously documented email configuration wording mismatch (including its parent workflow test). Local Chrome checks passed for desktop/mobile layouts (390px mobile without horizontal overflow), topic selection, keyboard selection, zoom, dragging and green completion. A browser-only controlled auth/API check restored progress and positions after reload and preserved the previous map on generation/save failures; no browser exceptions occurred. A live Gemini request failed with upstream 503, so live AI generation remains unverified. Real Clerk sign-in, live MongoDB writes, deployment and the unrelated root demo were not tested. Full frontend lint was not rerun; existing failures are documented below.

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
