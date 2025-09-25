import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
        {hostname: process.env.NEXT_PUBLIC_SUPABASE_HOSTNAME!},
        {hostname:"images.unsplash.com"},
        {hostname:"aceternity.com"}
    ]
  },
  transpilePackages: [
    "@nonrml/trpc",
    "@nonrml/configs",
    "@nonrml/cache",
    "@nonrml/common",
    "@nonrml/components"
  ],
  env: {
    CLIENT_SUPPORT_MAIL: process.env.NEXT_PUBLIC_CLIENT_SUPPORT_MAIL
  }
};

export default nextConfig;
