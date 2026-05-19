import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedToken } from "@/lib/auth";
import type { BlockedSite } from "@/hooks/use-blocked-sites";
import prisma from "@/lib/prisma";
import { resolveUserFromToken } from "@/lib/user";

function toClientSite(row: {
  id: string;
  domain: string;
  category: string;
  enabled: boolean;
  addedAt: Date;
  blockedCount: number;
  blockMode: string;
  timerSeconds: number;
  unlockDurationMinutes: number;
  lastModified: Date;
}): BlockedSite {
  return {
    id: row.id,
    domain: row.domain,
    category: row.category,
    enabled: row.enabled,
    addedAt: row.addedAt.toISOString(),
    blockedCount: row.blockedCount,
    blockMode: row.blockMode as BlockedSite["blockMode"],
    timerSeconds: row.timerSeconds,
    unlockDurationMinutes: row.unlockDurationMinutes,
    lastModified: row.lastModified.toISOString(),
  };
}

export async function GET() {
  const token = await getAuthenticatedToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolved = await resolveUserFromToken(token);
  if (!resolved) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  const { id: userId } = resolved;

  const rows = await prisma.blockedSite.findMany({ where: { userId } });
  return NextResponse.json(rows.map(toClientSite));
}

export async function POST(req: NextRequest) {
  const token = await getAuthenticatedToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolved = await resolveUserFromToken(token);
  if (!resolved) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  const { id: userId } = resolved;

  const body = (await req.json()) as BlockedSite | BlockedSite[];
  const sites = Array.isArray(body) ? body : [body];

  const upserted = await Promise.all(
    sites.map((site) =>
      prisma.blockedSite.upsert({
        where: { id: site.id },
        update: {
          domain: site.domain,
          category: site.category,
          enabled: site.enabled,
          blockedCount: site.blockedCount,
          blockMode: site.blockMode,
          timerSeconds: site.timerSeconds,
          unlockDurationMinutes: site.unlockDurationMinutes,
          lastModified: site.lastModified
            ? new Date(site.lastModified)
            : new Date(),
        },
        create: {
          id: site.id,
          userId,
          domain: site.domain,
          category: site.category,
          enabled: site.enabled,
          addedAt: site.addedAt ? new Date(site.addedAt) : new Date(),
          blockedCount: site.blockedCount,
          blockMode: site.blockMode,
          timerSeconds: site.timerSeconds,
          unlockDurationMinutes: site.unlockDurationMinutes,
          lastModified: site.lastModified
            ? new Date(site.lastModified)
            : new Date(),
        },
      }),
    ),
  );

  return NextResponse.json(upserted.map(toClientSite));
}

export async function DELETE(req: NextRequest) {
  const token = await getAuthenticatedToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolved = await resolveUserFromToken(token);
  if (!resolved) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  const { id: userId } = resolved;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await prisma.blockedSite.deleteMany({ where: { id, userId } });
  return NextResponse.json({ ok: true });
}
