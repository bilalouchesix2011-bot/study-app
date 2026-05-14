"use client";

import { useMemo, useState } from "react";

type AnswerDraft = { text: string; isCorrect: boolean };
type QuestionDraft = { prompt: string; answers: AnswerDraft[] };

function emptyQuestion(): QuestionDraft {
  return {
    prompt: "",
    answers: [
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
    ],
  };
}

export default function QuizForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [xpReward, setXpReward] = useState<number>(10);
  const [questions, setQuestions] = useState<QuestionDraft[]>([emptyQuestion()]);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!title.trim()) return false;
    if (!Number.isFinite(xpReward) || xpReward < 0) return false;
    if (questions.length === 0) return false;
    return questions.every((q) => {
      const hasPrompt = Boolean(q.prompt.trim());
      const hasAtLeast2 = q.answers.length >= 2;
      const allFilled = q.answers.every((a) => Boolean(a.text.trim()));
      const hasCorrect = q.answers.some((a) => a.isCorrect);
      return hasPrompt && hasAtLeast2 && allFilled && hasCorrect;
    });
  }, [title, xpReward, questions]);

  async function onSubmit() {
    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          xpReward,
          questions,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error ?? "Erreur inconnue");
        return;
      }

      setMessage("Quiz créé avec succès.");
      setTitle("");
      setDescription("");
      setXpReward(10);
      setQuestions([emptyQuestion()]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 16,
        padding: 16,
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <div style={{ display: "grid", gap: 10 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 600 }}>Titre</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Les fractions"
            style={inputStyle}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 600 }}>Description (optionnel)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contexte, chapitre, niveau..."
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6, maxWidth: 220 }}>
          <span style={{ fontWeight: 600 }}>XP gagnés</span>
          <input
            type="number"
            min={0}
            value={xpReward}
            onChange={(e) => setXpReward(Number(e.target.value))}
            style={inputStyle}
          />
        </label>
      </div>

      <hr style={{ margin: "18px 0", opacity: 0.2 }} />

      <div style={{ display: "grid", gap: 14 }}>
        {questions.map((q, qi) => (
          <div
            key={qi}
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 14,
              padding: 14,
              background: "rgba(0,0,0,0.12)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontWeight: 700 }}>Question {qi + 1}</div>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setQuestions((prev) => prev.filter((_, idx) => idx !== qi))
                  }
                  style={btnDanger}
                >
                  Supprimer
                </button>
              )}
            </div>

            <label style={{ display: "grid", gap: 6, marginTop: 10 }}>
              <span style={{ fontWeight: 600 }}>Énoncé</span>
              <input
                value={q.prompt}
                onChange={(e) =>
                  setQuestions((prev) =>
                    prev.map((qq, idx) => (idx === qi ? { ...qq, prompt: e.target.value } : qq)),
                  )
                }
                placeholder="Ex: Quelle est la valeur de 3/4 + 1/4 ?"
                style={inputStyle}
              />
            </label>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              <div style={{ fontWeight: 600, opacity: 0.9 }}>
                Réponses (coche la bonne)
              </div>

              {q.answers.map((a, ai) => (
                <div
                  key={ai}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "24px 1fr auto",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <input
                    type="radio"
                    name={`correct-${qi}`}
                    checked={a.isCorrect}
                    onChange={() =>
                      setQuestions((prev) =>
                        prev.map((qq, qIdx) => {
                          if (qIdx !== qi) return qq;
                          return {
                            ...qq,
                            answers: qq.answers.map((aa, aIdx) => ({
                              ...aa,
                              isCorrect: aIdx === ai,
                            })),
                          };
                        }),
                      )
                    }
                    aria-label="Réponse correcte"
                  />

                  <input
                    value={a.text}
                    onChange={(e) =>
                      setQuestions((prev) =>
                        prev.map((qq, qIdx) => {
                          if (qIdx !== qi) return qq;
                          return {
                            ...qq,
                            answers: qq.answers.map((aa, aIdx) =>
                              aIdx === ai ? { ...aa, text: e.target.value } : aa,
                            ),
                          };
                        }),
                      )
                    }
                    placeholder={`Réponse ${ai + 1}`}
                    style={inputStyle}
                  />

                  {q.answers.length > 2 && (
                    <button
                      type="button"
                      onClick={() =>
                        setQuestions((prev) =>
                          prev.map((qq, qIdx) => {
                            if (qIdx !== qi) return qq;
                            const next = qq.answers.filter((_, aIdx) => aIdx !== ai);
                            // si on supprime la correcte, on repasse la 1ère en correcte
                            const hasCorrect = next.some((x) => x.isCorrect);
                            const fixed = hasCorrect
                              ? next
                              : next.map((x, idx) => ({ ...x, isCorrect: idx === 0 }));
                            return { ...qq, answers: fixed };
                          }),
                        )
                      }
                      style={btnGhost}
                    >
                      Retirer
                    </button>
                  )}
                </div>
              ))}

              <div>
                <button
                  type="button"
                  onClick={() =>
                    setQuestions((prev) =>
                      prev.map((qq, qIdx) =>
                        qIdx === qi
                          ? { ...qq, answers: [...qq.answers, { text: "", isCorrect: false }] }
                          : qq,
                      ),
                    )
                  }
                  style={btnGhost}
                >
                  + Ajouter une réponse
                </button>
              </div>
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}
            style={btnGhost}
          >
            + Ajouter une question
          </button>

          <button
            type="button"
            disabled={!canSubmit || submitting}
            onClick={onSubmit}
            style={{
              ...btnPrimary,
              opacity: !canSubmit || submitting ? 0.55 : 1,
              cursor: !canSubmit || submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Publication..." : "Publier le quiz"}
          </button>
        </div>

        {message && (
          <div style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(34,197,94,0.15)" }}>
            {message}
          </div>
        )}
        {error && (
          <div style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(239,68,68,0.15)" }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(0,0,0,0.25)",
  color: "inherit",
  padding: "10px 12px",
  outline: "none",
};

const btnPrimary: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid rgba(124,58,237,0.5)",
  background: "rgba(124,58,237,0.25)",
  padding: "10px 14px",
  fontWeight: 700,
};

const btnGhost: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  padding: "8px 12px",
  fontWeight: 600,
};

const btnDanger: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid rgba(239,68,68,0.5)",
  background: "rgba(239,68,68,0.18)",
  padding: "8px 12px",
  fontWeight: 600,
};
