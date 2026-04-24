"use client";

import { useEffect, useState } from "react";

interface UseAuthReturn {
  isAuthenticated: boolean | null;
  isLoading: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data: { authenticated: boolean }) =>
        setIsAuthenticated(data.authenticated),
      )
      .catch(() => setIsAuthenticated(false));
  }, []);

  return {
    isAuthenticated,
    isLoading: isAuthenticated === null,
  };
};
