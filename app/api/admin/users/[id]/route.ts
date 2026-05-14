export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PatchBody = {
  role?: unknown;
  isPremium?: unknown;
};

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  // Next.js récent: `params` est un Promise dans les Route Handlers.
  const { id } = await ctx.params;
  if (!id) return badRequest("ID manquant");

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return badRequest("Body JSON invalide");
  }

  const data: { role?: "USER" | "ADMIN"; isPremium?: boolean } = {};

  if (typeof body.role === "string") {
    const role = body.role.toUpperCase();
    if (role !== "USER" && role !== "ADMIN") return badRequest("Rôle invalide");
    data.role = role as "USER" | "ADMIN";
  }
  if (typeof body.isPremium === "boolean") {
    data.isPremium = body.isPremium;
  }

  if (!Object.keys(data).length) {
    return badRequest("Aucun champ à modifier");
  }

  await prisma.user.update({
    where: { id },
    data,
  });

  return NextResponse.json({ ok: true });
}
