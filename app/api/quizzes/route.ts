export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const quizzes = await prisma.adminQuiz.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { questions: true } },
    },
  });

  return NextResponse.json(
    quizzes.map((q) => ({
      id: q.id,
      title: q.title,
      description: q.description,
      xpReward: q.xpReward,
      questionsCount: q._count.questions,
      createdAt: q.createdAt,
    })),
  );
}
