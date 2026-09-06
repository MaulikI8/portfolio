import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { CONFIG } from '../config';
import {
  MOCK_PARTNERS,
  MOCK_STREAK,
  MOCK_CATALOG,
  MOCK_ACTIVE_ROOM,
  MOCK_CHAT_HISTORY,
  MOCK_NOTES,
  MOCK_MEMORIES,
  MOCK_RESULTS,
} from '../mocks/fixtures';

export function useFetch<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getMockFallback = (url: string): any => {
    if (url.includes('/api/profile/partner') || url.includes('/api/auth/me')) return MOCK_PARTNERS.girlfriend;
    if (url.includes('/api/streak') || url.includes('/api/social/streak')) return MOCK_STREAK;
    if (url.includes('/api/games/catalog')) return MOCK_CATALOG;
    if (url.includes('/api/games/rooms/active') || url.includes('/api/games/active')) return MOCK_ACTIVE_ROOM;
    if (url.includes('/api/chat/history') || url.includes('/api/chat/messages')) return MOCK_CHAT_HISTORY;
    if (url.includes('/api/notes') || url.includes('/api/social/notes')) return MOCK_NOTES;
    if (url.includes('/api/memories') || url.includes('/api/social/memories')) return MOCK_MEMORIES;
    if (url.includes('/api/games/results') || url.includes('/api/games/scoreboard')) return MOCK_RESULTS;
    return null;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (CONFIG.USE_MOCKS) {
      setTimeout(() => {
        const mock = getMockFallback(endpoint);
        setData(mock);
        setLoading(false);
      }, 300);
      return;
    }

    try {
      const res = await api.get(endpoint);
      setData(res.data);
    } catch (err: any) {
      console.warn(`[useFetch] Endpoint ${endpoint} failed, falling back to mock:`, err);
      const mock = getMockFallback(endpoint);
      if (mock !== null) {
        setData(mock);
      } else {
        setError(err.message || 'Failed to load data.');
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
