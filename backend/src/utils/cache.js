/**
 * In-memory TTL cache with auto-expiry to protect rate limits
 * and accelerate repeated requests for trending, popular, genres, and details.
 */
class MemoryCache {
  constructor(defaultTtlMs = 10 * 60 * 1000) {
    this.cache = new Map();
    this.defaultTtlMs = defaultTtlMs;

    // Periodic sweep of expired items every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref(); // Do not block process exit
    }
  }

  set(key, value, ttlMs = this.defaultTtlMs) {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { value, expiresAt });
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

module.exports = new MemoryCache();
