import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
        {hostname:"kgvmjizuinwaxkfkvidy.supabase.co"},
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
