import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, "..", ".."),
  },
  transpilePackages: ["@eloktantra/types"],
};

export default nextConfig;
