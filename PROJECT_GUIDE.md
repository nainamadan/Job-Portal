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

### For job seekers

- Browse and search job listings, then open a job's details. Combine title, location, category, experience, skills, and minimum or maximum annual salary in LPA. Clear Filters resets all of these fields.
- Sign in through Clerk, which manages job seeker accounts.
- Save jobs. The website uses browser storage and also has server endpoints for signed-in users' saved jobs.
- Upload a resume and apply for jobs. The backend rejects duplicate applications and applications after a job's deadline.
- See submitted applications and their statuses.
- Compare resume text with job descriptions and see matching or missing skills.
- Use the ATS simulator for analysis, AI improvement suggestions, and improved resume generation. The resume download flow uses the browser's print window to save as PDF.

### For recruiters

- Register a company account with an image, then sign in with email and password.
- Create jobs with a title, description, location, salary, category, experience level, and application duration.
- Choose an application duration of 7, 15, 30, 45, or 60 days. The backend calculates the deadline.
- Ask the AI service to draft a job description.
- Manage job visibility, view applicants, and update application statuses.
- Trigger email notifications when a job is posted, if email delivery is configured. Changing an application to Accepted or Rejected sends a professional HTML and plain-text email to the candidate's registered address, with job, company, status, and company reply contact.
- Status notifications wait for the SMTP response. If delivery fails, the application decision stays saved and the recruiter sees a warning. Repeated or concurrent requests for the same status do not send another email.
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
| `server/utils/jobFilters.js` and `server/utils/salary.js` | Validate search filters and normalize salaries before storing and comparing them. |
| `server/utils/emailTransport.js` and `server/utils/statusEmail.js` | Configure real SMTP delivery and format accepted/rejected notifications. The existing `sendEmail.js` remains the shared email entry point. |
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
| `/dashboard` or `/dashboard/add-job` | Recruiter job creation. |
| `/dashboard/manage-jobs` | Recruiter's job listings and visibility controls. |
| `/dashboard/view-applications` | Recruiter's applicants and status controls. |

The backend groups its requests under `/api/jobs`, `/api/users`, and `/api/company`. These page addresses describe the Vite client, not the separate root demo.

## Running the project locally

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
| Client | `VITE_CLERK_PUBLISHABLE_KEY` | Job seeker sign-in. |
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

- The client offers `npm run build` and `npm run lint`, run from `client/`. The root demo offers `npm run build` from the repository root.
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
