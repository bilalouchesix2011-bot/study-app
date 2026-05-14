import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Permet de déployer même si TypeScript remonte des erreurs de type au build (Vercel).
    ignoreBuildErrors: true,
  },
  eslint: {
    // Évite qu'ESLint bloque le build sur Vercel.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
