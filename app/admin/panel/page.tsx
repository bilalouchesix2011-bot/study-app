import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import UsersAdminClient from "./users-admin-client";

export default async function AdminPanelPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Panel de Contrôle</h1>
          <p style={{ opacity: 0.8, margin: 0 }}>Gestion des utilisateurs + accès rapide aux actions admin.</p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link
            href="/admin/quiz"
            style={{
              borderRadius: 12,
              padding: "10px 14px",
              border: "1px solid rgba(124,58,237,0.55)",
              background: "rgba(124,58,237,0.22)",
              fontWeight: 800,
            }}
          >
            + Créer un quiz
          </Link>
          <Link
            href="/dashboard"
            style={{
              borderRadius: 12,
              padding: "10px 14px",
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.06)",
              fontWeight: 700,
            }}
          >
            Retour dashboard
          </Link>
        </div>
      </div>

      <hr style={{ margin: "18px 0", opacity: 0.2 }} />

      <UsersAdminClient />
    </main>
  );
}

