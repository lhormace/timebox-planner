import type { NextConfig } from "next";
import { execSync } from "node:child_process";
import { version } from "./package.json";

const isProd = process.env.NODE_ENV === "production";

function git(command: string): string {
  try {
    return execSync(command, { encoding: "utf-8" }).trim();
  } catch {
    return "unknown";
  }
}

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/timebox-planner" : "",
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
    NEXT_PUBLIC_COMMIT_HASH: git("git rev-parse --short HEAD"),
    // Commit timestamp of HEAD — the closest available proxy for "when this
    // was pushed", since git does not record push times.
    NEXT_PUBLIC_COMMIT_DATE: git("git log -1 --format=%cI"),
  },
};

export default nextConfig;
