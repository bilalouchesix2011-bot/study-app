import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma CLI ne charge pas automatiquement .env.local.
// On force le chargement de .env.local pour récupérer DATABASE_URL / DIRECT_URL.
dotenv.config({ path: ".env.local" });

/**
 * Prisma ORM v7+
 * - Les URLs de connexion ne se mettent plus dans le schema.prisma.
 * - On les déclare ici (Prisma CLI / Migrate / Studio).
 *
 * Convention StudyPulse:
 * - DIRECT_URL : connexion directe (migrations)
 * - DATABASE_URL : pooler (runtime PrismaClient via adapter)
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
