import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import RouteLoadingFallback from '../components/common/RouteLoadingFallback';

// Public Pages (Lazy Loaded)
const LandingPage = lazy(() => import('../pages/home/LandingPage'));
const AboutPage = lazy(() => import('../pages/AboutPage'));
const MoviesPage = lazy(() => import('../pages/movies/MoviesPage'));
const MovieDetailsPage = lazy(() => import('../pages/movies/MovieDetailsPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

// Protected User Pages (Lazy Loaded)
const UserDashboardPage = lazy(() => import('../pages/home/UserDashboardPage'));
const MoodSelectPage = lazy(() => import('../pages/MoodSelectPage'));
const RecommendationsPage = lazy(() => import('../pages/RecommendationsPage'));
const WatchlistPage = lazy(() => import('../pages/WatchlistPage'));
const FavoritesPage = lazy(() => import('../pages/FavoritesPage'));
const HistoryPage = lazy(() => import('../pages/HistoryPage'));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));

// Admin Protected Pages (Lazy Loaded)
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminReviewsPage = lazy(() => import('../pages/admin/AdminReviewsPage'));
const AdminMoviesPage = lazy(() => import('../pages/admin/AdminMoviesPage'));
const AdminAnalyticsPage = lazy(() => import('../pages/admin/AdminAnalyticsPage'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
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
    </Suspense>
  );
}
