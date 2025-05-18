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
        "@nonrml/common",
        "@nonrml/components"
    ],
    env: {
        CART_EXPIRATION_TIME: `${1000 * 60 * 60 * 24 * 7}`,
        MAX_QUANTITY_TO_ORDER : `11`,
        MIN_QUANTITY_TO_ORDER: `1`,
        PROD_PORT: '8080',
        RAZORPAY_KEY_ID: "rzp_live_Sg00pUDJaSERMX"
    }
};

export default nextConfig;
