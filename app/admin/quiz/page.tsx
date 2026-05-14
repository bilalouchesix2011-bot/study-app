import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import QuizForm from "./quiz-form";

export default async function AdminQuizPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <main style={{ maxWidth: 920, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
        Admin — Créer un quiz
      </h1>
      <p style={{ opacity: 0.8, marginBottom: 24 }}>
        Publie de nouveaux quiz (titre, questions, choix de réponses, XP gagnés). Ils
        apparaîtront ensuite sur le dashboard étudiant.
      </p>

      <QuizForm />
    </main>
  );
}

