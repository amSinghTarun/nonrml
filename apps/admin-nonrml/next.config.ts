import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
        {hostname:"kgvmjizuinwaxkfkvidy.supabase.co"},
        {hostname:"images.unsplash.com"},
        {hostname:"aceternity.com"}
    ]
  },
};

export default nextConfig;
