import api from './api';

// Helper for simulated network delay (300-600ms)
const delay = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  /**
   * Authenticate user with credentials
   * MOCK: replace with real API in integration step -> return (await api.post('/auth/login', credentials)).data;
   */
  async login({ email, password }) {
    await delay(450);

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Role determined by email keyword per project spec
    const role = email.toLowerCase().includes('admin') ? 'admin' : 'user';
    const mockUser = {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      role,
      createdAt: new Date().toISOString()
    };

    const mockToken = `mock_jwt_${btoa(JSON.stringify({ id: mockUser.id, role: mockUser.role, exp: Date.now() + 86400000 }))}`;

    localStorage.setItem('moodie_token', mockToken);
    localStorage.setItem('moodie_user', JSON.stringify(mockUser));

    return { user: mockUser, token: mockToken };
  },

  /**
   * Register a new account
   * MOCK: replace with real API in integration step -> return (await api.post('/auth/register', userData)).data;
   */
  async register({ name, email, password }) {
    await delay(500);

    if (!name || !email || !password) {
      throw new Error('All registration fields are required');
    }

    const role = email.toLowerCase().includes('admin') ? 'admin' : 'user';
    const mockUser = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role,
      createdAt: new Date().toISOString()
    };

    const mockToken = `mock_jwt_${btoa(JSON.stringify({ id: mockUser.id, role: mockUser.role, exp: Date.now() + 86400000 }))}`;

    localStorage.setItem('moodie_token', mockToken);
    localStorage.setItem('moodie_user', JSON.stringify(mockUser));

    return { user: mockUser, token: mockToken };
  },

  /**
   * Retrieve active session user
   * MOCK: replace with real API in integration step -> return (await api.get('/auth/me')).data;
   */
  async getCurrentUser() {
    await delay(200);
    const storedUser = localStorage.getItem('moodie_user');
    const storedToken = localStorage.getItem('moodie_token');

    if (storedUser && storedToken) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Logout user and clear local credentials
   * MOCK: replace with real API in integration step
   */
  async logout() {
    await delay(150);
    localStorage.removeItem('moodie_token');
    localStorage.removeItem('moodie_user');
    return { success: true };
  }
};

export default authService;
