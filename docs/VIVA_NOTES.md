# MCA Final Year Viva Examination Preparation & Project Defense Guide

**Project**: Moodie — AI Mood-Based Movie Recommendation System  
**Audience**: MCA Student / Viva Candidate  
**Language**: Professional English with Hinglish Conceptual Clarifications  

---

## 1. Project Explanation in Simple Words (Elevator Pitch)

### English
> *"Moodie is an emotionally intelligent web-based movie recommendation platform. While conventional platforms like Netflix or Prime Video rely solely on historical watch behavior or generic trending lists, Moodie addresses viewer **decision fatigue** by aligning recommendations directly with the user's **current emotional state**. A user can pick from 8 primary mood tags or write a natural language sentence (e.g., 'Exhausted after exam week, need pure heartwarming laughs'). The system evaluates sentiment and maps it to genre clusters, applying a transparent, deterministic multi-factor scoring formula to rank and explain movies. It is built on a resilient MERN stack with live OMDb metadata and offline fallbacks."*

### Hinglish (Exam Room Explanation)
> *"Yeh project ek mood-based movie recommendation system hai. Normal platforms par jab hum jaate hain, humein samajh nahi aata kya dekhein—ise decision fatigue kehte hain. Moodie mein user apna mood select karta hai ya natural sentence type karta hai (jaise 'aaj bohot thak gaya hu, kuch light aur comedy dekhna hai'). Hamara NLP engine emotion classify karta hai, aur recommendation algorithm genre match, IMDb rating, aur popularity ka weighted score calculate karke best movies recommend karta hai aur bataata bhi hai ki yeh movie kyu recommend hui. Agar internet ya third-party API down bhi ho, toh system local offline dataset par flawlessly chalta hai."*

---

## 2. System Architecture Explained

Moodie follows a decoupled **MERN (MongoDB, Express, React, Node.js)** architecture:

```
[ Client Browser ]
      │ (React 19 + Tailwind CSS + Framer Motion)
      │ Axios HTTP Client with JWT Interceptors
      ▼
[ Express.js REST API Gateway ]
      │ ├── Middleware: Helmet (headers), CORS (origin validation)
      │ ├── Rate Limiters: Auth (20 req/15min) & Global (100 req/15min)
      │ ├── Security: mongoSanitize (NoSQL injection filter), 10kb body parser
      │ └── Routing: Auth, Movies, Mood, Recommendations, Reviews, Admin
      ▼
[ Business Logic & Services ]
      ├── Mood NLP Engine (Local Heuristic + Gemini LLM fallback)
      ├── Hybrid Recommendation Engine (Pure math scoring + Reason builder)
      ├── Movie Metadata Service (OMDb live API + Local 44-movie fallback)
      └── Sentiment Analyzer (AFINN-based scoring for reviews)
      ▼
[ Persistence Layer ]
      └── MongoDB Atlas (Mongoose ODM with unique compound indexes)
```

---

## 3. Authentication & Authorization Flow

1. **Password Security**: Passwords are never stored in plaintext. When a user registers (`POST /api/auth/register`), `bcryptjs` generates a cryptographic salt (10 rounds) and hashes the password before saving `passwordHash` to MongoDB.
2. **Stateless JWT Issuance**: Upon successful login (`POST /api/auth/login`), the server issues a digitally signed JSON Web Token (JWT) using `process.env.JWT_SECRET` (validated at startup to be >= 32 characters) with a 7-day expiration (`exp`).
3. **Protected Route Access**:
   - The React client intercepts outgoing Axios requests and attaches `Authorization: Bearer <token>`.
   - The backend `protect` middleware extracts the token, verifies the signature with `jwt.verify()`, fetches the user from MongoDB, and explicitly verifies `user.status !== 'blocked'` (if blocked, immediately returns `403 Forbidden`).
4. **Role-Based Access Control (RBAC)**:
   - Endpoints requiring administrator privileges are guarded by `authorize('ADMIN')`.
   - If a standard user token accesses `/api/admin/*`, the server rejects the request with `403 Forbidden`.

---

## 4. Recommendation Scoring Formula with Worked Example

### The Mathematical Formula
Moodie uses a **deterministic rule-based multi-factor hybrid scoring formula** (SRS Section 6 compliant):

$$\text{MatchScore} = (w_1 \times S_{\text{genre}}) + (w_2 \times S_{\text{rating}}) + (w_3 \times S_{\text{popularity}}) + (w_4 \times S_{\text{preference}}) - P_{\text{watchlist}}$$

### Factor Weights ($W$):
1. **Genre Overlap ($w_1 = 0.45$)**: Jaccard similarity between movie genres and mood-mapped genres.
2. **Normalized Rating ($w_2 = 0.25$)**: Normalized IMDb rating on a 0.0 to 1.0 scale: $\text{Rating} / 10.0$ (defaults to $0.65$ if unrated).
3. **Log-Scaled Popularity ($w_3 = 0.15$)**: Sublinear logarithm scaling preventing blockbuster bias: $\min(1.0, \log_{10}(\text{Votes} + 1) / 7.0)$.
4. **User Preference Boost ($w_4 = 0.15$)**: Alignment with user's saved favorite genres ($1.0$ if preferred genres match, else $0.0$).
5. **Watchlist Discovery Penalty ($P_{\text{watchlist}} = 0.05$)**: Deducts $0.05$ if the user already saved the movie, prioritizing fresh discovery.

$$\text{Final Percentage} = \text{round}(\max(0.10, \min(0.99, \text{MatchScore})) \times 100)$$

---

### Worked Numerical Example for the Examiner

**Scenario**: User is feeling **"Happy"**. Mapped genres for Happy are `['Comedy', 'Family', 'Adventure']`.  
The user has listed `Comedy` in their favorite genres profile.

**Candidate Film**: *The Grand Budapest Hotel*
- Genres: `['Comedy', 'Adventure', 'Drama']`
- IMDb Rating: `8.1` / 10
- IMDb Vote Count: `850,000`
- Saved in user watchlist: `No`

**Calculation Steps**:
1. **Genre Overlap ($S_{\text{genre}}$)**:
   - Shared genres with Happy: `['Comedy', 'Adventure']` (2 matches out of 3 mood genres).
   - $S_{\text{genre}} = 2 / 3 \approx 0.667$.
   - Weighted score: $0.45 \times 0.667 = \mathbf{0.300}$
2. **Normalized Rating ($S_{\text{rating}}$)**:
   - $8.1 / 10.0 = 0.810$.
   - Weighted score: $0.25 \times 0.810 = \mathbf{0.2025}$
3. **Log Popularity ($S_{\text{popularity}}$)**:
   - $\log_{10}(850,000 + 1) / 7.0 = 5.929 / 7.0 = 0.847$.
   - Weighted score: $0.15 \times 0.847 = \mathbf{0.127}$
4. **User Preference Boost ($S_{\text{preference}}$)**:
   - `Comedy` matches user's preferred genres -> $S_{\text{preference}} = 1.0$.
   - Weighted score: $0.15 \times 1.0 = \mathbf{0.150}$
5. **Watchlist Penalty ($P_{\text{watchlist}}$)**:
   - Not saved in watchlist -> $0.00$.

**Total Match Score**:
$$\text{Score} = 0.300 + 0.2025 + 0.127 + 0.150 - 0.00 = 0.7795$$
$$\text{Match Percentage} = \text{round}(0.7795 \times 100) = \mathbf{78\%}$$

**Explainable Reason Generated**:
> *"Matches Happy through Comedy and Adventure, backed by a strong 8.1 IMDb rating and aligns with your favorite Comedy preference."*

---

## 5. Mood Classification: Rule-Based vs Gemini AI

Moodie implements a **dual-tier NLP classification pipeline**:

```
User Input Text
      │
      ▼
[ External AI Engine: Google Gemini API (gemini-3.8-flash) ]
      │
      ├─► Success: Returns { mood: "Sad", confidence: 0.92, method: "ai" }
      │
      └─► Timeout (6s) / Network Outage / Quota Exceeded / Missing Key
            │
            ▼ (Automatic Transparent Fallback)
[ Local Heuristic NLP Classifier (localMoodClassifier.js) ]
      ├── Tokenizer & Stemming
      ├── Negation Inverter ("not happy", "never felt worse")
      ├── Contrast Prioritizer ("feeling depressed but want comedy" -> Sad)
      ├── Hinglish Lexicons ("bohot khush", "udaas hu", "pyaar")
      └── Returns { mood: "Sad", confidence: 0.88, method: "rule-based" }
```

---

## 6. Database Schema & Indexing Strategy

1. **Users Collection**:
   - Fields: `name`, `email` (unique index), `passwordHash`, `role` (`USER` | `ADMIN`), `status` (`active` | `blocked`), `favoriteMovies` (ref: Movie), `watchlist` (ref: Movie), `preferences`.
2. **Movies Collection**:
   - Fields: `externalMovieId` (unique sparse index), `title`, `releaseDate`, `genres`, `overview`, `posterUrl`, `rating`, `runtime`, `popularity`, `source` (`omdb` | `tmdb` | `local`).
   - Text Index: Compound text index on `title` and `overview` for fast catalog search.
3. **Reviews Collection**:
   - Fields: `userId` (ref: User), `movieId` (ref: Movie), `rating`, `comment`, `sentiment` (`positive` | `neutral` | `negative`), `status` (`visible` | `hidden`).
   - Unique Compound Index: `{ userId: 1, movieId: 1 }` (strictly enforces maximum 1 review per user per movie).
4. **Mood History Collection**:
   - Fields: `userId`, `inputText`, `detectedMood`, `confidence`, `recommendationIds`, `createdAt`.
   - Index: `{ userId: 1, createdAt: -1 }` (enables instant timeline retrieval).

---

## 7. Why OMDb + Local Fallback?

- **Real-World Resilience**: Third-party APIs frequently experience DNS blocks (e.g. TMDb in certain academic/corporate networks), rate limits, or transient outages.
- **OMDb API**: Provides real IMDb rating scores and poster assets.
- **Local JSON Fallback (`localMovies.js`)**: 44 curated films pre-packaged across all 8 moods. If OMDb fails, the system switches to local data transparently without crashing.

---

## 8. Security Hardening Measures Implemented

1. **NoSQL Injection Sanitization**: Custom `mongoSanitize` middleware recursively scans `req.body`, `req.query`, and `req.params`, removing keys containing `$` or `.`. An injection attempt like `{"email": {"$gt": ""}}` is blocked with a 400 Validation Error.
2. **Rate Limiting**: `express-rate-limit` enforces 20 attempts/15 min on `/api/auth` and 100 requests/15 min globally.
3. **Body Size Limits**: Request payloads are capped at `10kb` to thwart Denial-of-Service buffer flooding (returns 413).
4. **JWT Startup Verification**: Server refuses to boot if `JWT_SECRET` is shorter than 32 characters.
5. **CORS Isolation**: Restricts origins strictly to configured `CLIENT_URL` (supports single domain or comma-separated list).
6. **Error Sanitization**: Production error handler hides database internals and stack traces from clients.
7. **Zero Secrets in Frontend**: Zero API keys or DB connection strings reside on the client; all calls proxy through the Express backend.

---

## 9. Honest Answers to Core Viva Questions

### Q: "What is the AI in this project?"
> *"Sir/Ma'am, the AI in this project consists of two distinct components:*
> 1. *A **Natural Language Processing (NLP) mood classification subsystem**: It integrates Google Gemini LLM via REST API and a built-in heuristic sentiment classifier supporting negation and Hinglish idioms.*
> 2. *An **automated review sentiment analyzer**: It computes sentiment polarity on audience reviews.*
> *The recommendation algorithm itself is a **deterministic rule-based multi-factor scoring model**, NOT a black-box deep learning or neural collaborative filtering model. We chose this deliberately because rule-based scoring provides **100% explainability**, zero cold-start latency, and prevents hallucinated recommendations."*

### Q: "What are the limitations of this project?"
> *"1. **API Rate Quotas**: Free-tier OMDb keys allow 1,000 calls per day. Under heavy load, the system falls back to the curated local catalog.*  
> *2. **Stateless JWT Logout**: Logout is handled client-side by purging the token; there is no distributed Redis token revocation list.*  
> *3. **No Email Verification**: Accounts activate upon registration without an email confirmation link.*  
> *4. **Local Mode Posters**: Offline local films use dynamic SVG/gradient cards rather than CDN-cached image posters."*

---

## 10. 30 Likely Viva Questions with Short, Confident Answers

#### Architecture & Stack
1. **Q: Why did you choose Vite over Create React App (CRA)?**  
   *A: Vite utilizes native ES modules and Rolldown/esbuild, providing sub-second HMR and 10x faster production builds compared to CRA's legacy Webpack.*
2. **Q: What is route-based code splitting?**  
   *A: Using `React.lazy()` and `Suspense`, each page bundle is downloaded only when the user navigates to it, reducing our initial entry bundle from 1.14 MB down to 42.7 kB.*
3. **Q: Why MongoDB instead of a relational database like MySQL?**  
   *A: Movie metadata has variable attributes (e.g. arrays of genres, variable cast/crew, nested preference objects) which naturally align with MongoDB's flexible BSON document model.*
4. **Q: What is Mongoose and why use it?**  
   *A: Mongoose is an Object Data Modeling (ODM) library that provides schema validation, middleware hooks, and type casting over raw MongoDB driver calls.*
5. **Q: What is the purpose of Express 5?**  
   *A: Express 5 features native Promise support in routing handlers, eliminating unhandled promise rejection crashes.*

#### Security & Authentication
6. **Q: How does bcrypt prevent rainbow table attacks?**  
   *A: It adds a random cryptographic salt (we use 10 rounds) to the plaintext password before running the blowfish-based key derivation function.*
7. **Q: What information is stored inside the JWT token?**  
   *A: Only non-sensitive identity claims: `id` (MongoDB User ObjectId) and `role` (`USER` or `ADMIN`). Never passwords.*
8. **Q: How does your system prevent NoSQL injection?**  
   *A: Through our `mongoSanitize` middleware which strips any keys starting with `$` or containing dots from request bodies and queries, combined with `express-validator` schema validation.*
9. **Q: How are brute-force attacks mitigated?**  
   *A: Via `express-rate-limit`, which limits authentication requests to 20 attempts per 15-minute window per IP.*
10. **Q: What does Helmet middleware do?**  
    *A: It automatically sets 14 HTTP headers (e.g., `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`) to prevent clickjacking and MIME-type sniffing.*

#### Algorithms & Recommendation
11. **Q: Why is your recommendation algorithm rule-based instead of collaborative filtering?**  
    *A: New users and small platforms suffer from the 'cold-start problem' where collaborative filtering fails due to lack of historical matrix data. Rule-based scoring works instantaneously and provides clear explainability.*
12. **Q: Why do you apply logarithm scaling to popularity?**  
    *A: Popularity ranges from 10 votes to 2,000,000+ votes. Without logarithm scaling ($\log_{10}$), blockbusters would dominate the score regardless of mood relevance.*
13. **Q: How do you handle negation in mood text?**  
    *A: If a negation term ('not', "don't", 'never') precedes a positive keyword (e.g., 'not happy'), our rule-based classifier inverts the sentiment and maps it to 'Sad'.*
14. **Q: How does the system handle Hinglish input?**  
    *A: Our local lexicon dictionary includes common Romanized Hindi emotion terms like 'udaas', 'khush', 'pyaar', 'gussa', and 'dar'.*
15. **Q: What happens if a user enters gibberish like 'asdfghjk'?**  
    *A: The NLP classifier detects zero keyword matches, marks the response with `uncertain: true`, and returns a safe neutral default ('Relaxed') without throwing runtime exceptions.*

#### Database & Optimization
16. **Q: What database indexes exist in your application?**  
    *A: Unique index on `users.email`, unique sparse index on `movies.externalMovieId`, unique compound index on `reviews.{userId, movieId}`, and compound index on `moodhistories.{userId, createdAt}`.*
17. **Q: What is a sparse index in MongoDB?**  
    *A: An index that only contains entries for documents that have the indexed field. We use it for `externalMovieId` so local movies without an external ID don't violate unique constraints.*
18. **Q: How do you prevent a user from submitting multiple reviews for the same movie?**  
    *A: Through a MongoDB unique compound index `{ userId: 1, movieId: 1 }` which causes duplicate review inserts to fail with error code 11000.*
19. **Q: What happens to reviews when a movie is deleted by an admin?**  
    *A: A cascade cleanup hook triggers in the controller, deleting all associated reviews and removing the movie ID from all users' watchlists and favorites.*
20. **Q: What is database seeding?**  
    *A: Running a script (`npm run seed`) that populates the database with essential initial data like demo accounts and curated movie catalogs.*

#### Frontend & State Management
21. **Q: Why use React Context instead of Redux?**  
    *A: Moodie has targeted global state (Authentication and Library watchlists). React Context provides clean, lightweight state management without the boilerplate of Redux actions and reducers.*
22. **Q: What is optimistic UI update?**  
    *A: When a user clicks 'Add to Watchlist', the UI updates immediately before the backend API responds. If the API fails, the state rolls back with an error toast.*
23. **Q: What is an Error Boundary in React?**  
    *A: A class component that catches JavaScript errors anywhere in its child component tree, logs the error, and displays a fallback UI instead of crashing the entire page.*
24. **Q: How does the frontend handle responsive design?**  
    *A: Using mobile-first Tailwind CSS breakpoint utilities (`sm:`, `md:`, `lg:`, `xl:`) covering screen widths from 320px mobile to 1440px desktop.*
25. **Q: Why use Lucide React for icons?**  
    *A: Lucide is modern, tree-shakeable, lightweight, and renders clean SVG elements that scale crisply across all display densities.*

#### External APIs & Production
26. **Q: Why does the system support both OMDb and local movies?**  
    *A: It implements the Graceful Degradation pattern: if the external provider is rate-limited or unavailable, the application remains fully functional using local JSON data.*
27. **Q: What is the purpose of the `/api/health` endpoint?**  
    *A: It allows automated uptime monitors (Render, UptimeRobot) to check both server responsiveness and live MongoDB connection state.*
28. **Q: How does Vercel handle client-side React routing?**  
    *A: Through `vercel.json` rewrite rules that redirect all incoming URL paths `/(.*)` to `/index.html`, allowing React Router to handle page navigation.*
29. **Q: What is a free-tier cold start on Render?**  
    *A: Render spins down idle free instances after 15 minutes. The first incoming request takes 30–50 seconds while the container re-provisions; subsequent calls take < 150ms.*
30. **Q: What would be your next step if you had another month to work on this project?**  
    *A: Integrate real-time streaming availability (JustWatch API) and transition the recommendation engine to a two-tower vector embedding model using pgvector or MongoDB Atlas Vector Search.*

---

## 11. 5-Minute Live Viva Demo Script

Follow this exact sequence during your demonstration to show all key modules efficiently:

1. **Step 1: Landing Page & Problem Statement (0:00 - 1:00)**:
   - Open home page: Point out the cinematic obsidian dark theme and original identity.
   - Show the quick emotion prompt bar: Type *"Exhausted after exam week, need pure heartwarming laughs"*. Click Match Mood.
2. **Step 2: Recommendations & Explainability (1:00 - 2:00)**:
   - Show the recommendations page: Highlight the **Match Score (e.g. 84%)**, the **Reason Badge**, and the **Data Source Badge** (Live OMDb).
   - Explain the scoring formula: *"Sir, the score is calculated using genre overlap, IMDb rating, popularity log scaling, and user preferences."*
3. **Step 3: User Interaction & Library (2:00 - 3:00)**:
   - Click into a movie details page.
   - Click "Add to Watchlist" and "Favorite". Show optimistic toast update.
   - Scroll down to reviews: Submit a 5-star review. Point out the automated sentiment classification (Positive badge).
   - Navigate to `/watchlist` and `/history` to show persistent user data.
4. **Step 4: Natural Language Mood Selector (3:00 - 4:00)**:
   - Navigate to `/mood`. Show the 8 interactive mood cards.
   - Switch to "Describe How You Feel (AI / NLP)" tab. Click an example prompt.
   - Show detected mood and confidence percentage.
5. **Step 5: Admin Panel & Governance (4:00 - 5:00)**:
   - Log out and log in as `admin@moodie.demo`.
   - Open `/admin`: Show real-time KPI telemetry cards and Recharts analytics graphs (switch range between 7d and 30d).
   - Open `/admin/users`: Show block/unblock and role toggling.
   - Conclude: *"Thank you, Sir/Ma'am. The application is completely functional, secure, and resilient."*
