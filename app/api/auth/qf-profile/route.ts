import { NextResponse } from "next/server";
import { getAuthenticatedToken } from "@/lib/auth";

interface JwtPayload {
  exp: number;
  sub?: string;
}

function decodeTokenPayload(token: string): JwtPayload | null {
  try {
    return JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString("utf-8"),
    ) as JwtPayload;
  } catch {
    return null;
  }
}

export async function GET() {
  const token = await getAuthenticatedToken();

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = decodeTokenPayload(token);
  const ttl = payload
    ? Math.max(0, Math.floor(payload.exp - Date.now() / 1000))
    : 0;
  const sub = payload?.sub ?? "anonymous";

  const baseUrl = `${process.env.QURAN_API_URL}/quran-reflect/v1/users/profile`;
  const url = `${baseUrl}?_uid=${encodeURIComponent(sub)}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "x-auth-token": token,
      "x-client-id": process.env.QURAN_CLIENT_ID ?? "",
    },
    next: { revalidate: ttl },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return NextResponse.json(errorData, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}
