import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const LibraryContext = createContext(null);

const STORAGE_KEYS = {
  WATCHLIST: 'moodie_watchlist',
  FAVORITES: 'moodie_favorites'
};

const getStored = (key, fallback = []) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};

export function LibraryProvider({ children }) {
  const [watchlist, setWatchlist] = useState(() =>
    getStored(STORAGE_KEYS.WATCHLIST, ['m1', 'm3', 'm6'])
  );
  const [favorites, setFavorites] = useState(() =>
    getStored(STORAGE_KEYS.FAVORITES, ['m9', 'm21'])
  );

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

  const isWatchlisted = (movieId) => watchlist.includes(movieId);
  const isFavorite = (movieId) => favorites.includes(movieId);

  const toggleWatchlist = (movie) => {
    const exists = watchlist.includes(movie.id);
    if (exists) {
      setWatchlist((prev) => prev.filter((id) => id !== movie.id));
      toast.success(`Removed "${movie.title}" from watchlist`);
    } else {
      setWatchlist((prev) => [...prev, movie.id]);
      toast.success(`Added "${movie.title}" to watchlist`);
    }
  };

  const toggleFavorite = (movie) => {
    const exists = favorites.includes(movie.id);
    if (exists) {
      setFavorites((prev) => prev.filter((id) => id !== movie.id));
      toast.success(`Removed "${movie.title}" from favorites`);
    } else {
      setFavorites((prev) => [...prev, movie.id]);
      toast.success(`Added "${movie.title}" to favorites`);
    }
  };

  const value = {
    watchlist,
    favorites,
    isWatchlisted,
    isFavorite,
    toggleWatchlist,
    toggleFavorite
  };

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}

export default LibraryContext;
