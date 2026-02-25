import { useEffect } from 'react';
import { AppProviders } from './providers';
import { AppRouter } from '@/routes';
import { useAuthStore, useUIStore } from '@/stores';
import { storage } from '@/utils';
import { authApi } from '@/features/auth/api/auth.api';

function AppContent() {
  const { setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = storage.getAccessToken();

      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        // The refresh interceptor on apiClient automatically handles
        // token refresh if getMe returns 401, so no manual refresh needed here.
        const user = await authApi.getMe(accessToken);
        setUser(user);
        setLoading(false);
      } catch {
        storage.clearTokens();
        logout();
      }
    };

    initAuth();
  }, [setUser, setLoading, logout]);

  return <AppRouter />;
}

function ThemeInitializer() {
  const theme = useUIStore((state) => state.theme);
  const language = useUIStore((state) => state.language);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const isRTL = language === 'ar' || language === 'ku';
    root.dir = isRTL ? 'rtl' : 'ltr';
    root.lang = language;
  }, [language]);

  return null;
}

export function App() {
  return (
    <AppProviders>
      <ThemeInitializer />
      <AppContent />
    </AppProviders>
  );
}
