"use client";

import { useEffect, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import styles from "./page.module.css";

type Star = {
  left: string;
  top: string;
  sizePx: number;
  lo: number;
  hi: number;
  dSeconds: number;
  delaySeconds: number;
};

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count > 1 ? plural : singular;
}

export default function LoginClient(props: { userCount: number }) {
  const { userCount } = props;
  const [stars, setStars] = useState<Star[]>([]);
  const [loading, setLoading] = useState(false);

  const nf = useMemo(() => new Intl.NumberFormat("fr-FR"), []);

  const studentLabel = `${nf.format(userCount)} ${pluralize(
    userCount,
    "étudiant",
    "étudiants"
  )}`;

  const socialStrong = useMemo(() => {
    if (userCount >= 3) {
      const others = Math.max(userCount - 2, 0);
      return `Alice, Thomas et ${nf.format(others)} ${pluralize(others, "autre")}`;
    }
    if (userCount === 2) return "Alice et Thomas";
    return studentLabel;
  }, [nf, studentLabel, userCount]);

  const socialVerb = userCount === 1 ? "a" : "ont";

  useEffect(() => {
    const next: Star[] = [];
    for (let i = 0; i < 80; i++) {
      next.push({
        sizePx: Math.random() * 2 + 0.5,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        lo: Number((Math.random() * 0.3).toFixed(2)),
        hi: Number((0.5 + Math.random() * 0.5).toFixed(2)),
        dSeconds: Number((2 + Math.random() * 4).toFixed(1)),
        delaySeconds: Number((Math.random() * 4).toFixed(1)),
      });
    }
    setStars(next);
  }, []);

  async function handleGoogleSignIn() {
    if (loading) return;
    setLoading(true);
    try {
      // Ouvre le flow Google (NextAuth).
      await signIn("google", { callbackUrl: "/dashboard" });
    } finally {
      // Si NextAuth redirige, ce code ne sera généralement pas exécuté.
      setLoading(false);
    }
  }

  return (
    <>
      <h2 className="sr-only">
        StudyPulse — page de connexion avec authentification Google
      </h2>

      <div className={styles.page}>
        <div className={styles.left}>
          <div className={styles.stars} aria-hidden="true">
            {stars.map((s, idx) => (
              <div
                key={idx}
                className={styles.star}
                style={
                  {
                    width: `${s.sizePx}px`,
                    height: `${s.sizePx}px`,
                    left: s.left,
                    top: s.top,
                    // Variables CSS utilisées par l'animation twinkle.
                    ["--lo" as never]: s.lo,
                    ["--hi" as never]: s.hi,
                    ["--d" as never]: `${s.dSeconds}s`,
                    animationDelay: `${s.delaySeconds}s`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>

          <div
            className={styles.orb}
            style={{
              width: 300,
              height: 300,
              top: -80,
              right: -100,
              background: "#7c3aed",
            }}
            aria-hidden="true"
          />
          <div
            className={styles.orb}
            style={{
              width: 200,
              height: 200,
              bottom: 40,
              left: -60,
              background: "#2563eb",
            }}
            aria-hidden="true"
          />

          <div className={styles.leftContent}>
            <div className={styles.tagline}>
              Apprends plus vite,
              <br />
              <em>joue plus grand.</em>
            </div>
            <p className={styles.sub}>
              Flashcards intelligentes, quiz gamifiés, guildes d'étude. Ton cerveau
              mérite mieux que de surligner.
            </p>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.logoRow}>
            <div className={styles.logoIcon} aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  stroke="#a78bfa"
                  strokeWidth="1.5"
                />
                <path
                  d="M10 6v4l2.5 2.5"
                  stroke="#a78bfa"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className={styles.logoName}>StudyPulse</span>
          </div>

          <p className={styles.formTitle}>Bienvenue</p>
          <p className={styles.formSub}>
            Connecte-toi pour accéder à ton espace d'apprentissage
          </p>

          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <div className={styles.statN}>{nf.format(userCount)}</div>
              <div className={styles.statL}>
                {pluralize(userCount, "Étudiant", "Étudiants")}
              </div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statN}>4.8★</div>
              <div className={styles.statL}>Note</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statN}>Zero</div>
              <div className={styles.statL}>Pay-to-win</div>
            </div>
          </div>

          <button
            className={styles.googleBtn}
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className={styles.loader} aria-hidden="true" />
                <span>Connexion en cours…</span>
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path
                    d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                    fill="#4285F4"
                  />
                  <path
                    d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                    fill="#34A853"
                  />
                  <path
                    d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continuer avec Google</span>
              </>
            )}
          </button>

          <div className={styles.socialProof}>
            <div className={styles.avatars} aria-hidden="true">
              <div
                className={styles.av}
                style={{ background: "#ddd6fe", color: "#5b21b6" }}
              >
                AL
              </div>
              <div
                className={styles.av}
                style={{ background: "#bbf7d0", color: "#065f46" }}
              >
                TM
              </div>
              <div
                className={styles.av}
                style={{ background: "#fde68a", color: "#92400e" }}
              >
                JR
              </div>
              <div
                className={styles.av}
                style={{ background: "#fecaca", color: "#991b1b" }}
              >
                SC
              </div>
            </div>
            <p className={styles.proofText}>
              <strong>{socialStrong}</strong>
              <br />
              {socialVerb} déjà rejoint StudyPulse ce mois-ci
            </p>
          </div>

          <p className={styles.terms}>
            En continuant, tu acceptes nos <a href="#">Conditions d'utilisation</a>{" "}
            et notre <a href="#">Politique de confidentialité</a>
          </p>
        </div>
      </div>
    </>
  );
}

