export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type AdminUsersRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: "USER" | "ADMIN";
  isPremium: boolean;
  xpTotal: bigint;
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isPremium: true,
      xpTotal: true,
    },
  });

  return NextResponse.json(
    users.map((u: AdminUsersRow) => ({
      ...u,
      xpTotal: typeof u.xpTotal === "bigint" ? Number(u.xpTotal) : Number(u.xpTotal ?? 0),
    })),
  );
}
