import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = dirname(fileURLToPath(import.meta.url));

// This app is deployed as a static export to GitHub Pages as a *project*
// site: https://arnabganguly.github.io/polymarket-intelligence/
// Project pages are served from a subpath, so we need basePath/assetPrefix
// whenever we're building for GitHub Pages (set via GITHUB_PAGES=true in CI).
const repoName = "polymarket-intelligence";
const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  output: "export",
  trailingSlash: true,
  basePath: isGithubPages ? `/${repoName}` : "",
  assetPrefix: isGithubPages ? `/${repoName}/` : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
