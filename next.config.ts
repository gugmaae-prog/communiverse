import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/communiverse",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
