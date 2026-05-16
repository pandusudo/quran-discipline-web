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

    fetch("/api/auth/qf-profile")
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
