# StudyPulse — Setup rapide (Prisma + Supabase + NextAuth)

## 1) Supabase (PostgreSQL)

1. Crée un projet Supabase.
2. Récupère les **connection strings** Postgres dans *Project Settings → Database*.
3. Renseigne :
   - `DATABASE_URL` : l’URL **pooler** (port 6543, `pgbouncer=true`) pour le runtime.
   - `DIRECT_URL` : l’URL **directe** (port 5432) pour les migrations.

> Objectif : éviter les soucis de connexions sur serverless / edge, tout en gardant des migrations fiables.

## 2) Prisma

Le schéma est dans `prisma/schema.prisma`.

Commandes usuelles :
```bash
npx prisma generate
npx prisma migrate dev
```

## 3) NextAuth (Google OAuth)

1. Crée des identifiants OAuth dans Google Cloud Console (OAuth Client ID).
2. Ajoute dans `.env.local` :
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`

Configuration :
- `lib/auth.ts` (Google provider + PrismaAdapter)
- Route handler : `app/api/auth/[...nextauth]/route.ts`
- La session expose `user.id`, `user.role`, `user.isPremium`, `user.xpTotal`.

### Typage TypeScript

Le module augmentation est dans `types/next-auth.d.ts`.
Assure-toi que ton `tsconfig.json` inclut bien les `*.d.ts` (souvent c’est déjà le cas). Sinon :
```json
{
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", "types/**/*.d.ts"]
}
```

## 4) Admin — création de Quiz

- Page : `app/admin/quizzes/new/page.tsx` (protégée côté serveur, redirect si non ADMIN)
- UI : `app/admin/quizzes/new/quiz-builder.tsx`
- API (ADMIN only) : `POST /api/admin/quizzes` → `app/api/admin/quizzes/route.ts`

## 5) Rôles (ADMIN)

Le modèle `User` contient `role` (`USER` / `ADMIN`).
Pour te passer ADMIN au début, tu peux le faire via une requête SQL sur Supabase ou via Prisma Studio.

