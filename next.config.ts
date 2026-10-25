import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Remote preview hosts (tunnels / sandboxes) must be allowlisted or Next.js
  // blocks dev-only assets and HMR requests coming from a different origin.
  allowedDevOrigins: ["*.e2b.app", "*.e2b.dev", "*.trycloudflare.com"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
        port: "",
        pathname: "/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
