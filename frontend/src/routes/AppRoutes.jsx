import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// Public Pages
import LandingPage from '../pages/home/LandingPage';
import AboutPage from '../pages/AboutPage';
import MoviesPage from '../pages/movies/MoviesPage';
import MovieDetailsPage from '../pages/movies/MovieDetailsPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import NotFoundPage from '../pages/NotFoundPage';

// Protected User Pages
import UserDashboardPage from '../pages/home/UserDashboardPage';
import MoodSelectPage from '../pages/MoodSelectPage';
import RecommendationsPage from '../pages/RecommendationsPage';
import WatchlistPage from '../pages/WatchlistPage';
import FavoritesPage from '../pages/FavoritesPage';
import HistoryPage from '../pages/HistoryPage';
import ProfilePage from '../pages/profile/ProfilePage';
import SettingsPage from '../pages/SettingsPage';

// Admin Protected Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminReviewsPage from '../pages/admin/AdminReviewsPage';
import AdminMoviesPage from '../pages/admin/AdminMoviesPage';
import AdminAnalyticsPage from '../pages/admin/AdminAnalyticsPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Consumer Routes (Header, Main Container, Footer) */}
      <Route element={<MainLayout />}>
        {/* Public Discovery Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/movie/:id" element={<MovieDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected User Routes (Require Authentication) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<UserDashboardPage />} />
          <Route path="/mood" element={<MoodSelectPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin Governance Routes (Protected by AdminRoute and nested in AdminLayout) */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/reviews" element={<AdminReviewsPage />} />
          <Route path="/admin/movies" element={<AdminMoviesPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
