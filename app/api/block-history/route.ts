import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth";
import { resolveUserFromToken } from "@/lib/user";
import prisma from "@/lib/prisma";
import type { BlockHistoryEntry } from "@/lib/extension-bridge";

export async function GET() {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolved = await resolveUserFromToken(token);
  if (!resolved) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const rows = await prisma.blockHistory.findMany({
    where: { userId: resolved.id },
    orderBy: { timestamp: "desc" },
  });

  const entries: BlockHistoryEntry[] = rows.map((r) => ({
    id: r.id,
    domain: r.domain,
    url: r.url,
    timestamp: r.timestamp.toISOString(),
    context: r.context as BlockHistoryEntry["context"],
  }));

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolved = await resolveUserFromToken(token);
  if (!resolved) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const body = (await req.json()) as BlockHistoryEntry[];
  if (!Array.isArray(body) || body.length === 0) {
    return NextResponse.json({ inserted: 0 });
  }

  const existingIds = new Set(
    (
      await prisma.blockHistory.findMany({
        where: { id: { in: body.map((e) => e.id) } },
        select: { id: true },
      })
    ).map((r) => r.id),
  );

  const toInsert = body.filter((e) => !existingIds.has(e.id));

  if (toInsert.length > 0) {
    await prisma.blockHistory.createMany({
      data: toInsert.map((e) => ({
        id: e.id,
        userId: resolved.id,
        domain: e.domain,
        url: e.url,
        timestamp: new Date(e.timestamp),
        context: e.context,
      })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json({ inserted: toInsert.length });
}

export async function DELETE() {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolved = await resolveUserFromToken(token);
  if (!resolved) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  await prisma.blockHistory.deleteMany({ where: { userId: resolved.id } });
  return NextResponse.json({ ok: true });
}
