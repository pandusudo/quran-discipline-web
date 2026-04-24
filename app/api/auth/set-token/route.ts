import { NextRequest, NextResponse } from "next/server";
import { saveAccessToken, saveIdToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { access_token, id_token } = (await request.json()) as {
    access_token?: string;
    id_token?: string;
  };

  if (!access_token) {
    return NextResponse.json(
      { error: "Missing access_token" },
      { status: 400 },
    );
  }

  await saveAccessToken(access_token);

  if (id_token) {
    await saveIdToken(id_token);
  }

  return NextResponse.json({ ok: true });
}
