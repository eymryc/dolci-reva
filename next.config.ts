import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'v2-dolcireva-api.test',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'v2-dolcireva-api.test',
        pathname: '/storage/**',
      },
      {
        protocol: 'http',
        hostname: 'dolci-reva.achalivre-afrique.ci',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'dolci-reva.achalivre-afrique.ci',
        pathname: '/storage/**',
      },
      {
        protocol: 'http',
        hostname: 'dolci-reva-x27q.vercel.app',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'dolci-reva-x27q.vercel.app',
        pathname: '/storage/**',
      },
    ],
  },
};

export default nextConfig;
