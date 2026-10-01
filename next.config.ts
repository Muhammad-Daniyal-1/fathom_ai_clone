import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";

const basePath = isGithubPages ? "/fathom_ai_clone" : "";

const nextConfig: NextConfig = {
  // Static export only for GitHub Pages fallback. Primary deploy is Vercel (API routes).
  ...(isGithubPages
    ? {
        output: "export" as const,
        trailingSlash: true,
      }
    : {}),
  images: { unoptimized: true },
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
