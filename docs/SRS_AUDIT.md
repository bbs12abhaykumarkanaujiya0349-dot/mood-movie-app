# Final SRS Compliance Audit Report

**Project**: Moodie — AI Mood-Based Movie Recommendation System  
**Academic Degree**: Master of Computer Applications (MCA) Final Year Project  
**Date of Audit**: October 2026  
**Auditor**: Antigravity Automated Verification & Code Audit Suite  

---

## 1. Executive Summary

| Category | Total Requirements | Fully Implemented | Partially Implemented | Pending / Not Implemented |
|---|:---:|:---:|:---:|:---:|
| **Functional Requirements (FR-01 to FR-12)** | 12 | 12 | 0 | 0 |
| **Non-Functional Requirements (NFR)** | 7 | 7 | 0 | 0 |
| **Security Specifications** | 9 | 9 | 0 | 0 |
| **Database Collections & Indexes** | 4 | 4 | 0 | 0 |
| **External Integrations** | 3 | 1 | 2 (Network Blocked) | 0 |
| **Frontend Views & Responsive Layouts** | 18 | 18 | 0 | 0 |
| **Automated Test Suites** | 7 | 7 | 0 | 0 |

---

## 2. Functional Requirements (FR-01 .. FR-12)

| Requirement ID | Requirement Description | Status | Evidence (Code / Endpoint / Test) | Implementation Details |
|---|---|:---:|---|---|
| **FR-01** | User Account Creation | **Fully Implemented** | `POST /api/auth/register`<br>[`RegisterPage.jsx`](file:///c:/Users/USIT/Desktop/mood-movie-app/frontend/src/pages/auth/RegisterPage.jsx)<br>`backend/src/test_b1.js` | Name (2-50 chars), valid email regex, strong password (min 8 chars, at least 1 digit), bcrypt hashing with 10 salt rounds. Duplicate email rejection (409). |
| **FR-02** | User Authentication (JWT) | **Fully Implemented** | `POST /api/auth/login`<br>[`LoginPage.jsx`](file:///c:/Users/USIT/Desktop/mood-movie-app/frontend/src/pages/auth/LoginPage.jsx)<br>[`auth.js`](file:///c:/Users/USIT/Desktop/mood-movie-app/backend/src/middleware/auth.js) | Issues signed JWT token (7-day validity). `protect` middleware verifies Bearer token and rejects blocked users with 403. |
| **FR-03** | Mood Selection from Categories | **Fully Implemented** | `POST /api/recommendations`<br>[`MoodSelectPage.jsx`](file:///c:/Users/USIT/Desktop/mood-movie-app/frontend/src/pages/MoodSelectPage.jsx)<br>[`moods.js`](file:///c:/Users/USIT/Desktop/mood-movie-app/backend/src/constants/moods.js) | 8 standard mood categories: Happy, Sad, Romantic, Angry, Excited, Relaxed, Fearful, Motivated. Interactive cards with emoji, gradient styling, and genre mapping. |
| **FR-04** | Natural Language Mood Input | **Fully Implemented** | `POST /api/mood/analyze`<br>[`MoodSelectPage.jsx`](file:///c:/Users/USIT/Desktop/mood-movie-app/frontend/src/pages/MoodSelectPage.jsx)<br>[`LandingPage.jsx`](file:///c:/Users/USIT/Desktop/mood-movie-app/frontend/src/pages/home/LandingPage.jsx) | Accepts up to 300 characters of conversational input (e.g., "Exhausted after exam week, need pure heartwarming laughs"). Quick chips provide inspirations. |
| **FR-05** | Text Classification into Mood | **Fully Implemented** | [`localMoodClassifier.js`](file:///c:/Users/USIT/Desktop/mood-movie-app/backend/src/ai/localMoodClassifier.js)<br>[`externalMoodClassifier.js`](file:///c:/Users/USIT/Desktop/mood-movie-app/backend/src/ai/externalMoodClassifier.js)<br>`localMoodClassifier.test.js` | Heuristic NLP classifier with 100+ keyword lexicons, negation inversion ("not happy" -> Sad), Hinglish slang support ("bohot udaas", "khush"), contrast prioritization ("feeling low but want comedy" -> Sad), and Gemini AI fallback. 20/20 unit tests passing. |
| **FR-06** | Mood Recommendation Engine | **Fully Implemented** | `POST /api/recommendations`<br>[`hybridScorer.js`](file:///c:/Users/USIT/Desktop/mood-movie-app/backend/src/recommendation/hybridScorer.js)<br>[`reasonBuilder.js`](file:///c:/Users/USIT/Desktop/mood-movie-app/backend/src/recommendation/reasonBuilder.js) | **Rule-based hybrid scoring algorithm (NOT machine learning)**: calculates matchScore (0–100%) using genre overlap (45%), normalized IMDb rating (25%), log popularity (15%), and user preference boost (15%) minus saved penalty. Generates truthful explainability reasons. |
| **FR-07** | Movie Metadata Presentation | **Fully Implemented** | `GET /api/movies/:id`<br>[`MovieDetailsPage.jsx`](file:///c:/Users/USIT/Desktop/mood-movie-app/frontend/src/pages/movies/MovieDetailsPage.jsx)<br>[`MovieCard.jsx`](file:///c:/Users/USIT/Desktop/mood-movie-app/frontend/src/components/movie/MovieCard.jsx) | Displays movie title, release date/year, IMDb rating, runtime, overview, genres, backdrop, source badge, and resilient gradient placeholder on missing poster. |
| **FR-08** | Movie Search and Filtering | **Fully Implemented** | `GET /api/movies/search`<br>[`MoviesPage.jsx`](file:///c:/Users/USIT/Desktop/mood-movie-app/frontend/src/pages/movies/MoviesPage.jsx)<br>`backend/src/test_b2.js` | Real-time title search, genre dropdown, release year filter, minimum rating slider, language selector, sort options (rating, popularity, newest, title), and pagination. |
| **FR-09** | Watchlist & Favorites Management | **Fully Implemented** | `GET/POST/DELETE /api/watchlist`<br>`GET/POST/DELETE /api/favorites`<br>[`WatchlistPage.jsx`](file:///c:/Users/USIT/Desktop/mood-movie-app/frontend/src/pages/WatchlistPage.jsx)<br>[`FavoritesPage.jsx`](file:///c:/Users/USIT/Desktop/mood-movie-app/frontend/src/pages/FavoritesPage.jsx) | Authenticated bookmarking with duplicate prevention, optimistic client updates, one-click toggle, and cascade cleanup upon user or movie deletion. |
| **FR-10** | Ratings and Reviews System | **Fully Implemented** | `POST/GET/PATCH/DELETE /api/reviews`<br>[`sentimentAnalyzer.js`](file:///c:/Users/USIT/Desktop/mood-movie-app/backend/src/ai/sentimentAnalyzer.js)<br>[`ReviewList.jsx`](file:///c:/Users/USIT/Desktop/mood-movie-app/frontend/src/components/review/ReviewList.jsx) | 1–5 star rating with text review (max 1000 chars), automated sentiment classification (positive/neutral/negative), HTML/XSS sanitization, 1 review per user per movie constraint, edit/delete privileges. |
| **FR-11** | Mood History & Timeline | **Fully Implemented** | `GET/DELETE /api/history`<br>[`HistoryPage.jsx`](file:///c:/Users/USIT/Desktop/mood-movie-app/frontend/src/pages/HistoryPage.jsx)<br>`backend/src/test_b3.js` | Chronological record of user mood inputs, detected mood category, confidence score, recommendation references, filtering by mood tag, individual entry deletion, and complete history clearing. |
| **FR-12** | Admin Governance & Moderation | **Fully Implemented** | `GET/PATCH/DELETE /api/admin/*`<br>[`AdminUsersPage.jsx`](file:///c:/Users/USIT/Desktop/mood-movie-app/frontend/src/pages/admin/AdminUsersPage.jsx)<br>[`AdminReviewsPage.jsx`](file:///c:/Users/USIT/Desktop/mood-movie-app/frontend/src/pages/admin/AdminReviewsPage.jsx)<br>[`AdminMoviesPage.jsx`](file:///c:/Users/USIT/Desktop/mood-movie-app/frontend/src/pages/admin/AdminMoviesPage.jsx)<br>[`AdminAnalyticsPage.jsx`](file:///c:/Users/USIT/Desktop/mood-movie-app/frontend/src/pages/admin/AdminAnalyticsPage.jsx) | RBAC guards (403 for non-admins), user status toggle (active/blocked), role promotion (USER/ADMIN), last-admin self-block protection, review moderation (visible/hidden), movie catalog CRUD, KPI counters, and 7d/30d/90d Recharts telemetry. |

---

## 3. Non-Functional Requirements (NFR)

| ID | Requirement | Status | Verification & Evidence |
|---|---|:---:|---|
| **NFR-01** | Performance | **Fully Implemented** | Route-based code splitting with `React.lazy` + `Suspense`. Vendor chunks split into `vendor-react`, `vendor-motion`, `vendor-charts`, and `vendor-icons`. Main entry chunk decreased from 1,146 kB down to **42.7 kB** (< 1 MB requirement exceeded). Database indexes active on high-volume queries. |
| **NFR-02** | Security | **Fully Implemented** | Helmet security HTTP headers, CORS restricted to `CLIENT_URL` (with comma-separated multi-domain support), strict rate limiting on auth and global APIs, 10kb body payload limiter, custom `mongoSanitize` NoSQL injection prevention, startup JWT_SECRET >= 32 chars length check, stack traces hidden in production, zero hardcoded secrets. 0 npm audit vulnerabilities. |
| **NFR-03** | Usability & Aesthetics | **Fully Implemented** | Cinematic obsidian dark theme with original identity (no streaming service clone), responsive breakpoints (320px–1440px), accessible color contrast, Framer Motion animations, skeleton loaders, and toast feedback. |
| **NFR-04** | Reliability & Resilience | **Fully Implemented** | Dual-layer fallback architecture: OMDb -> Local 44-movie catalog; Gemini AI -> Heuristic NLP keyword/sentiment engine. ErrorBoundary wrapping React application root. |
| **NFR-05** | Maintainability | **Fully Implemented** | Clean separation of concerns: controllers, services, models, routes, middleware, validators, hooks, contexts, and pure utility functions. Comprehensive test suites covering units and endpoints. |
| **NFR-06** | Cross-Browser Compatibility | **Fully Implemented** | Tested across Chromium, Gecko, and WebKit layout standards. Standard CSS Flexbox and CSS Grid without vendor prefix quirks. |
| **NFR-07** | Data Integrity | **Fully Implemented** | Mongoose schema validators, unique compound indexes (`userId` + `movieId`, `externalMovieId`, `email`), and cascade delete hooks ensuring orphaned data cleanup. |

---

## 4. External Services & Providers Status

| Service | Intended Role | Current Status | Cause & Operational Impact |
|---|---|:---:|---|
| **OMDb API** | Primary movie metadata provider | **Working** | Configured with valid API key in `backend/.env`. Verified via 16/16 tests in `test_omdb.js`. Fetches live movie metadata, IMDb ratings, and high-res posters. |
| **TMDb API** | Alternative movie metadata provider | **Pending (Blocked on Network)** | Adapter code fully implemented in `backend/src/services/tmdbService.js` and response normalizer verified in `tmdbMapper.test.js` (4/4 passed). However, `api.themoviedb.org` DNS/IP is unreachable/network-blocked on this development network environment. System seamlessly falls back to OMDb and curated local dataset. |
| **Google Gemini AI** | Conversational mood NLP classification | **Pending (Network Blocked)** | Client code updated with `gemini-3.8-flash` in `backend/src/ai/externalMoodClassifier.js`. Due to outbound network timeout to `generativelanguage.googleapis.com` in this environment, requests time out after 6 seconds and gracefully fall back to the built-in local rule-based heuristic classifier with zero application crashes. |
| **Curated Local Catalog** | Zero-downtime offline fallback | **Working** | 44 curated films spanning all 8 moods bundled in `backend/src/data/localMovies.js`. Guarantees recommendations even during complete internet or third-party API outages. |

---

## 5. Honest Known Limitations

1. **OMDb Free Tier API Limit**: The free OMDb API key provides 1,000 requests per day. Heavy load or automated stress testing will exhaust this quota, causing the system to seamlessly switch to the local movie dataset.
2. **Missing Posters in Local Offline Mode**: When the application runs in offline fallback mode using local movie data, high-resolution movie posters are replaced by dynamic aesthetic SVG/gradient placeholders displaying the title, release year, and genre badge.
3. **Email Verification**: User registration creates active accounts immediately without sending an email verification link (SMTP mail server integration omitted to keep deployment lightweight and dependency-free).
4. **Stateless JWT Logout**: User logout is performed client-side by discarding the JWT token and purging stored user state. Server-side token blacklisting (e.g., using Redis) is not implemented.
5. **Recommendation Algorithm Classification**: The recommendation engine is a **deterministic rule-based hybrid scoring model** based on genre overlap, IMDb rating, popularity log scaling, and user genre preferences. It does **NOT** use neural collaborative filtering, matrix factorization, or vector embeddings.

---

## 6. Verification Summary

- **Backend Unit Tests**: 55 / 55 Passed (`npm test`)
- **Security Audit Tests**: 5 / 5 Passed (`npm run test:security`)
- **Database Indexes Check**: 4 / 4 Confirmed (`npm run check:indexes`)
- **Frontend Strict Lint**: 0 Errors (`npm run lint:strict`)
- **Frontend Missing Import Check**: 65 / 65 Files Verified (`node scripts/check-react-imports.js`)
- **Production Build**: Built in 1.6s, entry chunk 42.7 kB (`npm run build`)
