"use client";

import { useEffect, useState } from "react";

interface UseAuthReturn {
  isAuthenticated: boolean | null;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = (): UseAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.status >= 500) {
          throw new Error(`Server error (${res.status})`);
        }
        return res.json();
      })
      .then((data: { authenticated: boolean }) => {
        setIsAuthenticated(data.authenticated);
      })
      .catch((err: Error) => {
        setError(err.message);
        setIsAuthenticated(false);
      });
  }, []);

  return {
    isAuthenticated,
    isLoading: isAuthenticated === null && error === null,
    error,
  };
};
