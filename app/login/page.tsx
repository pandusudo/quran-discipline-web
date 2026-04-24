"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_QURAN_URL;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleOAuth = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/oauth`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch authorization URI (${response.status})`,
        );
      }

      const data = (await response.json()) as {
        authorizationUri?: string;
        pkce?: { state: string; nonce: string; codeVerifier: string };
      };

      if (!data.authorizationUri) {
        throw new Error("No authorizationUri returned from /api/oauth");
      }

      if (data.pkce?.codeVerifier) {
        sessionStorage.setItem("pkce_code_verifier", data.pkce.codeVerifier);
      }

      router.push(data.authorizationUri);
    } catch (err) {
      console.error("[LoginPage] OAuth error ->", err);
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-sm w-full space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Quran Discipline
          </h1>
          <p className="text-muted-foreground text-sm">
            Sign in to manage your blocked sites and Qur&apos;an reading.
          </p>
        </div>

        <button
          onClick={handleOAuth}
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {loading ? "Redirecting…" : "Continue with OAuth"}
        </button>
      </div>
    </main>
  );
}
