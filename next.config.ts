import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/timebox-planner",
  images: { unoptimized: true },
};

export default nextConfig;
