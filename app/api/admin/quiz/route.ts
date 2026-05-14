export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type CreateQuizBody = {
  title?: unknown;
  description?: unknown;
  xpReward?: unknown;
  questions?: unknown;
};

function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  let body: CreateQuizBody;
  try {
    body = (await req.json()) as CreateQuizBody;
  } catch {
    return badRequest("Body JSON invalide");
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : undefined;
  const xpReward =
    typeof body.xpReward === "number" && Number.isFinite(body.xpReward) ? Math.floor(body.xpReward) : 0;

  if (!title) return badRequest("Le titre est obligatoire");
  if (xpReward < 0) return badRequest("XP gagnés invalides (doit être >= 0)");

  const questions = Array.isArray(body.questions) ? body.questions : null;
  if (!questions || questions.length === 0) {
    return badRequest("Au moins une question est requise");
  }

  // Validation minimale (structure + au moins 2 réponses + 1 correcte par question)
  const normalizedQuestions = questions.map((q, idx) => {
    if (!q || typeof q !== "object") {
      throw new Error(`Question ${idx + 1}: format invalide`);
    }
    const qObj = q as Record<string, unknown>;
    const prompt = typeof qObj.prompt === "string" ? qObj.prompt.trim() : "";
    const answersRaw = Array.isArray(qObj.answers) ? qObj.answers : null;
    if (!prompt) {
      throw new Error(`Question ${idx + 1}: énoncé manquant`);
    }
    if (!answersRaw || answersRaw.length < 2) {
      throw new Error(`Question ${idx + 1}: il faut au moins 2 réponses`);
    }

    const answers = answersRaw.map((a, aIdx) => {
      if (!a || typeof a !== "object") {
        throw new Error(`Question ${idx + 1}, réponse ${aIdx + 1}: format invalide`);
      }
      const aObj = a as Record<string, unknown>;
      const text = typeof aObj.text === "string" ? aObj.text.trim() : "";
      const isCorrect = Boolean(aObj.isCorrect);
      if (!text) throw new Error(`Question ${idx + 1}, réponse ${aIdx + 1}: texte manquant`);
      return { text, isCorrect };
    });

    if (!answers.some((a) => a.isCorrect)) {
      throw new Error(`Question ${idx + 1}: il faut marquer une réponse correcte`);
    }

    return { prompt, answers };
  });

  try {
    const created = await prisma.adminQuiz.create({
      data: {
        title,
        description,
        xpReward,
        createdById: session.user.id,
        questions: {
          create: normalizedQuestions.map((q, qIndex) => ({
            prompt: q.prompt,
            order: qIndex + 1,
            answers: {
              create: q.answers.map((a, aIndex) => ({
                text: a.text,
                isCorrect: a.isCorrect,
                order: aIndex + 1,
              })),
            },
          })),
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: created.id });
  } catch (e: unknown) {
    return badRequest("Impossible de créer le quiz", e instanceof Error ? e.message : String(e));
  }
}
