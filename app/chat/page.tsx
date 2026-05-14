import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ChatClient from "./chat-client";

export default async function ChatPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isPremium: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const others = users.filter((u) => u.id !== session.user!.id);

  return (
    <ChatClient
      currentUser={{
        id: session.user.id,
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      }}
      users={others.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image,
        isPremium: u.isPremium,
      }))}
    />
  );
}

