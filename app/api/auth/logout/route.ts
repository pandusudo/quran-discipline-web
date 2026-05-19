import { NextResponse } from "next/server";
import {
  clearAccessToken,
  clearIdToken,
  clearRefreshToken,
  getIdToken,
} from "@/lib/auth";

export async function GET() {
  const idToken = (await getIdToken()) ?? "";

  await clearAccessToken();
  await clearIdToken();
  await clearRefreshToken();

  const params = new URLSearchParams({
    post_logout_redirect_uri:
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    id_token_hint: idToken,
  });

  const logoutUrl = `${process.env.QURAN_OAUTH_URL}/oauth2/sessions/logout?${params.toString()}`;

  return NextResponse.json({ logoutUrl });
}
