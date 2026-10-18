import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

// Public & Core Pages
import LandingPage from '../pages/home/LandingPage';
import AboutPage from '../pages/AboutPage';
import MoviesPage from '../pages/movies/MoviesPage';
import MovieDetailsPage from '../pages/movies/MovieDetailsPage';
import MoodSelectPage from '../pages/MoodSelectPage';
import RecommendationsPage from '../pages/RecommendationsPage';

// User Account & Collections
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import WatchlistPage from '../pages/WatchlistPage';
import FavoritesPage from '../pages/FavoritesPage';
import HistoryPage from '../pages/HistoryPage';
import ProfilePage from '../pages/profile/ProfilePage';
import SettingsPage from '../pages/SettingsPage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminReviewsPage from '../pages/admin/AdminReviewsPage';
import AdminMoviesPage from '../pages/admin/AdminMoviesPage';
import AdminAnalyticsPage from '../pages/admin/AdminAnalyticsPage';

// 404 Error Page
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Core Discovery Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/movie/:id" element={<MovieDetailsPage />} />
        <Route path="/mood" element={<MoodSelectPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />

        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* User Curation Routes */}
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Administration Governance Routes */}
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/reviews" element={<AdminReviewsPage />} />
        <Route path="/admin/movies" element={<AdminMoviesPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
