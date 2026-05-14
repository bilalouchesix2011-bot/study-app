export const dynamic = 'force-dynamic';

import LoginClient from "./login-client";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const userCount = await prisma.user.count();
  return <LoginClient userCount={userCount} />;
}
