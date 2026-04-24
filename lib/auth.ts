import { cookies } from "next/headers";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const ID_TOKEN_COOKIE = "id_token";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  // 7 days — adjust to match the token's expiry
  maxAge: 60 * 60 * 24 * 7,
};

export async function saveAccessToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, token, COOKIE_OPTIONS);
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function clearAccessToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
}

export async function saveIdToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ID_TOKEN_COOKIE, token, COOKIE_OPTIONS);
}

export async function getIdToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ID_TOKEN_COOKIE)?.value ?? null;
}

export async function clearIdToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ID_TOKEN_COOKIE);
}
