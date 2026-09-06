import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add CSRF token and X-User-Role header to requests
api.interceptors.request.use((config) => {
  const csrfToken = getCookie('csrftoken');
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  const localRole = typeof window !== 'undefined' ? sessionStorage.getItem('icecream_local_role') : null;
  if (localRole) {
    config.headers['X-User-Role'] = localRole;
  }
  return config;
});

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// --- Auth ---
export const authAPI = {
  getPartners: () => api.get('/api/auth/partners'),
  login: (role: string, pin: string) => api.post('/api/auth/login', { role, pin }),
  logout: () => api.post('/api/auth/logout'),
  me: () => api.get('/api/auth/me'),
  setup: (role: string, data: FormData) => api.post(`/api/auth/setup/${role}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateProfile: (data: FormData) => api.patch('/api/auth/profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// --- Games ---
export const gamesAPI = {
  catalog: () => api.get('/api/games/catalog'),
  createRoom: (gameType: string) => api.post('/api/games/create', { game_type: gameType }),
  activeRoom: () => api.get('/api/games/active'),
  roomDetail: (id: number) => api.get(`/api/games/room/${id}/`),
  history: (gameType?: string) => api.get('/api/games/history', { params: { game_type: gameType } }),
  scoreboard: () => api.get('/api/games/scoreboard'),
};

// --- Social ---
export const socialAPI = {
  streak: () => api.get('/api/social/streak'),
  getStreak: () => api.get('/api/social/streak'),
  getNotes: () => api.get('/api/social/notes').then(r => r.data),
  createNote: (message: string) => api.post('/api/social/notes', { message }),
  sendNote: (message: string) => api.post('/api/social/notes', { message }),
  markNotesSeen: () => api.post('/api/social/notes/seen'),
  unreadNotes: () => api.get('/api/social/notes/unread'),
  getMemories: () => api.get('/api/social/memories'),
  createMemory: (data: { title: string; date: string; recurring?: boolean }) =>
    api.post('/api/social/memories', data),
};

// --- Chat ---
export const chatAPI = {
  history: (before?: number, limit?: number) =>
    api.get('/api/chat/messages', { params: { before, limit } }),
  getMessages: () => api.get('/api/chat/messages').then(r => r.data),
  markRead: () => api.post('/api/chat/read'),
};

// --- Notifications ---
export const notificationsAPI = {
  list: () => api.get('/api/notifications/'),
  markAllRead: () => api.post('/api/notifications/read'),
};

export default api;
