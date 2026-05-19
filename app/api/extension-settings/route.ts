import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedToken } from "@/lib/auth";
import { resolveUserFromToken } from "@/lib/user";
import prisma from "@/lib/prisma";

export interface DbExtensionSettings {
  showTranslation: boolean;
  showTransliteration: boolean;
  blockingEnabled: boolean;
  lastModified: string;
}

function toClientSettings(row: {
  showTranslation: boolean;
  showTransliteration: boolean;
  blockingEnabled: boolean;
  lastModified: Date;
}): DbExtensionSettings {
  return {
    showTranslation: row.showTranslation,
    showTransliteration: row.showTransliteration,
    blockingEnabled: row.blockingEnabled,
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

  const row = await prisma.extensionSettings.findUnique({
    where: { userId: resolved.id },
  });

  if (!row) {
    return NextResponse.json(null);
  }

  return NextResponse.json(toClientSettings(row));
}

export async function PUT(req: NextRequest) {
  const token = await getAuthenticatedToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolved = await resolveUserFromToken(token);
  if (!resolved) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const body = (await req.json()) as Partial<DbExtensionSettings>;

  const row = await prisma.extensionSettings.upsert({
    where: { userId: resolved.id },
    update: {
      ...(body.showTranslation !== undefined && {
        showTranslation: body.showTranslation,
      }),
      ...(body.showTransliteration !== undefined && {
        showTransliteration: body.showTransliteration,
      }),
      ...(body.blockingEnabled !== undefined && {
        blockingEnabled: body.blockingEnabled,
      }),
      lastModified: body.lastModified
        ? new Date(body.lastModified)
        : new Date(),
    },
    create: {
      userId: resolved.id,
      showTranslation: body.showTranslation ?? true,
      showTransliteration: body.showTransliteration ?? false,
      blockingEnabled: body.blockingEnabled ?? true,
      lastModified: body.lastModified
        ? new Date(body.lastModified)
        : new Date(),
    },
  });

  return NextResponse.json(toClientSettings(row));
}
