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
    ],
    env: {
        CART_EXPIRATION_TIME: 1000 * 60 * 60 * 24 * 7,
        MAX_QUANTITY_TO_ORDER : 11,
        MIN_QUANTITY_TO_ORDER: 1
    }
};

export default nextConfig;
