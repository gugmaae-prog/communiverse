import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  outputFileTracingRoot: process.cwd(),
  basePath: "/communiverse",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
