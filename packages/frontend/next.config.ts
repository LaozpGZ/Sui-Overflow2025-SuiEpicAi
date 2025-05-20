import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "dist",
  reactStrictMode: true,
  transpilePackages: [
    "@mysten/dapp-kit",
    "@mysten/sui.js",
    "@mysten/wallet-standard",
    "@suiware/kit",
    "@radix-ui/themes",
    "@radix-ui/react-select",
    "@radix-ui/react-toggle",
  ],
  webpack: (config) => {
    config.externals = [...(config.externals || []), "encoding"];
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(__dirname, "src/app"),
      "~~": path.resolve(__dirname, "src/app"),
    };
    return config;
  },
};

export default nextConfig;
