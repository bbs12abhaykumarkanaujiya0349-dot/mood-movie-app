# Complete Production Deployment Guide

A step-by-step beginner-friendly guide to deploying **Moodie (AI Mood-Based Movie Recommendation System)** using **MongoDB Atlas**, **Render** (Node.js REST API backend), and **Vercel** (React + Vite single-page application).

---

## Architecture Overview

```
[ Browser Client ]
       │
       ▼
[ Vercel CDN (Frontend) ]
  https://mood-movie-app.vercel.app
       │ (HTTPS Requests + Bearer JWT)
       ▼
[ Render Web Service (Backend) ]
  https://mood-movie-backend.onrender.com
       │
       ├────► [ MongoDB Atlas (Cloud Database) ]
       ├────► [ OMDb API (Live Movie Metadata) ]
       └────► [ Google Gemini API (NLP Sentiment) ]
```

---

## Step 1: MongoDB Atlas Setup

1. **Sign Up / Log In**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create an account.
2. **Create a Free Cluster**:
   - Choose the **M0 Shared** tier (100% free forever).
   - Select a cloud provider (AWS/GCP) and region closest to your intended users (e.g., `ap-south-1` Mumbai or `us-east-1`).
3. **Database Security (Users & Credentials)**:
   - Navigate to **Security** -> **Database Access**.
   - Click **Add New Database User**.
   - Authentication Method: **Password**.
   - Enter a secure username (e.g., `moodie_admin`) and generate a strong 24+ character password.
   - Database User Privileges: `Read and write to any database`.
   - Click **Add User**.
4. **Network Access (IP Whitelisting)**:
   - Navigate to **Security** -> **Network Access**.
   - Click **Add IP Address**.
   - For Render cloud instances (which use dynamic outbound IPs), add:
     - Access List Entry: `0.0.0.0/0` (Allow Access from Anywhere).
     - Comment: `Render backend deployment`.
   - Click **Confirm**.
5. **Obtain Connection String**:
   - In **Database** -> **Clusters**, click **Connect**.
   - Choose **Drivers** (Node.js).
   - Copy the connection URI:
     `mongodb+srv://moodie_admin:<password>@cluster0.xxxxx.mongodb.net/mood_movie_db?retryWrites=true&w=majority`
   - Replace `<password>` with your database user password and specify the database name (`mood_movie_db`).

---

## Step 2: Deploy Backend to Render

1. **Sign Up / Log In**: Go to [Render](https://render.com) and link your GitHub account.
2. **Create New Web Service**:
   - Click **New +** -> **Web Service**.
   - Select your GitHub repository: `mood-movie-app`.
3. **Configure Build & Runtime Settings**:
   - **Name**: `mood-movie-backend` (or similar).
   - **Region**: Choose the same geographic region as MongoDB Atlas.
   - **Branch**: `main`.
   - **Root Directory**: `backend` *(CRITICAL: do not leave empty)*.
   - **Runtime**: `Node`.
   - **Build Command**: `npm install`.
   - **Start Command**: `npm start`.
   - **Instance Type**: `Free`.
4. **Configure Environment Variables**:
   Click **Advanced** -> **Add Environment Variable** and enter each key:

   | Variable Name | Example Value / Description |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `MONGO_URI` | `mongodb+srv://moodie_admin:PASSWORD@cluster0.xxxxx.mongodb.net/mood_movie_db?retryWrites=true&w=majority` |
   | `JWT_SECRET` | Strong secret string (at least 32 characters long) |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CLIENT_URL` | `http://localhost:5173` *(Update this in Step 4 after Vercel gives you your frontend URL)* |
   | `OMDB_API_KEY` | Your active OMDb API key |
   | `AI_API_KEY` | Your Google Gemini API key |
   | `AI_MODEL` | `gemini-3.8-flash` |

5. **Deploy**:
   - Click **Create Web Service**.
   - Wait 2–3 minutes for build logs to show:
     ```
     ==> Uploading build...
     ==> Deploying...
     🚀 Mood Movie Backend running in [production] mode on port 5000
     ✅ MongoDB Connected successfully
     ```
   - Copy your Render backend service URL (e.g., `https://mood-movie-backend.onrender.com`).

---

## Step 3: Deploy Frontend to Vercel

1. **Sign Up / Log In**: Go to [Vercel](https://vercel.com) and link your GitHub account.
2. **Import Project**:
   - Click **Add New...** -> **Project**.
   - Select the `mood-movie-app` repository.
3. **Configure Framework & Root Directory**:
   - **Framework Preset**: `Vite`.
   - **Root Directory**: Click "Edit" and choose `frontend` *(CRITICAL)*.
   - **Build Command**: `npm run build`.
   - **Output Directory**: `dist`.
4. **Configure Environment Variables**:
   - Add the following variable:
     - Key: `VITE_API_URL`
     - Value: `https://mood-movie-backend.onrender.com/api` *(Your Render URL from Step 2 with `/api` path)*
5. **Deploy**:
   - Click **Deploy**.
   - Vercel automatically reads [`frontend/vercel.json`](file:///c:/Users/USIT/Desktop/mood-movie-app/frontend/vercel.json) for client-side single-page routing rewrites.
   - Once deployed, copy your live frontend URL (e.g., `https://mood-movie-app.vercel.app`).

---

## Step 4: Connect Backend CORS to Frontend URL

1. Return to [Render Dashboard](https://dashboard.render.com).
2. Select your `mood-movie-backend` service -> **Environment**.
3. Update `CLIENT_URL` with your live Vercel URL (or comma-separated if supporting localhost for staging):
   ```
   CLIENT_URL=https://mood-movie-app.vercel.app,http://localhost:5173
   ```
4. Click **Save Changes**. Render will automatically trigger a rolling redeploy in 30 seconds.

---

## Step 5: Safe Production Database Seeding

To populate your live production MongoDB database with the initial demo accounts (`user@moodie.demo`, `admin@moodie.demo`) and baseline movie catalog:

Run the seed script locally from your development machine pointing to your production MongoDB URI:

```bash
# In your local backend directory:
cd backend

# Execute idempotent seed script
MONGO_URI="your_production_atlas_uri" node src/seed/seed.js
```

> [!NOTE]
> The seed script is completely **idempotent**. It checks for the existence of demo accounts before inserting and will never create duplicate records or destroy existing user data.

---

## Step 6: Post-Deployment Verification Checklist

Verify your production deployment in order:

- [ ] **Health Check**: Open `https://mood-movie-backend.onrender.com/api/health` in your browser. Verify you receive:
  ```json
  {
    "status": "ok",
    "db": "connected"
  }
  ```
- [ ] **Frontend Home Page**: Open `https://mood-movie-app.vercel.app/`. Ensure movies load and hero animations render smoothly.
- [ ] **User Sign In**: Log in using `user@moodie.demo` and password `User@12345`. Verify toast notification and user avatar in navbar.
- [ ] **Mood Recommendations**: Navigate to `/mood`, select a mood, and confirm ranked recommendations appear with match scores and reasons.
- [ ] **Watchlist & Reviews**: Bookmark a movie and submit a 5-star review. Verify real-time list update.
- [ ] **Admin Governance**: Log in using `admin@moodie.demo` and password `Admin@12345`. Navigate to `/admin` and confirm telemetry KPI cards and charts load.
- [ ] **Route Refresh**: Navigate to `/movies` or `/settings` and hit refresh (F5). Confirm Vercel single-page rewrite prevents 404 errors.

---

## ⏳ Free-Tier Cold Start Warning

> [!IMPORTANT]
> **Render Free Instance Behavior**:  
> Render's free tier automatically spins down web services after 15 minutes of inactivity.  
> When a user accesses the site after an idle period, the initial API request may experience a **30 to 50 second cold-start delay** while the container boots up.  
> Subsequent requests will be near-instantaneous (< 150ms).  
> *For viva demonstrations, open the web app 5 minutes before your presentation to ensure the backend container is warm and active!*
