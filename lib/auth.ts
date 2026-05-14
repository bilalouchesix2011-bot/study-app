import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "bilalouchesix2025@gmail.com";
const ADMIN_XP_TOTAL = BigInt(1_000_000);
const ADMIN_TITLE = "Fondateur";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
  },
  events: {
    async signIn({ user }) {
      // Sécurité: si l'email correspond à l'admin, on force les privilèges en base.
      const email = user.email?.toLowerCase();
      if (email && email === ADMIN_EMAIL.toLowerCase()) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            role: "ADMIN",
            isPremium: true,
            xpTotal: ADMIN_XP_TOTAL,
          },
        });

        // Avantage admin: accès à toutes les guildes (membership auto).
        const guilds = await prisma.guild.findMany({ select: { id: true } });
        if (guilds.length) {
          await prisma.guildMembership.createMany({
            data: guilds.map((g) => ({
              guildId: g.id,
              userId: user.id,
              role: "MEMBER",
            })),
            skipDuplicates: true,
          });
        }
      }
    },
  },
  callbacks: {
    async session({ session, user }) {
      if (!session.user) session.user = {} as never;

      session.user.id = user.id;
      session.user.name = user.name;
      session.user.email = user.email;
      session.user.image = user.image;

      // Champs custom StudyPulse (issus du modèle Prisma User)
      // Note: on convertit BigInt -> number pour éviter les erreurs de sérialisation JSON.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const u: any = user;
      session.user.role = u.role ?? "USER";
      session.user.isPremium = Boolean(u.isPremium);
      session.user.xpTotal = typeof u.xpTotal === "bigint" ? Number(u.xpTotal) : Number(u.xpTotal ?? 0);

      // Sécurité + UX: garantir le rôle ADMIN côté session dès la première connexion.
      if (session.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        session.user.role = "ADMIN";
        session.user.isPremium = true;
        session.user.xpTotal = Number(ADMIN_XP_TOTAL);
        session.user.title = ADMIN_TITLE;
      } else {
        session.user.title = null;
      }

      return session;
    },
  },
};
