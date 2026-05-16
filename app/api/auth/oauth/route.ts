import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";

const base64url = (buf: Buffer): string =>
  buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const generatePkcePair = () => {
  const codeVerifier = base64url(crypto.randomBytes(32));
  const hash = crypto.createHash("sha256").update(codeVerifier).digest();
  const codeChallenge = base64url(hash);
  return { codeVerifier, codeChallenge };
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const nonce = searchParams.get("nonce") ?? undefined;

  const { codeVerifier, codeChallenge } = generatePkcePair();
  const state = crypto.randomBytes(32).toString("hex");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.QURAN_CLIENT_ID ?? "",
    redirect_uri:
      process.env.REDIRECT_URI ?? "http://localhost:3000/auth/callback",
    scope:
      process.env.SCOPES ?? "openid offline_access bookmark collection user",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    ...(nonce ? { nonce } : {}),
  });

  const authorizationUri = `${process.env.QURAN_OAUTH_URL}/oauth2/auth?${params.toString()}`;

  return NextResponse.json({
    authorizationUri,
    pkce: { state, nonce, codeVerifier },
  });
}
