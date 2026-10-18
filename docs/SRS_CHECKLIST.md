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
| **FR-11** | The system shall maintain recommendation/history information where enabled | `MOCKED` (Step F2) | [x] |
| **FR-12** | The admin shall be able to manage users and moderate reviews | `MOCKED` (Step F2) | [x] |

---

## 2. Non-Functional Requirements (NFR)

- [ ] **NFR-Performance**: Common pages load quickly and API requests are handled efficiently (`PENDING`)
- [ ] **NFR-Security**: Passwords hashed with bcrypt; protected APIs guarded by JWT and role authorization (`PENDING`)
- [ ] **NFR-Usability**: Clean, responsive, cinematic dark UI easy for beginner users (`PENDING`)
- [ ] **NFR-Reliability**: API failures handled gracefully with meaningful error responses and offline fallbacks (`PENDING`)
- [ ] **NFR-Scalability**: Modular backend architecture permitting extensible recommendation strategies (`PENDING`)
- [ ] **NFR-Maintainability**: Clean separation into frontend, backend, routes, controllers, services, and models (`PENDING`)
- [ ] **NFR-Compatibility**: Full cross-browser compatibility across modern desktop and mobile browsers (`PENDING`)

---

## 3. Database Requirements (MongoDB + Mongoose)

- [ ] **Users Collection**: `_id`, `name`, `email`, `passwordHash`, `role`, `favoriteMovies`, `watchlist`, `createdAt` (`PENDING`)
- [ ] **Movies Collection**: `_id`, `externalMovieId`, `title`, `releaseDate`, `genres`, `overview`, `posterUrl`, `rating`, `runtime`, `language` (`PENDING`)
- [ ] **Reviews Collection**: `_id`, `userId`, `movieId`, `rating`, `comment`, `sentiment`, `createdAt` (`PENDING`)
- [ ] **Mood History Collection**: `_id`, `userId`, `inputText`, `detectedMood`, `recommendationIds`, `createdAt` (`PENDING`)

---

## 4. REST API Requirements (Express.js)

- [ ] `POST /api/auth/register` — Register new user (`PENDING`)
- [ ] `POST /api/auth/login` — Authenticate user and return JWT (`PENDING`)
- [ ] `GET /api/movies/search` — Search movies with query & filters (`PENDING`)
- [ ] `GET /api/movies/:id` — Get detailed movie metadata (`PENDING`)
- [ ] `POST /api/mood/analyze` — Analyze natural language mood input (`PENDING`)
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

- [x] **Landing / Home Page**: Hero banner, quick mood selector, trending/featured movies (`MOCKED` - Step F1)
- [x] **Authentication Pages**: Clean login and registration placeholders (`MOCKED` - Step F1)
- [x] **Mood Selector Component**: Interactive mood cards with curated icons, colors, and prompt input (`MOCKED` - Step F1)
- [x] **Recommendations View**: Cinematic cards showing poster, title, rating, release year, genre tags (`MOCKED` - Step F1)
- [x] **Movie Details Page**: High-resolution backdrop/poster, overview, genre badges, runtime, cast, user reviews (`MOCKED` - Step F1)
- [x] **Search & Filter Page**: Real-time search by title, filter by genre, year, rating, language (`MOCKED` - Step F1)
- [x] **Watchlist Page**: Grid of saved movies with remove action and quick watch links (`MOCKED` - Step F1)
- [x] **Profile Page**: User details, recent mood history, favorite genres, written reviews (`MOCKED` - Step F1)
- [x] **Admin Dashboard**: Analytics cards, user management table, review moderation tools (`MOCKED` - Step F1)

---

## 6. Security Requirements

- [ ] Passwords hashed using `bcryptjs` with appropriate salt rounds (`PENDING`)
- [ ] JWT authentication with token expiry and Authorization Bearer header checks (`PENDING`)
- [ ] Role-Based Access Control (RBAC) middleware protecting Admin endpoints (`PENDING`)
- [ ] Request input validation & sanitization (`express-validator`) on all endpoints (`PENDING`)
- [ ] Rate limiting (`express-rate-limit`) to prevent brute-force attacks (`PENDING`)
- [ ] Security headers enabled via `helmet` and secure CORS policies (`PENDING`)
- [x] Zero secrets in frontend; external API keys strictly isolated in backend `.env` (`WORKING` - Frontend uses VITE_API_URL only)

---

## 7. AI & Fallback Requirements

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
- [ ] **AI Classification Engine**: NLP service for text mood analysis (`PENDING`)
- [ ] **Rule-based NLP Fallback**: Keyword/sentiment heuristic classifier if external AI API is unreachable (`PENDING`)
- [ ] **Movie API Integration**: External TMDb / OMDb API service (`PENDING`)
- [x] **Local Movie Dataset Fallback**: Bundled JSON movie catalog if TMDb API is unavailable or rate-limited (`MOCKED` - 24 mock movies with resilient gradient fallback in `frontend/src/data/movies.js`)

---

## 8. Testing Requirements

- [ ] Unit testing for recommendation algorithms and NLP fallback classifiers (`PENDING`)
- [ ] API integration tests for auth, movies, mood analysis, watchlist, and reviews (`PENDING`)
- [ ] End-to-end integration validation across Frontend, Backend, and MongoDB (`PENDING`)
- [ ] Edge-case and validation testing (bad credentials, empty mood input, network timeouts) (`PENDING`)
- [ ] Responsive UI verification across desktop, tablet, and mobile viewport sizes (`PENDING`)
- [ ] User acceptance walkthrough across all supported mood flows (`PENDING`)
