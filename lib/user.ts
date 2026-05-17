import prisma from "@/lib/prisma";

interface JwtPayload {
  sub?: string;
  email?: string;
  [key: string]: unknown;
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    return JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString("utf-8"),
    ) as JwtPayload;
  } catch {
    return null;
  }
}

export interface ResolvedUser {
  id: string;
  externalId: string;
  email: string | null;
  isNewUser: boolean;
}

export async function resolveUser(
  externalId: string,
  email?: string | null,
): Promise<ResolvedUser> {
  const existing = await prisma.user.findUnique({
    where: { externalId },
    select: { id: true, email: true },
  });

  if (existing) {
    // Update email if it changed or was previously missing
    if (email && existing.email !== email) {
      await prisma.user.update({
        where: { externalId },
        data: { email },
      });
    }
    return {
      id: existing.id,
      externalId,
      email: email ?? existing.email,
      isNewUser: false,
    };
  }

  const created = await prisma.user.create({
    data: { externalId, email: email ?? null },
    select: { id: true },
  });

  return { id: created.id, externalId, email: email ?? null, isNewUser: true };
}

export async function resolveUserFromToken(
  token: string,
): Promise<ResolvedUser | null> {
  const payload = decodeJwtPayload(token);
  if (!payload?.sub) return null;
  return resolveUser(payload.sub, payload.email ?? null);
}
