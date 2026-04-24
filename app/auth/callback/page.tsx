"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      router.replace("/login");
      return;
    }

    const exchange = async () => {
      try {
        const redirectUri = `${window.location.origin}/auth/callback`;
        const codeVerifier = sessionStorage.getItem("pkce_code_verifier");

        if (!codeVerifier) {
          setError("Missing PKCE code verifier. Please try signing in again.");
          return;
        }

        const url = `${process.env.NEXT_PUBLIC_BACKEND_QURAN_URL}/api/token-exchange`;

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            code,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier,
          }),
        });

        if (!response.ok) {
          setError(`Token exchange failed (${response.status}).`);
          return;
        }

        const data = (await response.json()) as {
          access_token?: string;
          id_token?: string;
        };

        if (!data.access_token) {
          setError("No access token returned from server.");
          return;
        }

        await fetch("/api/auth/set-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: data.access_token,
            id_token: data.id_token,
          }),
        });

        sessionStorage.removeItem("pkce_code_verifier");

        router.replace("/dashboard");
      } catch (err) {
        console.error("[AuthCallback] error ->", err);
        setError("An unexpected error occurred during authentication.");
      }
    };

    exchange();
  }, [router, searchParams]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-destructive text-2xl font-semibold">
            Authentication Failed
          </div>
          <p className="text-muted-foreground text-sm">{error}</p>
          <a href="/login" className="text-primary underline text-sm">
            Back to login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-muted-foreground text-sm">Completing sign in…</div>
    </main>
  );
}
