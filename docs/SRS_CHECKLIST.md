# SRS Requirements & Implementation Checklist

**Project**: AI Mood-Based Movie Recommendation System (MCA Final Year Project)  
**Status Legend**:
- `PENDING` - Not started yet
- `MOCKED` - Temporary/mocked implementation in place for offline development & resilience
- `WORKING` - Fully implemented, connected, and verified with tests

---

## 1. Functional Requirements (FR)

| ID | Requirement Description | Status | Verification Check |
|---|---|---|:---:|
| **FR-01** | The system shall allow users to create an account | `MOCKED` (Step F2) | [x] |
| **FR-02** | The system shall authenticate registered users securely (JWT) | `MOCKED` (Step F2) | [x] |
| **FR-03** | The system shall allow a user to select a mood from supported categories | `MOCKED` (Step F2) | [x] |
| **FR-04** | The system shall accept optional natural-language mood input | `MOCKED` (Step F2) | [x] |
| **FR-05** | The system shall classify text into a supported mood category | `MOCKED` (Step F2) | [x] |
| **FR-06** | The system shall generate movie recommendations based on mood and metadata | `MOCKED` (Step F2) | [x] |
| **FR-07** | The system shall display movie title, release date, rating, and short overview | `MOCKED` (Step F2) | [x] |
| **FR-08** | The system shall allow movie search with filtering | `MOCKED` (Step F2) | [x] |
| **FR-09** | The system shall allow users to add or remove movies from a watchlist | `MOCKED` (Step F2) | [x] |
| **FR-10** | The system shall allow users to submit ratings and reviews | `MOCKED` (Step F2) | [x] |
| **FR-11** | The system shall maintain recommendation/history information where enabled | `MOCKED` (Step F3) | [x] |
| **FR-12** | The admin shall be able to manage users and moderate reviews | `MOCKED` (Step F3) | [x] |

---

## 2. Non-Functional Requirements (NFR)

- [x] **NFR-Performance**: Fast responsive pages; sub-second loading states with simulated delays (`MOCKED` - Step F2/F3)
- [x] **NFR-Security**: Passwords hashed with bcrypt; protected APIs guarded by JWT and role authorization (`WORKING` - Step B1)
- [x] **NFR-Usability**: Clean, responsive, cinematic dark UI easy for beginner users (`WORKING` - Step F1/F2/F3)
- [x] **NFR-Reliability**: Resilient architecture with ErrorBoundary, offline mock fallback datasets (`WORKING` - Step F3)
- [ ] **NFR-Scalability**: Modular backend architecture permitting extensible recommendation strategies (`PENDING`)
- [x] **NFR-Maintainability**: Clean separation into components, context, hooks, services, data, and layouts (`WORKING` - Step F1/F2/F3)
- [x] **NFR-Compatibility**: Full cross-browser compatibility across modern desktop and mobile browsers (`WORKING` - Step F3)

---

## 3. Database Requirements (MongoDB + Mongoose)

- [x] **Users Collection**: `_id`, `name`, `email`, `passwordHash`, `role`, `favoriteMovies`, `watchlist`, `createdAt` (`WORKING` - Step B1)
- [x] **Movies Collection**: `_id`, `externalMovieId`, `title`, `releaseDate`, `genres`, `overview`, `posterUrl`, `rating`, `runtime`, `language` (`WORKING` - Step B1)
- [x] **Reviews Collection**: `_id`, `userId`, `movieId`, `rating`, `comment`, `sentiment`, `createdAt` (`WORKING` - Step B1)
- [x] **Mood History Collection**: `_id`, `userId`, `inputText`, `detectedMood`, `recommendationIds`, `createdAt` (`WORKING` - Step B1)

---

## 4. REST API Requirements (Express.js)

- [x] `POST /api/auth/register` — Register new user (`WORKING` - Step B1)
- [x] `POST /api/auth/login` — Authenticate user and return JWT (`WORKING` - Step B1)
- [x] `GET /api/movies/search` — Search movies with query & filters (`WORKING` - Step B2)
- [x] `GET /api/movies/:id` — Get detailed movie metadata (`WORKING` - Step B2)
- [x] `POST /api/mood/analyze` — Analyze natural language mood input (`WORKING` - Step B2)
- [ ] `POST /api/recommendations` — Generate recommendations for mood (`PENDING`)
- [ ] `GET /api/watchlist` — Retrieve authenticated user's watchlist (`PENDING`)
- [ ] `POST /api/watchlist` — Add movie to watchlist (`PENDING`)
- [ ] `DELETE /api/watchlist/:id` — Remove movie from watchlist (`PENDING`)
- [ ] `POST /api/reviews` — Submit user movie review (`PENDING`)
- [ ] `GET /api/reviews/:movieId` — Get reviews for specific movie (`PENDING`)
- [ ] `GET /api/admin/users` — Admin user management (`PENDING`)
- [ ] `DELETE /api/admin/reviews/:id` — Admin review moderation (`PENDING`)
- [ ] `GET /api/admin/stats` — Admin dashboard analytics (`PENDING`)

---

## 5. User Interface Requirements (React + Tailwind CSS)

- [x] **Landing / Home Page**: Hero banner, quick mood selector, trending/featured movies (`MOCKED` - Step F1/F2)
- [x] **Authentication Pages**: Clean login and registration placeholders (`MOCKED` - Step F1/F2)
- [x] **Mood Selector Component**: Interactive mood cards with curated icons, colors, and prompt input (`MOCKED` - Step F1/F2)
- [x] **Recommendations View**: Cinematic cards showing poster, title, rating, release year, genre tags (`MOCKED` - Step F1/F2)
- [x] **Movie Details Page**: High-resolution backdrop/poster, overview, genre badges, runtime, cast, user reviews (`MOCKED` - Step F1/F2)
- [x] **Search & Filter Page**: Real-time search by title, filter by genre, year, rating, language (`MOCKED` - Step F1/F2)
- [x] **Watchlist Page**: Grid of saved movies with remove action and quick watch links (`MOCKED` - Step F1/F2)
- [x] **Favorites Page**: Curated favorite titles with heart toggle and quick remove (`MOCKED` - Step F2)
- [x] **Profile Page**: User details, recent mood history, favorite genres, written reviews (`MOCKED` - Step F3)
- [x] **History Page**: Chronological timeline of mood submissions, confidence scores, and quick recommend (`MOCKED` - Step F3)
- [x] **Settings Page**: Account management, password change with validation, genre preference chips, Danger Zone (`MOCKED` - Step F3)
- [x] **About Page**: Honest rule-based AI explanation, SRS matrix, tech stack cards, future scope (`WORKING` - Step F3)
- [x] **Admin Dashboard**: Analytics cards, user management table, review moderation tools (`MOCKED` - Step F3)
- [x] **Admin Users Management**: User search, role/status filters, block/unblock, delete with ConfirmDialog (`MOCKED` - Step F3)
- [x] **Admin Review Moderation**: Sentiment filter, status toggle (hide/unhide), delete with ConfirmDialog (`MOCKED` - Step F3)
- [x] **Admin Movie Catalog**: Movie table, search, pagination, Add Movie modal, Edit Movie modal, delete (`MOCKED` - Step F3)
- [x] **Admin Analytics & Telemetry**: Recharts visualizations across 7d, 30d, 90d date ranges (`MOCKED` - Step F3)

---

## 6. Frontend Complete Route Summary

The frontend architecture is now complete with all required views, responsive layouts, design tokens, mock services, error boundary isolation, and confirmation dialogs.

| Route Path | View / Feature | Access Type | Status | Mocked Data Source |
|---|---|---|:---:|:---:|
| `/` | Landing / Hero / Quick Mood | Public | `MOCKED` | `movies.js`, `moods.js` |
| `/about` | Project Architecture & SRS Matrix | Public | `WORKING` | Static SRS Documentation |
| `/movies` | Catalog Search & Filter | Public | `MOCKED` | `movies.js` |
| `/movie/:id` | Movie Details & Community Reviews | Public | `MOCKED` | `movies.js`, `reviews.js` |
| `/login` | User & Admin Sign In | Public | `MOCKED` | `authService.js` |
| `/register` | New Account Registration | Public | `MOCKED` | `authService.js` |
| `/home` | User Dashboard | Protected (User) | `MOCKED` | `movies.js`, `moodHistory.js` |
| `/mood` | Mood Selection & Keyword Analyzer | Protected (User) | `MOCKED` | `moodService.js`, `moods.js` |
| `/recommendations` | Mood Recommendations Engine | Protected (User) | `MOCKED` | `movieService.js` |
| `/watchlist` | Watchlist Management | Protected (User) | `MOCKED` | `LibraryContext` (localStorage) |
| `/favorites` | Favorites Management | Protected (User) | `MOCKED` | `LibraryContext` (localStorage) |
| `/history` | Mood History Timeline | Protected (User) | `MOCKED` | `moodHistory.js`, `userService.js` |
| `/profile` | Profile & Account Stats | Protected (User) | `MOCKED` | `userService.js`, `LibraryContext` |
| `/settings` | Account, Password & Preferences | Protected (User) | `MOCKED` | `userService.js` |
| `/admin` | Admin Governance Dashboard | Protected (Admin) | `MOCKED` | `adminService.js`, `analytics.js` |
| `/admin/users` | User Account Governance | Protected (Admin) | `MOCKED` | `adminService.js`, `users.js` |
| `/admin/reviews` | Review Moderation & Sentiment | Protected (Admin) | `MOCKED` | `adminService.js`, `reviews.js` |
| `/admin/movies` | Catalog Management & Modals | Protected (Admin) | `MOCKED` | `adminService.js`, `movies.js` |
| `/admin/analytics` | Recharts Visual Analytics (7d/30d/90d)| Protected (Admin) | `MOCKED` | `adminService.js`, `analytics.js` |
| `*` | Custom 404 Not Found Page | Public | `WORKING` | Resilient Fallback |

---

## 7. Security Requirements

- [x] Passwords hashed using `bcryptjs` with appropriate salt rounds (`WORKING` - Step B1)
- [x] JWT authentication with token expiry and Authorization Bearer header checks (`WORKING` - Step B1)
- [x] Role-Based Access Control (RBAC) middleware guarding admin routes and views (`WORKING` - Backend `protect`/`authorize` & Frontend `AdminRoute.jsx` Step B1)
- [x] Request input validation & sanitization (`express-validator`) on all endpoints (`WORKING` - Auth endpoints Step B1)
- [x] Rate limiting (`express-rate-limit`) to prevent brute-force attacks (`WORKING` - Global & Auth Step B1)
- [x] Security headers enabled via `helmet` and secure CORS policies (`WORKING` - Step B1)
- [x] Zero secrets in frontend; external API keys strictly isolated in backend `.env` (`WORKING` - Frontend uses VITE_API_URL only)

---

## 8. AI & Fallback Requirements

- [x] **Mood Categories Mapped**:
  - `Happy`: Comedy, Family, Adventure, Feel-Good
  - `Sad`: Drama, Inspirational, Feel-Good
  - `Romantic`: Romance, Drama, Romantic Comedy
  - `Angry`: Action, Thriller, Adventure
  - `Excited`: Action, Adventure, Sci-Fi
  - `Relaxed`: Comedy, Family, Animation, Light Drama
  - `Fearful`: Horror, Mystery, Thriller
  - `Motivated`: Biography, Sports, Inspirational, Drama
  (`MOCKED` - Mapped in `frontend/src/constants/moods.js`)
- [ ] **AI Classification Engine**: NLP service for text mood analysis (`PENDING` - Gemini client implemented, awaits AI_API_KEY)
- [x] **Rule-based NLP Fallback**: Keyword/sentiment heuristic classifier with Hinglish, Negation & Contrast (`WORKING` - Step B2 backend `localMoodClassifier.js`)
- [x] **Movie API Integration**: External TMDb / OMDb API service (`WORKING` - OMDb service verified with active key and source "omdb"; TMDb service implemented, awaits MOVIE_API_KEY)
- [x] **Local Movie Dataset Fallback**: Bundled JSON movie catalog of 44 movies across 8 moods (`WORKING` - Step B2 backend `localMovies.js`)

---

## 9. Testing Requirements

- [x] Unit testing for recommendation algorithms and NLP fallback classifiers (`WORKING` - 32 unit tests passing, including OMDb mapper, N/A handling, and recommendation candidate ranking)
- [x] API integration tests for auth, movies, mood analysis, watchlist, and reviews (`WORKING` - Step B1 16/16, Step B2 19/19, and OMDb 16/16 tests passing)
- [ ] End-to-end integration validation across Frontend, Backend, and MongoDB (`PENDING`)
- [x] Edge-case and validation testing (bad credentials, empty mood input, network timeouts) (`WORKING` - Step B1/B2)
- [x] Responsive UI verification across desktop, tablet, and mobile viewport sizes (`WORKING` - Breakpoints 320px–1440px tested)
- [x] User acceptance walkthrough across all supported mood flows (`WORKING` - Step F1, F2, F3)
