import { NextRequest, NextResponse } from "next/server";
import { saveAccessToken, saveIdToken } from "@/lib/auth";

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = Buffer.from(payload, "base64url").toString("utf-8");
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    code?: string;
    redirect_uri?: string;
    code_verifier?: string;
  };

  const { code, redirect_uri, code_verifier } = body;

  if (!code || !redirect_uri || !code_verifier) {
    return NextResponse.json(
      { error: "code, redirect_uri, and code_verifier are required" },
      { status: 400 },
    );
  }

  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", redirect_uri);
  params.append("code_verifier", code_verifier);

  const tokenResponse = await fetch(
    `${process.env.QURAN_OAUTH_URL}/oauth2/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.QURAN_CLIENT_ID ?? ""}:${process.env.QURAN_CLIENT_SECRET ?? ""}`,
        ).toString("base64")}`,
      },
      body: params.toString(),
    },
  );

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.json().catch(() => ({}));
    console.error("Token exchange failed:", errorData);
    return NextResponse.json(errorData, { status: tokenResponse.status });
  }

  const tokenData = (await tokenResponse.json()) as {
    access_token: string;
    id_token?: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
  };

  const { access_token, id_token, token_type, expires_in, refresh_token } =
    tokenData;

  await saveAccessToken(access_token);
  if (id_token) {
    await saveIdToken(id_token);
  }

  const user = id_token ? decodeJwtPayload(id_token) : null;

  return NextResponse.json({
    access_token,
    id_token,
    token_type,
    expires_in,
    refresh_token,
    user,
  });
}
