import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth";

export async function GET() {
  try {
    const token = await getAccessToken();
    return NextResponse.json({ authenticated: !!token, token: token ?? null });
  } catch {
    return NextResponse.json(
      { authenticated: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
