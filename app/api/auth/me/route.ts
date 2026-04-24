import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth";

export async function GET() {
  const token = await getAccessToken();
  return NextResponse.json({ authenticated: !!token, token: token ?? null });
}
