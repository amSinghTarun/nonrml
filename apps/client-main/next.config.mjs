/** @type {import('next').NextConfig} */
const nextConfig = {
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
        "@nonrml/common"
    ]
};

export default nextConfig;
