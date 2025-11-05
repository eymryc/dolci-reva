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
    ],
  },
};

export default nextConfig;
