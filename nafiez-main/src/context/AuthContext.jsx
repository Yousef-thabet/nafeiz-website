import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiPost } from '@/services/api';

const AuthContext = createContext(null);
const ACCESS_TOKEN_KEY = 'nafeiz_access_token';
const REFRESH_TOKEN_KEY = 'nafeiz_refresh_token';
const USER_KEY = 'nafeiz_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const handleSessionExpired = () => {
      clearSession();
      if (window.location.pathname !== '/admin/login') {
        window.location.assign('/admin/login?reason=session-expired');
      }
    };
    window.addEventListener('auth:session-expired', handleSessionExpired);

    async function restoreSession() {
      try {
        const response = await apiPost('/auth/refresh', {});
        const payload = response?.data ?? response;
        if (active && payload?.user?.role) {
          persistSession(payload.user);
        } else if (active) {
          clearSession();
        }
      } catch {
        if (active) clearSession();
      } finally {
        if (active) setLoading(false);
      }
    }

    restoreSession();
    return () => {
      active = false;
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, []);

  const persistSession = (user) => {
    if (!user) return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setUser(user);
  };

  const clearSession = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const login = async (credentials) => {
    const response = await apiPost('/auth/login', credentials);
    const payload = response?.data ?? response;
    if (!payload?.user) {
      throw new Error('Invalid login response');
    }
    persistSession(payload.user);
    return payload;
  };

  const logout = async () => {
    try {
      await apiPost('/auth/logout', {});
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      clearSession();
    }
  };

  const value = useMemo(
    () => ({ user, loading, login, logout, setUser, clearSession }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
