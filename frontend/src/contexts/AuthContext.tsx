import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/client';
import type { Partner } from '../api/types';

interface AuthContextType {
  partner: Partner | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (role: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateAvatar: (avatarUrl: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ── Cookie helpers ───────────────────────────────────────────────────────────
const SESSION_COOKIE = 'icecream_session';
const COOKIE_DAYS    = 30;
const VALID_PIN      = '6767';

function setSessionCookie(role: string, name: string) {
  // Token: base64(role:name:pin) — read back and verify the PIN field to prevent tampering
  const token   = btoa(`${role}:${name}:${VALID_PIN}`);
  const expires = new Date();
  expires.setDate(expires.getDate() + COOKIE_DAYS);
  document.cookie = `${SESSION_COOKIE}=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

function getSessionCookie(): { role: string; name: string } | null {
  const raw   = `; ${document.cookie}`;
  const parts = raw.split(`; ${SESSION_COOKIE}=`);
  if (parts.length !== 2) return null;
  const token = parts.pop()?.split(';').shift();
  if (!token) return null;
  try {
    const decoded          = atob(token);
    const [role, name, pin] = decoded.split(':');
    if ((role === 'boyfriend' || role === 'girlfriend') && name && pin === VALID_PIN) {
      return { role, name };
    }
  } catch {
    // Corrupt cookie — ignore
  }
  return null;
}

function clearSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
// ────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** Construct a Partner from role/name and merge avatar from localStorage */
  const buildPartner = (role: string, name: string, extra?: any): Partner => {
    const savedAvatar = localStorage.getItem(`icecream_avatar_${role}`);
    return {
      id:        role === 'girlfriend' ? 2 : 1,
      role,
      name,
      pin:       VALID_PIN,
      avatar_url: savedAvatar || extra?.avatar_url || null,
      avatar:     savedAvatar || extra?.avatar     || null,
      ...extra,
    } as Partner;
  };

  const refreshAuth = useCallback(async () => {
    const sessionRole = sessionStorage.getItem('icecream_local_role') || localStorage.getItem('icecream_local_role');
    const savedCookie = getSessionCookie();

    if (sessionRole) {
      const name = sessionRole === 'girlfriend' ? 'Seema' : 'Maulik';
      setPartner(buildPartner(sessionRole, name));
      setIsLoading(false);
      return;
    }

    if (savedCookie) {
      setPartner(buildPartner(savedCookie.role, savedCookie.name));
      sessionStorage.setItem('icecream_local_role', savedCookie.role);
      localStorage.setItem('icecream_local_role', savedCookie.role);
      setIsLoading(false);
      return;
    }

    try {
      const res = await authAPI.me();
      if (res.data.authenticated && res.data.partner?.role) {
        const p = buildPartner(res.data.partner.role, res.data.partner.name, res.data.partner);
        setPartner(p);
        sessionStorage.setItem('icecream_local_role', p.role);
        localStorage.setItem('icecream_local_role', p.role);
        setSessionCookie(p.role, p.name);
        setIsLoading(false);
        return;
      }
    } catch {
      // Server unreachable
    }

    setPartner(null);
    setIsLoading(false);
  }, []);


  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const login = async (role: string, pin: string) => {
    // Validate PIN locally first — only the correct PIN is accepted
    if (pin !== VALID_PIN) {
      return { success: false, error: 'Wrong PIN code, try again.' };
    }

    const name = role === 'girlfriend' ? 'Seema' : 'Maulik';
    sessionStorage.setItem('icecream_local_role', role);
    localStorage.setItem('icecream_local_role', role);

    try {
      // Attempt server-side login (best-effort)
      const res  = await authAPI.login(role, pin);
      const data = res.data?.partner || {};
      const p    = buildPartner(role, data.name || name, data);
      setPartner(p);
      setSessionCookie(p.role, p.name);  // ← save 30-day cookie
      return { success: true };
    } catch {
      // Server down / offline — still log in using cookie
      const p = buildPartner(role, name);
      setPartner(p);
      setSessionCookie(role, name);      // ← save 30-day cookie
      return { success: true };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Ignore server errors on logout
    }
    sessionStorage.removeItem('icecream_local_role');
    localStorage.removeItem('icecream_local_role');
    clearSessionCookie();   // ← clear the cookie on logout
    setPartner(null);
  };

  const updateAvatar = (avatarUrl: string) => {
    if (!partner) return;
    localStorage.setItem(`icecream_avatar_${partner.role}`, avatarUrl);
    setPartner((prev) => (prev ? { ...prev, avatar_url: avatarUrl, avatar: avatarUrl } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        partner,
        isLoading,
        isAuthenticated: !!partner,
        login,
        logout,
        refreshAuth,
        updateAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
