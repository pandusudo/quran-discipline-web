import { NextResponse } from "next/server";
import { getIdToken } from "@/lib/auth";

export async function GET() {
  const idToken = await getIdToken();
  return NextResponse.json({ id_token: idToken });
}
