import { useEffect } from 'react';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const { accessToken, refreshToken, setUser, setTokens, setLoading, clear } =
        useAuthStore.getState();
      setLoading(true);

      if (!accessToken) {
        clear();
        return;
      }

      try {
        const user = await authApi.me(accessToken);
        if (cancelled) return;
        setUser(user);
        setLoading(false);
        return;
      } catch {
        if (!refreshToken) {
          clear();
          return;
        }
        try {
          const tokens = await authApi.refresh(refreshToken);
          if (cancelled) return;
          setTokens(tokens.accessToken, tokens.refreshToken);
          const user = await authApi.me(tokens.accessToken);
          if (cancelled) return;
          setUser(user);
          setLoading(false);
        } catch {
          if (!cancelled) clear();
        }
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, []);
}

export async function logout(): Promise<void> {
  const { refreshToken, clear } = useAuthStore.getState();
  if (refreshToken) await authApi.logout(refreshToken);
  clear();
  window.location.href = '/login';
}
