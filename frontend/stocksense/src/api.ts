// =========================================================================
// api.ts - Helper functions to communicate with the Flask Backend
// =========================================================================

const API_URL = 'http://localhost:5000/api';

// Helper to get the token from localStorage
const getHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: Bearer  } : {}),
  };
};

export const api = {
  // ── Auth Endpoints ───────────────────────────────────────────────────
  async signup(email, password) {
    const res = await fetch(${API_URL}/auth/signup, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async login(email, password) {
    const res = await fetch(${API_URL}/auth/login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    
    // If login is successful, store the token
    if (res.ok && data.session) {
      localStorage.setItem('access_token', data.session.access_token);
    }
    return { ok: res.ok, data };
  },

  async logout() {
    await fetch(${API_URL}/auth/logout, {
      method: 'POST',
      headers: getHeaders(),
    });
    localStorage.removeItem('access_token');
  },

  async getCurrentUser() {
    const res = await fetch(${API_URL}/auth/me, {
      headers: getHeaders(),
    });
    return res.ok ? res.json() : null;
  },

  // ── Data Endpoints ───────────────────────────────────────────────────
  async getProfile() {
    const res = await fetch(${API_URL}/data/profile, {
      headers: getHeaders(),
    });
    return res.ok ? res.json() : null;
  },

  async saveProfile(profileData) {
    const res = await fetch(${API_URL}/data/profile, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    return res.json();
  }
};
