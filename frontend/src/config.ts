export const CONFIG = {
  USE_MOCKS: import.meta.env.VITE_USE_MOCKS === 'true' || false,
  API_BASE: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  WS_BASE: import.meta.env.VITE_WS_URL || 'ws://localhost:8000',
};
