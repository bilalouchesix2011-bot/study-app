"use client";

import { useEffect, useMemo, useState } from "react";

type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: "USER" | "ADMIN";
  isPremium: boolean;
  xpTotal: number;
};

export default function UsersAdminClient() {
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [filter, setFilter] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    const res = await fetch("/api/admin/users");
    const data = await res.json().catch(() => []);
    if (!res.ok) throw new Error(data?.error ?? "Impossible de charger les utilisateurs");
    setUsers(Array.isArray(data) ? (data as UserRow[]) : []);
  }

  useEffect(() => {
    refresh().catch((e: unknown) => {
      setError(e instanceof Error ? e.message : String(e));
      setUsers([]);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return users ?? [];
    return (users ?? []).filter((u) => {
      const name = (u.name ?? "").toLowerCase();
      const email = (u.email ?? "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [users, filter]);

  async function patchUser(id: string, patch: Partial<Pick<UserRow, "role" | "isPremium">>) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Mise à jour impossible");
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Utilisateurs</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Rechercher (nom/email)"
            style={inputStyle}
          />
          <button type="button" onClick={() => refresh()} style={btnGhost}>
            Rafraîchir
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 12, background: "rgba(239,68,68,0.15)" }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 12, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
          <thead>
            <tr style={{ textAlign: "left", opacity: 0.85 }}>
              <th style={thStyle}>Nom</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Rôle</th>
              <th style={thStyle}>Premium</th>
              <th style={thStyle}>XP</th>
            </tr>
          </thead>
          <tbody>
            {(users === null ? [] : filtered).map((u) => (
              <tr key={u.id} style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }}>
                <td style={tdStyle}>{u.name ?? "—"}</td>
                <td style={tdStyle}>{u.email ?? "—"}</td>
                <td style={tdStyle}>
                  <select
                    value={u.role}
                    onChange={(e) => patchUser(u.id, { role: e.target.value as UserRow["role"] })}
                    disabled={busyId === u.id}
                    style={selectStyle}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td style={tdStyle}>
                  <input
                    type="checkbox"
                    checked={u.isPremium}
                    onChange={(e) => patchUser(u.id, { isPremium: e.target.checked })}
                    disabled={busyId === u.id}
                    aria-label="Premium"
                  />
                </td>
                <td style={tdStyle}>{new Intl.NumberFormat("fr-FR").format(u.xpTotal)}</td>
              </tr>
            ))}

            {users !== null && filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ ...tdStyle, padding: 16, opacity: 0.75 }}>
                  Aucun utilisateur.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {users === null && <div style={{ marginTop: 12, opacity: 0.8 }}>Chargement...</div>}
    </section>
  );
}

const inputStyle: React.CSSProperties = {
  width: 280,
  maxWidth: "100%",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(0,0,0,0.25)",
  color: "inherit",
  padding: "10px 12px",
  outline: "none",
};

const selectStyle: React.CSSProperties = {
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(0,0,0,0.25)",
  color: "inherit",
  padding: "8px 10px",
};

const btnGhost: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  padding: "8px 12px",
  fontWeight: 700,
};

const thStyle: React.CSSProperties = {
  padding: "10px 10px",
  fontWeight: 800,
};

const tdStyle: React.CSSProperties = {
  padding: "10px 10px",
  verticalAlign: "middle",
};
