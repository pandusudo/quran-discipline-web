import { NextResponse } from "next/server";
import { clearAccessToken, clearIdToken } from "@/lib/auth";

export async function POST() {
  await clearAccessToken();
  await clearIdToken();
  return NextResponse.json({ ok: true });
}
