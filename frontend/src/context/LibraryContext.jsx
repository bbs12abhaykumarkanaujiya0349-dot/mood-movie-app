import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import userService from '../services/userService';
import { mapMovie } from '../utils/movieMapper';

export const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const [watchlist, setWatchlist] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('moodie_token');

  // Load library items from backend
  const loadLibrary = useCallback(async () => {
    const currentToken = localStorage.getItem('moodie_token');
    if (!currentToken) {
      setWatchlist([]);
      setFavorites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [wlData, favData] = await Promise.all([
        userService.getWatchlist(),
        userService.getFavorites()
      ]);
      setWatchlist(wlData);
      setFavorites(favData);
    } catch (err) {
      console.warn('[LibraryContext] Failed to load library:', err.message);
      setError(err.message || 'Failed to sync library');
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload when token changes (login/logout)
  useEffect(() => {
    loadLibrary();
  }, [loadLibrary, token]);

  // Matcher helper supporting MongoDB _id, externalMovieId, and UI id
  const matchesMovieId = (movieItem, targetId) => {
    if (!movieItem || !targetId) return false;
    const cleanTarget = String(
      typeof targetId === 'object'
        ? targetId.externalMovieId || targetId.externalId || targetId.id || targetId._id
        : targetId
    ).trim();

    return Boolean(
      (movieItem.id && String(movieItem.id) === cleanTarget) ||
      (movieItem._id && String(movieItem._id) === cleanTarget) ||
      (movieItem.externalMovieId && String(movieItem.externalMovieId) === cleanTarget) ||
      (movieItem.externalId && String(movieItem.externalId) === cleanTarget)
    );
  };

  const isWatchlisted = (movieId) => {
    return watchlist.some((m) => matchesMovieId(m, movieId));
  };

  const isFavorite = (movieId) => {
    return favorites.some((m) => matchesMovieId(m, movieId));
  };

  /**
   * Optimistic Watchlist Toggle with Error Rollback and 409 Handling
   */
  const toggleWatchlist = async (movie) => {
    if (!localStorage.getItem('moodie_token')) {
      toast.error('Please log in to save movies to your watchlist.');
      return;
    }

    const movieObj = typeof movie === 'object' ? mapMovie(movie) : { id: movie, title: 'Movie' };
    const targetId = movieObj.externalMovieId || movieObj.externalId || movieObj.id || movieObj._id;
    const title = movieObj.title || 'Movie';
    const exists = isWatchlisted(targetId);

    const previousWatchlist = [...watchlist];

    if (exists) {
      // Optimistic removal
      setWatchlist((prev) => prev.filter((m) => !matchesMovieId(m, targetId)));
      try {
        await userService.removeFromWatchlist(targetId);
        toast.success(`Removed "${title}" from watchlist`);
      } catch (err) {
        // Rollback on error
        setWatchlist(previousWatchlist);
        toast.error(err.message || `Failed to remove "${title}"`);
      }
    } else {
      // Optimistic addition
      setWatchlist((prev) => [movieObj, ...prev]);
      try {
        await userService.addToWatchlist(targetId);
        toast.success(`Added "${title}" to watchlist`);
      } catch (err) {
        // Rollback on error
        setWatchlist(previousWatchlist);
        if (err.status === 409 || err.response?.status === 409) {
          toast(`"${title}" is already in your watchlist.`, { icon: 'ℹ️' });
        } else {
          toast.error(err.message || `Failed to add "${title}"`);
        }
      }
    }
  };

  /**
   * Optimistic Favorites Toggle with Error Rollback and 409 Handling
   */
  const toggleFavorite = async (movie) => {
    if (!localStorage.getItem('moodie_token')) {
      toast.error('Please log in to save favorites.');
      return;
    }

    const movieObj = typeof movie === 'object' ? mapMovie(movie) : { id: movie, title: 'Movie' };
    const targetId = movieObj.externalMovieId || movieObj.externalId || movieObj.id || movieObj._id;
    const title = movieObj.title || 'Movie';
    const exists = isFavorite(targetId);

    const previousFavorites = [...favorites];

    if (exists) {
      // Optimistic removal
      setFavorites((prev) => prev.filter((m) => !matchesMovieId(m, targetId)));
      try {
        await userService.removeFromFavorites(targetId);
        toast.success(`Removed "${title}" from favorites`);
      } catch (err) {
        // Rollback on error
        setFavorites(previousFavorites);
        toast.error(err.message || `Failed to remove "${title}"`);
      }
    } else {
      // Optimistic addition
      setFavorites((prev) => [movieObj, ...prev]);
      try {
        await userService.addToFavorites(targetId);
        toast.success(`Added "${title}" to favorites`);
      } catch (err) {
        // Rollback on error
        setFavorites(previousFavorites);
        if (err.status === 409 || err.response?.status === 409) {
          toast(`"${title}" is already in your favorites.`, { icon: 'ℹ️' });
        } else {
          toast.error(err.message || `Failed to favorite "${title}"`);
        }
      }
    }
  };

  const value = {
    watchlist,
    favorites,
    loading,
    error,
    isWatchlisted,
    isFavorite,
    toggleWatchlist,
    toggleFavorite,
    refreshLibrary: loadLibrary
  };

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}

export default LibraryContext;
