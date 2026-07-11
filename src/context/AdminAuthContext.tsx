import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  authApi, setAccessToken, setRefreshToken,
  getRefreshToken, clearTokens,
} from '../api/client';

interface AdminAuthValue {
  isAuthenticated: boolean;
  adminName: string;
  adminRole: string;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const STORAGE_KEY = 'tuni-admin-auth'; // legacy key kept for backward compat (stores name only)

const AdminAuthContext = createContext<AdminAuthValue | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminName, setAdminName] = useState('Admin TuNi');
  const [adminRole, setAdminRole] = useState('');

  // ── On mount: silent restore session via refresh token ────────────────────
  useEffect(() => {
    const rt = getRefreshToken();
    if (!rt) return;

    let cancelled = false;
    authApi.refresh(rt)
      .then((data) => {
        if (cancelled) return;
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        setAdminName(data.name);
        setAdminRole(data.role);
        setIsAuthenticated(true);
        try { localStorage.setItem(STORAGE_KEY, data.name); } catch { /* ignore */ }
      })
      .catch(() => {
        if (!cancelled) clearTokens();
      });

    return () => { cancelled = true; };
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const data = await authApi.adminLogin({ username, password });
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setAdminName(data.name);
      setAdminRole(data.role);
      setIsAuthenticated(true);
      try { localStorage.setItem(STORAGE_KEY, data.name); } catch { /* ignore */ }
      return true;
    } catch {
      return false;
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    const rt = getRefreshToken();
    if (rt) authApi.logout(rt).catch(() => { /* best effort */ });
    clearTokens();
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setIsAuthenticated(false);
    setAdminName('Admin TuNi');
    setAdminRole('');
  }, []);

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, adminName, adminRole, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthValue => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};
