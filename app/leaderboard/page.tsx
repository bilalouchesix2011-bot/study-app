import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "bilalouchesix2025@gmail.com";

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/");

  const admin = await prisma.user.findFirst({
    where: { email: ADMIN_EMAIL },
    select: { id: true, name: true, email: true, xpTotal: true, role: true, isPremium: true },
  });

  const top = await prisma.user.findMany({
    where: admin ? { id: { not: admin.id } } : undefined,
    orderBy: { xpTotal: "desc" },
    take: 50,
    select: { id: true, name: true, email: true, xpTotal: true, role: true, isPremium: true },
  });

  const rows = admin ? [admin, ...top] : top;

  return (
    <main style={{ maxWidth: 920, margin: "0 auto", padding: "32px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Classement</h1>
          <p style={{ opacity: 0.8, margin: 0 }}>Les meilleurs scores XP (admin épinglé en haut).</p>
        </div>
        <Link
          href="/dashboard"
          style={{
            borderRadius: 12,
            padding: "10px 14px",
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.06)",
            fontWeight: 700,
            height: "fit-content",
          }}
        >
          Retour dashboard
        </Link>
      </div>

      <div style={{ marginTop: 18, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, overflow: "hidden" }}>
        {rows.map((u, idx) => {
          const isAdminPinned = Boolean(admin) && idx === 0;
          const xp = typeof u.xpTotal === "bigint" ? Number(u.xpTotal) : Number(u.xpTotal ?? 0);
          return (
            <div
              key={u.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                padding: "12px 14px",
                borderTop: idx === 0 ? "none" : "1px solid rgba(255,255,255,0.08)",
                background: isAdminPinned ? "rgba(124,58,237,0.14)" : "transparent",
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 34, fontWeight: 900, opacity: 0.9 }}>#{idx + 1}</div>
                <div style={{ display: "grid" }}>
                  <div style={{ fontWeight: 800, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <span>{u.name ?? u.email ?? "Utilisateur"}</span>
                    {isAdminPinned && (
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 900,
                          padding: "3px 10px",
                          borderRadius: 999,
                          border: "1px solid rgba(124,58,237,0.5)",
                          background: "rgba(124,58,237,0.18)",
                        }}
                      >
                        Admin • Fondateur
                      </span>
                    )}
                  </div>
                  <div style={{ opacity: 0.7, fontSize: 13 }}>{u.email ?? ""}</div>
                </div>
              </div>
              <div style={{ fontWeight: 900, whiteSpace: "nowrap" }}>
                {new Intl.NumberFormat("fr-FR").format(xp)} XP
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

