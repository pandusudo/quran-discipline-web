import { cookies } from "next/headers";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const ID_TOKEN_COOKIE = "id_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

const TOKEN_EXPIRY_BUFFER_SECONDS = 30;

const BASE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

// Refresh tokens are long-lived; store for 30 days
const REFRESH_COOKIE_OPTIONS = {
  ...BASE_COOKIE_OPTIONS,
  maxAge: 60 * 60 * 24 * 30,
};

function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split(".")[1];
    if (!payload) return true;
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { exp?: number };
    if (!decoded.exp) return false; // no exp claim — assume valid
    return Date.now() / 1000 >= decoded.exp - TOKEN_EXPIRY_BUFFER_SECONDS;
  } catch {
    return true;
  }
}

export async function saveAccessToken(
  token: string,
  expiresIn?: number,
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, token, {
    ...BASE_COOKIE_OPTIONS,
    maxAge: expiresIn ?? 60 * 60,
  });
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getAuthenticatedToken(): Promise<string | null> {
  const token = await getAccessToken();

  if (!token || isTokenExpired(token)) {
    return refreshAccessToken();
  }
  return token;
}

export async function clearAccessToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
}

export async function saveIdToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ID_TOKEN_COOKIE, token, {
    ...BASE_COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getIdToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ID_TOKEN_COOKIE)?.value ?? null;
}

export async function clearIdToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ID_TOKEN_COOKIE);
}

export async function saveRefreshToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(REFRESH_TOKEN_COOKIE, token, REFRESH_COOKIE_OPTIONS);
}

export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}

export async function clearRefreshToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  const clientId = process.env.QURAN_CLIENT_ID ?? "";
  const clientSecret = process.env.QURAN_CLIENT_SECRET ?? "";

  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);

  try {
    const res = await fetch(`${process.env.QURAN_OAUTH_URL}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: params.toString(),
    });

    if (!res.ok) {
      await clearAccessToken();
      await clearRefreshToken();
      return null;
    }

    const data = (await res.json()) as {
      access_token: string;
      expires_in?: number;
      refresh_token?: string;
    };

    await saveAccessToken(data.access_token, data.expires_in);
    if (data.refresh_token) {
      await saveRefreshToken(data.refresh_token);
    }

    return data.access_token;
  } catch {
    return null;
  }
}
