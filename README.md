# AI Mood-Based Movie Recommendation System 🎬🤖

**MCA Final Year Project**

A web-based intelligent movie recommendation platform that analyzes a user's mood (via predefined mood tags or natural-language input) and recommends suitable movies with rich metadata, ratings, watchlists, reviews, and admin management.

---

## 🚀 Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, React Router, Axios, Lucide React, Framer Motion
- **Backend**: Node.js, Express.js, JWT, bcryptjs, Mongoose, cors, express-validator, express-rate-limit, helmet
- **Database**: MongoDB (Mongoose ODM)
- **External Services**: Movie API (TMDb / OMDb) with local movie dataset fallback, AI/NLP service with rule-based fallback

---

## 📁 Project Structure

```
mood-movie-app/
├── frontend/               # React + Vite + Tailwind client application
├── backend/                # Node.js + Express.js REST API server
├── docs/                   # Project documentation and SRS tracking
│   ├── SRS_CHECKLIST.md    # Requirement verification matrix (FRs, NFRs, APIs, DB, UI)
│   └── PROJECT_RULES.md    # Architectural rules, coding standards, fallback policies
├── SRS.pdf                 # Formal Software Requirements Specification document
├── .gitignore              # Ignored files (node_modules, .env, build artifacts)
└── README.md               # Project overview and documentation
```

---

## 📋 Status & Progress Tracking
Track implementation progress against the SRS in [`docs/SRS_CHECKLIST.md`](docs/SRS_CHECKLIST.md).
Project architecture standards are documented in [`docs/PROJECT_RULES.md`](docs/PROJECT_RULES.md).
