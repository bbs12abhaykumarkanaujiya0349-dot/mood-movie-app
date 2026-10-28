# Comprehensive Testing & Verification Guide

This guide details how to execute all automated test suites, run linting and build checks, and perform manual User Acceptance Testing (UAT) for the **Moodie — AI Mood-Based Movie Recommendation System**.

---

## 1. Automated Test Execution

### A. Backend Test Commands

Run the following commands inside the `backend/` directory:

| Test Suite | Command | What It Verifies |
|---|---|---|
| **Unit Tests** | `npm test` | Executes 55 unit tests across 9 suites (Local Mood Classifier, Hybrid Scorer, Reason Builder, Sentiment Analyzer, Date Bucketing, OMDb Mapper, TMDb Mapper). |
| **Security Audit** | `npm run test:security` | Tests NoSQL injection rejection (400), rate limiter headers, blocked user token rejection (403), 10kb body payload limit (413), and `/api/health`. |
| **Database Indexes** | `npm run check:indexes` | Connects to MongoDB, synchronizes schemas, and confirms required performance indexes on `users`, `movies`, `reviews`, and `moodhistories`. |
| **Step B1 Auth Integration** | `node src/test_b1.js` | 16 integration tests for user registration, duplicate email rejection, JWT login, and password hashing. |
| **Step B2 Catalog & Mood** | `node src/test_b2.js` | 19 integration tests for movie search, filtering, movie details, and mood text classification. |
| **Step B3 Core User Flows** | `node src/test_b3.js` | 35 integration tests for hybrid recommendations, watchlist, favorites, reviews & sentiment, history, and profile updates. |
| **Step B4 Admin Governance** | `node src/test_b4.js` | 33 integration tests for admin RBAC, user management, review moderation, movie catalog CRUD, and analytics aggregation. |
| **OMDb Provider Integration** | `node src/test_omdb.js` | 16 tests verifying live OMDb catalog queries, fallback to local dataset on invalid keys, and schema normalization. |
| **Complete Backend Verification** | `npm run test:all` | Runs all suites sequentially in one automated pass. |

### B. Frontend Verification Commands

Run the following commands inside the `frontend/` directory:

| Task | Command | What It Verifies |
|---|---|---|
| **Strict Linting** | `npm run lint:strict` | Enforces zero undefined variables (`no-undef`) and strict React hook execution rules (`react/rules-of-hooks`). |
| **React Import Check** | `node scripts/check-react-imports.js` | Scans all `.js`/`.jsx` files in `src/` to confirm every React hook and API is imported from `'react'`. |
| **Full Build & Import Check** | `npm run check` | Runs the missing-import scanner followed by the Vite production build. |
| **Production Build** | `npm run build` | Builds the production bundle with manual vendor chunking and route-based code splitting. |

---

## 2. Manual User Acceptance Testing (UAT) Checklist

### A. End-User Journey

| Test Case ID | Test Scenario | Steps to Execute | Expected Result | Verified |
|---|---|---|---|:---:|
| **UAT-U01** | User Registration | 1. Navigate to `/register`<br>2. Fill in Name, valid Email, and Password (min 8 chars, 1 digit)<br>3. Click "Create Account" | Account created successfully; JWT stored; redirects to user dashboard with welcome toast. | [x] |
| **UAT-U02** | User Login | 1. Navigate to `/login`<br>2. Click demo user button (`user@moodie.demo`)<br>3. Click "Sign In" | Authenticates user; navbar shows user avatar and initials; redirects to dashboard. | [x] |
| **UAT-U03** | Predefined Mood Recommendation | 1. Navigate to `/mood`<br>2. Click "Pick a Mood Tag"<br>3. Select "Happy" card<br>4. Click "Find My Movies" | Navigates to `/recommendations?mood=happy`. Shows match score, reason badge, and matched comedies/adventures. | [x] |
| **UAT-U04** | Natural Language Mood Input | 1. Navigate to `/mood`<br>2. Click "Describe How You Feel"<br>3. Type "Feeling worn out after exams, need hope"<br>4. Click "Analyze Emotional Tone" | Detects mood (e.g. "Sad" or "Relaxed"); shows confidence percentage; allows 1-click recommendation generation. | [x] |
| **UAT-U05** | Movie Details & Reviews | 1. Navigate to `/movies`<br>2. Click any movie card<br>3. Scroll to "Audience Reviews"<br>4. Select 5 stars, write review, click "Submit Review" | Review appears in list immediately with automated positive sentiment badge; movie rating updates. | [x] |
| **UAT-U06** | Watchlist & Favorites Sync | 1. On any movie card or details page, click Bookmark and Heart buttons<br>2. Navigate to `/watchlist` and `/favorites` | Selected movies appear in real-time with zero lag (optimistic UI sync). | [x] |
| **UAT-U07** | Mood History Management | 1. Navigate to `/history`<br>2. View chronological submissions<br>3. Click trash icon on single entry or "Clear History" | Entry or full history is removed; confirms with toast. | [x] |
| **UAT-U08** | Profile & Settings | 1. Navigate to `/settings`<br>2. Update preferred genres<br>3. Change password or view account details | Profile statistics update; password change verifies current credentials. | [x] |

### B. Administrator Journey

| Test Case ID | Test Scenario | Steps to Execute | Expected Result | Verified |
|---|---|---|---|:---:|
| **UAT-A01** | Admin Authentication & RBAC | 1. Log in with `admin@moodie.demo`<br>2. Open user dropdown and click "Admin Panel" | Successfully accesses `/admin` dashboard. Navbar shows amber "Administrator" badge. | [x] |
| **UAT-A02** | User Management & Block/Unblock | 1. Navigate to `/admin/users`<br>2. Locate test user and click "Block User"<br>3. In another private window, attempt to access protected API with blocked user | Blocked user immediately receives 403 Forbidden; cannot browse watchlist or submit reviews. | [x] |
| **UAT-A03** | Review Moderation | 1. Navigate to `/admin/reviews`<br>2. Locate inappropriate review<br>3. Click "Hide Review" or "Delete" | Hidden review is immediately excluded from public movie details view. | [x] |
| **UAT-A04** | Catalog Management | 1. Navigate to `/admin/movies`<br>2. Click "Add Movie"<br>3. Fill title, genres, rating, overview, and save | Movie appears in catalog search and recommendation candidate pools. | [x] |
| **UAT-A05** | Visual Analytics Telemetry | 1. Navigate to `/admin/analytics`<br>2. Switch date filter tabs (7 Days / 30 Days / 90 Days) | Charts re-fetch aggregated time-series metrics dynamically with smooth transitions. | [x] |

### C. Security & Error Handling

| Test Case ID | Test Scenario | Steps to Execute | Expected Result | Verified |
|---|---|---|---|:---:|
| **UAT-E01** | Non-Admin Access Denial | 1. Log in as standard user `user@moodie.demo`<br>2. Type `/admin` directly in address bar | Redirects away to user dashboard; protected admin APIs reject token with 403 Forbidden. | [x] |
| **UAT-E02** | NoSQL Injection Attempt | 1. Send `POST /api/auth/login` with `{"email":{"$gt":""}}` via curl or script | Rejected with 400 Validation Error; query keys sanitized by `mongoSanitize`. | [x] |
| **UAT-E03** | Payload Flooding Attack | 1. Send request body > 10kb | Express body parser rejects payload with 413 Payload Too Large. | [x] |
| **UAT-E04** | 404 Route Fallback | 1. Navigate to `/non-existent-page-url` | Cinematic 404 page rendered with "Back to Home" button. | [x] |
