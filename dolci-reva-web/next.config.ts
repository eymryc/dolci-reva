import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/proprietaire",
        destination: "/admin/dashboard",
      },
      {
        source: "/proprietaire/:path*",
        destination: "/admin/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        // Prod — même domaine (médias via Nginx → Laravel /storage)
        protocol: "https",
        hostname: "dolci-reva.com",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "www.dolci-reva.com",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_API_HOSTNAME || "dolci-reva.com",
        pathname: "/storage/**",
      },
      {
        // Ancien hébergement (transition DNS)
        protocol: "https",
        hostname: "dolci-reva.achalivre-afrique.ci",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        // Docker local
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8080",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;
