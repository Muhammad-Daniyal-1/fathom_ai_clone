import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";

const basePath = isGithubPages ? "/fathom_ai_clone" : "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
