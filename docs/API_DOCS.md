# Mood Movie API Documentation

Comprehensive REST API reference for the AI Mood-Based Movie Recommendation System backend.

Base URL: `http://localhost:5000` (or configured `PORT`)

---

## Table of Contents
1. [General & Health](#1-general--health)
2. [Authentication (`/api/auth`)](#2-authentication-apiauth)
3. [Movies Catalog (`/api/movies`)](#3-movies-catalog-apimovies)
4. [Mood Analysis (`/api/mood`)](#4-mood-analysis-apimood)
5. [Recommendation Engine (`/api/recommendations`)](#5-recommendation-engine-apirecommendations)
6. [Watchlist (`/api/watchlist`)](#6-watchlist-apiwatchlist)
7. [Favorites (`/api/favorites`)](#7-favorites-apifavorites)
8. [Reviews & Sentiment (`/api/reviews`)](#8-reviews--sentiment-apireviews)
9. [Mood History (`/api/history`)](#9-mood-history-apihistory)
10. [User Profile & Stats (`/api/users`)](#10-user-profile--stats-apiusers)
11. [Admin Verification (`/api/admin`)](#11-admin-verification-apiadmin)

---

## 1. General & Health

### `GET /api/health`
- **Description**: Verifies API and MongoDB connectivity.
- **Auth**: Public
- **Success Response (200)**:
  ```json
  {
    "status": "ok",
    "timestamp": "2026-10-20T10:00:00.000Z",
    "db": "connected"
  }
  ```
- **Error Response**:
  - `503 Service Unavailable`: MongoDB disconnected.

---

## 2. Authentication (`/api/auth`)

### `POST /api/auth/register`
- **Description**: Registers a new user account and returns a JWT.
- **Auth**: Public
- **Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
- **Success Response (201)**:
  ```json
  {
    "success": true,
    "token": "jwt_token_string",
    "user": {
      "id": "6ad73...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "USER",
      "watchlist": [],
      "favoriteMovies": [],
      "preferences": { "favoriteGenres": [], "language": "en" }
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Validation failure (invalid email format, password under 8 characters or missing uppercase/lowercase/number/symbol).
  - `409 Conflict`: Email already exists.

### `POST /api/auth/login`
- **Description**: Authenticates user credentials and returns a JWT.
- **Auth**: Public
- **Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "token": "jwt_token_string",
    "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "USER" }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Invalid email or password.
  - `403 Forbidden`: Account is blocked.

### `GET /api/auth/me`
- **Description**: Retrieves current authenticated user profile.
- **Auth**: Required (`Bearer <token>`)
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "USER" }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid token.

### `PATCH /api/auth/me`
- **Description**: Updates profile details (name).
- **Auth**: Required (`Bearer <token>`)
- **Body**: `{ "name": "Jane Smith" }`
- **Success Response (200)**: `{ "success": true, "user": { ... } }`

### `PATCH /api/auth/password`
- **Description**: Changes user password.
- **Auth**: Required (`Bearer <token>`)
- **Body**:
  ```json
  {
    "currentPassword": "OldPassword123!",
    "newPassword": "NewPassword123!"
  }
  ```
- **Success Response (200)**: `{ "success": true, "message": "Password updated successfully" }`
- **Error Responses**:
  - `400 Bad Request`: Validation failure for new password.
  - `401 Unauthorized`: Current password incorrect.

### `POST /api/auth/logout`
- **Description**: Stateless logout notification.
- **Auth**: Required (`Bearer <token>`)
- **Success Response (200)**: `{ "success": true, "message": "Logged out successfully" }`

---

## 3. Movies Catalog (`/api/movies`)

### `GET /api/movies/search`
- **Description**: Searches movies with optional filtering and sorting.
- **Auth**: Public
- **Query Parameters**:
  - `q` (string): Title keyword search.
  - `genre` (string): Target genre filter.
  - `minRating` (number): Minimum rating (0-10).
  - `sort` (string): Sorting order (`rating`, `releaseDate`, `popularity`).
  - `page` (number, default 1).
  - `limit` (number, default 12).
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "source": "omdb",
    "page": 1,
    "totalPages": 7,
    "total": 80,
    "results": [
      {
        "externalId": "tt1375666",
        "title": "Inception",
        "releaseDate": "2010-07-16",
        "genres": ["Action", "Adventure", "Sci-Fi"],
        "rating": 8.8,
        "posterUrl": "https://...",
        "overview": "A thief who steals corporate secrets..."
      }
    ]
  }
  ```

### `GET /api/movies/trending`
- **Description**: Fetches trending movies (top rated / high popularity).
- **Auth**: Public
- **Success Response (200)**: `{ "success": true, "source": "omdb", "results": [...] }`

### `GET /api/movies/popular`
- **Description**: Fetches popular movies ordered by IMDb rating and votes.
- **Auth**: Public
- **Success Response (200)**: `{ "success": true, "source": "omdb", "results": [...] }`

### `GET /api/movies/genres`
- **Description**: Returns all recognized movie genres.
- **Auth**: Public
- **Success Response (200)**: `{ "success": true, "genres": ["Action", "Adventure", ...] }`

### `GET /api/movies/:id`
- **Description**: Fetches complete details for a movie by IMDb ID or Mongo ID.
- **Auth**: Public
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "source": "omdb",
    "movie": {
      "externalId": "tt1375666",
      "title": "Inception",
      "genres": ["Action", "Adventure", "Sci-Fi"],
      "rating": 8.8,
      "runtime": 148,
      "director": "Christopher Nolan",
      "cast": ["Leonardo DiCaprio", "Joseph Gordon-Levitt"]
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid ID format.
  - `404 Not Found`: Movie not found.

### `GET /api/movies/:id/similar`
- **Description**: Returns movies sharing genres with the specified movie.
- **Auth**: Public
- **Success Response (200)**: `{ "success": true, "source": "omdb", "results": [...] }`

---

## 4. Mood Analysis (`/api/mood`)

### `POST /api/mood/analyze`
- **Description**: Analyzes emotional text to classify primary mood. Falls back gracefully to heuristic rule-based NLP with negation, contrast, and Hinglish understanding.
- **Auth**: Public
- **Body**: `{ "text": "I feel so lonely and down today" }`
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "mood": "Sad",
    "confidence": 0.9,
    "method": "rule-based",
    "targetGenres": ["Drama", "Inspirational", "Feel-Good"],
    "explanation": "Detected sadness/loneliness; recommending comforting and cathartic cinema."
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Missing text or text exceeds 500 characters.

### `GET /api/mood/list`
- **Description**: Lists all 8 supported mood categories and mapped genres.
- **Auth**: Public
- **Success Response (200)**: `{ "success": true, "moods": [...] }`

---

## 5. Recommendation Engine (`/api/recommendations`)

### `POST /api/recommendations`
- **Description**: Hybrid rule-based recommendation engine. Scores candidate movies across 4 weighted dimensions:
  - `moodGenreMatch` (45%)
  - `rating` (25%, normalized with 6.5 neutral default)
  - `popularity` (15%, log-scaled)
  - `userPreference` (15%, based on profile favorite genres and review history)
  Builds truthful human reasons explaining each recommendation.
  *Optional Auth*: If JWT token is provided, personalizes scores and records a `MoodHistory` entry.
- **Auth**: Optional (`Bearer <token>`)
- **Body**:
  ```json
  {
    "mood": "Excited",
    "limit": 12,
    "refresh": false
  }
  ```
  *OR*
  ```json
  {
    "text": "I need some adrenaline pumping thrills!",
    "limit": 12
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "mood": "Excited",
    "confidence": 0.95,
    "method": "rule-based",
    "source": "omdb",
    "total": 35,
    "recommendations": [
      {
        "movie": {
          "externalId": "tt0103064",
          "title": "Terminator 2: Judgment Day",
          "genres": ["Action", "Sci-Fi"],
          "rating": 8.6
        },
        "matchScore": 81,
        "reason": "Matches Action and Sci-Fi, rated 8.6, because you're feeling Excited.",
        "matchedGenres": ["Action", "Sci-Fi"],
        "inWatchlist": false,
        "inFavorites": false
      }
    ]
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Neither mood nor text provided, or invalid mood category.

---

## 6. Watchlist (`/api/watchlist`)

### `GET /api/watchlist`
- **Description**: Lists authenticated user's saved watchlist movies (populated).
- **Auth**: Required (`Bearer <token>`)
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "count": 1,
    "watchlist": [
      {
        "_id": "6ad...",
        "externalId": "tt1375666",
        "title": "Inception",
        "rating": 8.8
      }
    ]
  }
  ```

### `POST /api/watchlist`
- **Description**: Adds movie to watchlist (by MongoDB `_id` or external IMDb ID `tt...`).
- **Auth**: Required (`Bearer <token>`)
- **Body**: `{ "movieId": "tt1375666" }`
- **Success Response (201)**:
  ```json
  {
    "success": true,
    "message": "Movie added to watchlist successfully.",
    "movie": { ... }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Missing or invalid `movieId`.
  - `404 Not Found`: Movie cannot be resolved.
  - `409 Conflict`: Movie is already in user's watchlist.

### `DELETE /api/watchlist/:id`
- **Description**: Removes movie from user's watchlist.
- **Auth**: Required (`Bearer <token>`)
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Movie removed from watchlist successfully."
  }
  ```
- **Error Responses**:
  - `404 Not Found`: Movie not in user's watchlist.

---

## 7. Favorites (`/api/favorites`)

### `GET /api/favorites`
- **Description**: Lists authenticated user's favorite movies (populated).
- **Auth**: Required (`Bearer <token>`)
- **Success Response (200)**: `{ "success": true, "count": 1, "favorites": [...] }`

### `POST /api/favorites`
- **Description**: Adds movie to favorites.
- **Auth**: Required (`Bearer <token>`)
- **Body**: `{ "movieId": "tt0114709" }`
- **Success Response (201)**: `{ "success": true, "message": "Movie added to favorites successfully.", "movie": { ... } }`
- **Error Responses**:
  - `409 Conflict`: Movie is already in user's favorites.
  - `404 Not Found`: Movie not found.

### `DELETE /api/favorites/:id`
- **Description**: Removes movie from user's favorites.
- **Auth**: Required (`Bearer <token>`)
- **Success Response (200)**: `{ "success": true, "message": "Movie removed from favorites successfully." }`
- **Error Responses**:
  - `404 Not Found`: Movie not in user's favorites.

---

## 8. Reviews & Sentiment (`/api/reviews`)

### `POST /api/reviews`
- **Description**: Submits a review and 1-5 star rating. Automatically computes rule-based sentiment (`positive`, `neutral`, `negative`) based on rating and keyword lexicon. Sanitizes comment against HTML/script injection (XSS).
- **Auth**: Required (`Bearer <token>`)
- **Body**:
  ```json
  {
    "movieId": "tt1375666",
    "rating": 5,
    "comment": "Masterpiece of cinematic storytelling!"
  }
  ```
- **Success Response (201)**:
  ```json
  {
    "success": true,
    "message": "Review submitted successfully.",
    "review": {
      "id": "6ad...",
      "movieId": "6ad...",
      "rating": 5,
      "comment": "Masterpiece of cinematic storytelling!",
      "sentiment": "positive",
      "status": "visible"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Rating not between 1 and 5, or comment exceeding 1000 characters.
  - `409 Conflict`: User has already reviewed this movie.

### `GET /api/reviews/:movieId`
- **Description**: Retrieves public reviews for a movie with status "visible", including average rating summary. Exposes reviewer name, never email.
- **Auth**: Public
- **Query Parameters**: `page` (default 1), `limit` (default 10)
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "summary": {
      "averageRating": 5,
      "reviewCount": 1
    },
    "page": 1,
    "totalPages": 1,
    "total": 1,
    "reviews": [
      {
        "_id": "6ad...",
        "rating": 5,
        "comment": "Masterpiece...",
        "sentiment": "positive",
        "user": {
          "id": "6ad...",
          "name": "Jane Doe"
        },
        "createdAt": "..."
      }
    ]
  }
  ```

### `PATCH /api/reviews/:id`
- **Description**: Updates review comment or rating. Recomputes sentiment. Owner only.
- **Auth**: Required (`Bearer <token>`)
- **Body**: `{ "rating": 2, "comment": "Upon second watch, pacing dragged." }`
- **Success Response (200)**: `{ "success": true, "review": { ... } }`
- **Error Responses**:
  - `403 Forbidden`: Not owner of the review.
  - `404 Not Found`: Review not found.

### `DELETE /api/reviews/:id`
- **Description**: Deletes a review. Permitted for owner or ADMIN role.
- **Auth**: Required (`Bearer <token>`)
- **Success Response (200)**: `{ "success": true, "message": "Review deleted successfully." }`
- **Error Responses**:
  - `403 Forbidden`: Not owner and not an admin.
  - `404 Not Found`: Review not found.

### `GET /api/reviews/me/list`
- **Description**: Lists all reviews authored by the current user.
- **Auth**: Required (`Bearer <token>`)
- **Success Response (200)**: `{ "success": true, "count": 2, "reviews": [...] }`

---

## 9. Mood History (`/api/history`)

### `GET /api/history`
- **Description**: Retrieves user's mood recommendation search history with populated movie cards.
- **Auth**: Required (`Bearer <token>`)
- **Query Parameters**:
  - `mood` (string, optional): Filter by mood category (`?mood=Happy`).
  - `page` (number, default 1).
  - `limit` (number, default 10).
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "page": 1,
    "totalPages": 1,
    "total": 1,
    "history": [
      {
        "_id": "6ad...",
        "inputText": "Selected manually",
        "detectedMood": "Excited",
        "confidence": 1.0,
        "recommendations": [ ... ],
        "createdAt": "..."
      }
    ]
  }
  ```

### `DELETE /api/history/:id`
- **Description**: Deletes a specific history record.
- **Auth**: Required (`Bearer <token>`)
- **Success Response (200)**: `{ "success": true, "message": "History entry deleted successfully." }`
- **Error Responses**:
  - `404 Not Found`: History entry not found.

### `DELETE /api/history`
- **Description**: Clears entire mood search history for authenticated user.
- **Auth**: Required (`Bearer <token>`)
- **Success Response (200)**: `{ "success": true, "message": "Mood history cleared successfully." }`

---

## 10. User Profile & Stats (`/api/users`)

### `GET /api/users/me/stats`
- **Description**: Returns profile metrics for authenticated user.
- **Auth**: Required (`Bearer <token>`)
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "stats": {
      "watchlistCount": 4,
      "favoritesCount": 2,
      "reviewCount": 3,
      "moodCheckCount": 12,
      "memberSince": "2026-09-01T12:00:00.000Z"
    }
  }
  ```

### `PATCH /api/users/me/preferences`
- **Description**: Updates user preferred genres and content language.
- **Auth**: Required (`Bearer <token>`)
- **Body**:
  ```json
  {
    "favoriteGenres": ["Sci-Fi", "Action", "Adventure"],
    "language": "en"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Preferences updated successfully.",
    "preferences": {
      "favoriteGenres": ["Sci-Fi", "Action", "Adventure"],
      "language": "en"
    }
  }
  ```

### `DELETE /api/users/me`
- **Description**: Permanently deletes user account, cascading deletion across all written reviews and mood search history. Requires password confirmation.
- **Auth**: Required (`Bearer <token>`)
- **Body**:
  ```json
  {
    "password": "Password123!"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "User account and all associated reviews and history have been permanently deleted."
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Password missing in body.
  - `401 Unauthorized`: Password incorrect.

---

## 11. Admin Verification (`/api/admin`)

### `GET /api/admin/ping`
- **Description**: Role-Based Access Control sanity endpoint.
- **Auth**: Required with `role: "ADMIN"` (`Bearer <admin_token>`)
- **Success Response (200)**: `{ "success": true, "message": "Admin pong! Access verified." }`
- **Error Responses**:
  - `401 Unauthorized`: Token missing or invalid.
  - `403 Forbidden`: Authenticated user does not possess `ADMIN` role.
