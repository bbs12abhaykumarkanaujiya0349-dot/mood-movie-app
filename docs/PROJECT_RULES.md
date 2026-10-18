# Project Architecture & Engineering Rules

These rules govern the development of the **AI Mood-Based Movie Recommendation System** (MCA Final Year Project). All steps and code contributions must adhere strictly to these principles.

---

## 1. Design & Visual Identity

- **Cinematic Dark Theme**: Use a bespoke, original dark palette (rich obsidian, deep charcoal, midnight navy, warm amber/purple/cyan accents).
- **Originality**: Absolutely **NO copying** of Netflix, Prime Video, Disney+, or any other commercial streaming brand. Design an authentic, modern AI-centric identity.
- **Micro-Interactions**: Use fluid animations (Framer Motion) for mood selection, recommendation transitions, modal dialogs, and skeleton loaders.
- **Responsive Layout**: Designed mobile-first, looking impeccable on mobile screens (375px+), tablets, and ultrawide desktop monitors.

---

## 2. Technology Stack Standards

### Frontend
- **Framework & Build**: React 18+ with Vite
- **Styling**: Tailwind CSS with custom theme extensions
- **Routing**: React Router (v6+)
- **HTTP Client**: Axios with centralized request/response interceptors for JWT injection and unified error handling
- **Icons**: Lucide React
- **Animations**: Framer Motion

### Backend
- **Runtime**: Node.js
- **Web Framework**: Express.js (REST API architecture)
- **Database & ODM**: MongoDB with Mongoose
- **Security & Middleware**:
  - `bcryptjs` (password hashing)
  - `jsonwebtoken` (JWT stateless authentication)
  - `helmet` (security HTTP headers)
  - `cors` (Cross-Origin Resource Sharing control)
  - `express-rate-limit` (brute force & DDoS protection)
  - `express-validator` (rigorous input validation & sanitization)
  - `dotenv` (environment configuration management)

---

## 3. Security & Credentials Policy

- **Zero Secrets on Client**: Never put API keys, JWT secrets, database connection strings, or service tokens in frontend files or frontend `.env`.
- **Environment Isolation**: All credentials reside strictly in the backend `.env` file, which is committed to `.gitignore`.
- **RBAC**: Protected routes strictly enforce roles (`User` vs `Admin`). Admin endpoints reject non-admin tokens with 403 Forbidden.

---

## 4. Fallback Architecture & Resilience (Zero Breakage)

The application must be completely resilient to external network or service limits:
1. **Movie Catalog Fallback**:
   - Primary: TMDb API (or OMDb).
   - Fallback: Pre-packaged curated local movie dataset (`localMovies.json` with 50+ movies spanning all supported mood genres).
   - If TMDb is down, missing an API key, or rate-limited, the system seamlessly serves recommendations from the local dataset without throwing runtime errors.
2. **Mood AI Classification Fallback**:
   - Primary: AI/NLP API (e.g. Gemini / Groq / OpenAI).
   - Fallback: Rule-based sentiment/keyword classifier with synonym lexicons matching the 8 supported mood categories (`Happy`, `Sad`, `Romantic`, `Angry`, `Excited`, `Relaxed`, `Fearful`, `Motivated`).
   - If AI key is unset or external API returns an error, the rule-based classifier handles the request transparently.

---

## 5. Workflow, Quality & Verification Discipline

- **Status Tracking**: Every feature in [`docs/SRS_CHECKLIST.md`](SRS_CHECKLIST.md) must be kept updated as `WORKING`, `MOCKED`, or `PENDING`.
- **Incremental Steps**: Work strictly one step at a time. Never jump ahead to future tasks.
- **Run & Verify**: After each step, run code, execute tests/checks, resolve all lint and runtime errors, verify output.
- **Reporting**: Conclude each step with a concise report:
  1. What was created/changed
  2. Test/verification status
  3. Action required by user (if any)
  4. Explicitly STOP and await the user's next prompt.

---

## 6. Version Control & Continuous Git Push

- **Remote Repository**: `https://github.com/bbs12abhaykumarkanaujiya0349-dot/mood-movie-app.git`
- **Discipline**: Every step must stage all files (`git add .`), create a descriptive conventional commit (`git commit -m "..."`), and push to `origin main`.
- All code changes will be continuously pushed to GitHub.
