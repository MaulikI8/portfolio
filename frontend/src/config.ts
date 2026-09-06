export const CONFIG = {
  USE_MOCKS: import.meta.env.VITE_USE_MOCKS === 'true' || false,
  API_BASE: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://portfolio-w7uw.onrender.com' : 'http://localhost:8000'),
  WS_BASE: import.meta.env.VITE_WS_URL || (import.meta.env.PROD ? 'wss://portfolio-w7uw.onrender.com' : 'ws://localhost:8000'),
};

