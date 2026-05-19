import { NextResponse } from "next/server";
import { getAuthenticatedToken } from "@/lib/auth";

export async function GET() {
  try {
    const token = await getAuthenticatedToken();
    return NextResponse.json({ authenticated: !!token, token: token ?? null });
  } catch {
    return NextResponse.json(
      { authenticated: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
