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
};

export default nextConfig;
