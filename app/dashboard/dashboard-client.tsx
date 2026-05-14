"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

function formatDateFR(d: Date) {
  const s = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getInitials(params: { name?: string | null; email?: string | null }) {
  const base = params.name?.trim() || params.email?.split("@")[0] || "U";
  const parts = base.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "U";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : (base[1] ?? "");
  return (first + last).toUpperCase();
}

type DashboardQuiz = {
  id: string;
  title: string;
  description?: string | null;
  xpReward: number;
  questionsCount: number;
};

function colorFromId(id: string) {
  // petit hash déterministe → couleur stable
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const palette = ["#7c3aed", "#0891b2", "#059669", "#dc2626", "#f59e0b", "#2563eb"] as const;
  return palette[h % palette.length];
}

export default function DashboardClient(props: {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: "USER" | "ADMIN";
    title: string | null;
    isPremium: boolean;
    xpTotal: number;
  };
}) {
  const { user } = props;
  const [isPremium, setIsPremium] = useState(user.isPremium);
  const [quizzes, setQuizzes] = useState<DashboardQuiz[] | null>(null);

  const todayLabel = useMemo(() => formatDateFR(new Date()), []);
  const initials = useMemo(() => getInitials({ name: user.name, email: user.email }), [user]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/quizzes");
        if (!res.ok) throw new Error("Chargement des quiz impossible");
        const data = (await res.json()) as DashboardQuiz[];
        if (!cancelled) setQuizzes(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setQuizzes([]);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <h2 className="sr-only">
        StudyPulse — tableau de bord étudiant avec profil, XP et quiz disponibles
      </h2>

      <div className={styles.dash}>
        <div className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle
                cx="9"
                cy="9"
                r="7"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M9 5.5v3.5l2 2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            StudyPulse
          </div>
          <div className={styles.topbarRight}>
            <span className={styles.dateLabel}>{todayLabel}</span>
            <div className={styles.topbarAvatar}>
              {user.image ? (
                <img
                  className={styles.avatarImg}
                  src={user.image}
                  alt=""
                  referrerPolicy="no-referrer"
                />
              ) : (
                initials
              )}
            </div>
          </div>
        </div>

        <div className={styles.body}>
          <aside className={styles.sidebar}>
            <Link className={`${styles.navItem} ${styles.active}`} href="/dashboard">
              <i className="ti ti-layout-dashboard" aria-hidden="true" />
              Tableau de bord
            </Link>
            <div className={styles.navItem}>
              <i className="ti ti-help-circle" aria-hidden="true" />
              Quiz
            </div>
            <div className={styles.navItem}>
              <i className="ti ti-cards" aria-hidden="true" />
              Mes fiches
            </div>
            <Link className={styles.navItem} href="/chat">
              <i className="ti ti-messages" aria-hidden="true" />
              Chat
            </Link>
            <Link className={styles.navItem} href="/leaderboard">
              <i className="ti ti-trophy" aria-hidden="true" />
              Classement
            </Link>
            <div className={styles.navItem}>
              <i className="ti ti-shield" aria-hidden="true" />
              Ma guilde
            </div>
            <div className={styles.navItem}>
              <i className="ti ti-clock" aria-hidden="true" />
              Pomodoro
            </div>

            <div className={styles.spacer} />

            <button
              type="button"
              className={styles.toggleRow}
              onClick={() => {
                if (user.role === "ADMIN") return; // admin = premium toujours actif
                setIsPremium((v) => !v);
              }}
            >
              <div className={`${styles.toggle} ${isPremium ? styles.on : ""}`} />
              <span>
                {isPremium
                  ? "Mode Premium actif ✦"
                  : user.role === "ADMIN"
                    ? "Mode Premium actif ✦"
                    : "Simuler mode Premium"}
              </span>
            </button>
          </aside>

          <main className={styles.main}>
            {/* Profil */}
            <div className={`${styles.profileCard} ${isPremium ? styles.premium : ""}`}>
              <div className={styles.avatarWrap}>
                <div className={`${styles.avatar} ${isPremium ? styles.premiumRing : ""}`}>
                  {user.image ? (
                    <img
                      className={styles.avatarImg}
                      src={user.image}
                      alt=""
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    initials
                  )}
                </div>
                {isPremium && <div className={styles.badgePlus}>✦ Plus</div>}
              </div>
              <div className={styles.profileInfo}>
                <div className={styles.profileName}>
                  {user.name ?? "Utilisateur"}
                  {user.title && <span className={styles.vipPill}>{user.title}</span>}
                  {isPremium && <span className={styles.vipPill}>✦ VIP</span>}
                </div>
                <div className={styles.profileEmail}>{user.email ?? ""}</div>
                <div className={styles.xpRow}>
                  <span className={styles.xpLabel}>XP</span>
                  <span className={styles.xpVal}>{new Intl.NumberFormat("fr-FR").format(user.xpTotal)}</span>
                  <div className={styles.xpBarWrap}>
                    <div
                      className={`${styles.xpBar} ${
                        isPremium ? styles.xpBarPremium : ""
                      }`}
                      style={{ width: "62%" }}
                    />
                  </div>
                  <span className={styles.xpLabel}>Niveau 12</span>
                </div>
              </div>
              <div>
                <div className={styles.rankN}>#23</div>
                <div className={styles.rankL}>classement</div>
                {user.role === "ADMIN" && (
                  <div style={{ marginTop: 10 }}>
                    <Link
                      href="/admin/panel"
                      className={styles.navItem}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        borderRadius: 12,
                        padding: "10px 12px",
                        border: "1px solid rgba(124,58,237,0.55)",
                        background: "rgba(124,58,237,0.22)",
                        fontWeight: 800,
                      }}
                    >
                      <i className="ti ti-shield-lock" aria-hidden="true" />
                      Panel de Contrôle
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Stats mini */}
            <div className={styles.statsRow}>
              <div className={styles.statMini}>
                <div className={styles.statN}>18</div>
                <div className={styles.statL}>Quiz complétés</div>
              </div>
              <div className={styles.statMini}>
                <div className={styles.statN}>142</div>
                <div className={styles.statL}>Fiches révisées</div>
              </div>
              <div className={styles.statMini}>
                <div className={styles.statN}>7 🔥</div>
                <div className={styles.statL}>Jours de streak</div>
              </div>
            </div>

            {/* Quiz grid */}
            <div>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Quiz disponibles</span>
                <span className={styles.sectionMeta}>
                  {quizzes === null
                    ? "Chargement..."
                    : `${quizzes.length} quiz`}
                </span>
              </div>

              <div className={styles.quizGrid}>
                {(quizzes ?? []).map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    className={styles.quizCard}
                    style={{ ["--qc" as never]: colorFromId(q.id) } as React.CSSProperties}
                    onClick={() => {
                      console.log(`Open quiz: ${q.id}`);
                    }}
                  >
                    <div className={styles.quizTag}>
                      <i className="ti ti-help-circle" aria-hidden="true" />
                      Quiz
                    </div>
                    <div className={styles.quizTitle}>{q.title}</div>
                    <div className={styles.quizMeta}>
                      <span className={styles.quizQCount}>
                        {q.questionsCount} question{q.questionsCount > 1 ? "s" : ""}
                      </span>
                      <span className={styles.xpBadge}>+{q.xpReward} XP</span>
                    </div>
                  </button>
                ))}

                {quizzes !== null && quizzes.length === 0 && (
                  <div style={{ opacity: 0.75, padding: 12 }}>
                    Aucun quiz publié pour le moment.
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
