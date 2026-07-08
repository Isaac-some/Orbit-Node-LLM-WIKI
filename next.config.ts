import type { NextConfig } from "next";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isGitHubPagesBuild =
  process.env.GITHUB_ACTIONS === "true" && Boolean(repositoryName);
const basePath = isGitHubPagesBuild ? `/${repositoryName}` : undefined;

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
