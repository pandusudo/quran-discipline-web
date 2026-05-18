import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "extension_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function GET() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const extensionId = cookieStore.get(COOKIE_NAME)?.value ?? "";

  return NextResponse.json({ extensionId });
}

export async function PUT(req: NextRequest) {
  const body = (await req.json()) as { extensionId?: string };
  const extensionId = (body.extensionId ?? "").trim();

  const response = NextResponse.json({ extensionId });

  if (extensionId) {
    response.cookies.set(COOKIE_NAME, extensionId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
  } else {
    response.cookies.delete(COOKIE_NAME);
  }

  return response;
}
