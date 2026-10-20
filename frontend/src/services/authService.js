import api from './api';

export const authService = {
  /**
   * Authenticate user with credentials against the backend API.
   * Role comes strictly from the backend response.
   */
  async login({ email, password }) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const response = await api.post('/auth/login', {
      email: email.trim().toLowerCase(),
      password
    });

    const { user, token } = response.data;

    if (token) {
      localStorage.setItem('moodie_token', token);
    }
    if (user) {
      localStorage.setItem('moodie_user', JSON.stringify(user));
    }

    return { user, token };
  },

  /**
   * Register a new account against the backend API.
   * Role comes strictly from the backend response (default USER).
   */
  async register({ name, email, password }) {
    if (!name || !email || !password) {
      throw new Error('All registration fields are required');
    }

    const response = await api.post('/auth/register', {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password
    });

    const { user, token } = response.data;

    if (token) {
      localStorage.setItem('moodie_token', token);
    }
    if (user) {
      localStorage.setItem('moodie_user', JSON.stringify(user));
    }

    return { user, token };
  },

  /**
   * Validate and retrieve the active session user via GET /auth/me.
   */
  async getMe() {
    const response = await api.get('/auth/me');
    const { user } = response.data;
    if (user) {
      localStorage.setItem('moodie_user', JSON.stringify(user));
    }
    return user;
  },

  /**
   * Alias for getMe for backward compatibility.
   */
  async getCurrentUser() {
    return this.getMe();
  },

  /**
   * Logout user by notifying backend and clearing local credentials.
   */
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Swallowed on purpose: always ensure client state is cleared even if server or network fails
      console.warn('Backend logout notification skipped or failed:', err.message);
    } finally {
      localStorage.removeItem('moodie_token');
      localStorage.removeItem('moodie_user');
    }
    return { success: true };
  }
};

export default authService;
