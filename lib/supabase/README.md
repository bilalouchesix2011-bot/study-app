## Supabase dans ce projet

### 1) Base de données (Prisma)
- La DB est Supabase Postgres.
- Les migrations utilisent `DIRECT_URL` (port 5432).
- L'app (Prisma Client) doit utiliser `DATABASE_URL` (pooler, port 6543).

> Les variables sont dans `.env.local` et la Prisma CLI les charge via `prisma.config.ts`.

### 2) SDK Supabase (Auth / Realtime / Storage côté client)

Le helper `createBrowserSupabaseClient()` est disponible ici :
`lib/supabase/client.ts`

#### Storage

- Helpers : `lib/supabase/storage.ts`
- Bucket par défaut : `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` (sinon `"uploads"`).

#### Realtime (Postgres Changes)

- Helper : `lib/supabase/realtime.ts`
- Pense à activer Realtime sur la table côté Supabase.

Exemple d'utilisation (dans un composant client) :
```ts
"use client";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function Example() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  return <div>User: {email ?? "not signed in"}</div>;
}
```
