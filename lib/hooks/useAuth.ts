import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

export function useAuth() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    setIsAuthenticated(!!storedToken);
  }, []);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const currentToken = token || localStorage.getItem('token');
    if (!currentToken) return {};
    return { Authorization: `Bearer ${currentToken}` };
  }, [token]);

  const handleAuthError = useCallback((status: number) => {
    if (status === 401) {
      localStorage.removeItem('token');
      setToken(null);
      setIsAuthenticated(false);
      router.push('/auth/login');
      return true;
    }
    return false;
  }, [router]);

  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    const authHeaders = getAuthHeaders();
    const headers: HeadersInit = {
      ...authHeaders,
      ...(options.headers as Record<string, string> || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (handleAuthError(response.status)) {
      throw new Error('Unauthorized');
    }

    return response;
  }, [getAuthHeaders, handleAuthError]);

  const logout = useCallback(async () => {
    const currentToken = token || localStorage.getItem('token');
    if (currentToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${currentToken}` },
        });
      } catch (err) {
        // Ignore errors
      }
    }
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
    router.push('/');
  }, [token, router]);

  return {
    token,
    isAuthenticated,
    getAuthHeaders,
    fetchWithAuth,
    handleAuthError,
    logout,
  };
}

