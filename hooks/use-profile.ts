"use client";

import { useEffect, useState } from "react";

export interface QFProfile {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrls: Record<string, string>;
  bio?: string;
  country?: string;
  verified: boolean;
  memberType: number;
  followersCount: number;
  postsCount: number;
  languageIsoCode: string;
}

interface UseProfileReturn {
  profile: QFProfile | null;
  isLoading: boolean;
  error: string | null;
}

export const useProfile = (
  isAuthenticated: boolean | null,
): UseProfileReturn => {
  const [profile, setProfile] = useState<QFProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_QURAN_URL ?? "";

    fetch("/api/auth/me")
      .then(
        (res) =>
          res.json() as Promise<{
            authenticated: boolean;
            token: string | null;
          }>,
      )
      .then(({ token }) => {
        if (!token) throw new Error("No access token available");
        return fetch(`${baseUrl}/api/qf-profile`, {
          headers: { "x-auth-token": token },
        });
      })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json() as Promise<QFProfile>;
      })
      .then((data) => setProfile(data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  return { profile, isLoading, error };
};
