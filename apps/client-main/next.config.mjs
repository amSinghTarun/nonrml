/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {hostname:process.env.NEXT_PUBLIC_SUPABASE_HOSTNAME},
            {hostname:"images.unsplash.com"},
            {hostname:"aceternity.com"}
        ]
    },
    transpilePackages: [
        "@nonrml/trpc",
        "@nonrml/configs",
        "@nonrml/cache",
        "@nonrml/common",
        "@nonrml/components",
        "@nonrml/shipping",
        "@nonrml/shipping"
    ],
    env: {
        CART_EXPIRATION_TIME: `${1000 * 60 * 60 * 24 * 7}`,
        MAX_QUANTITY_TO_ORDER : `11`,
        MIN_QUANTITY_TO_ORDER: `1`,
        PROD_PORT: '8080',
        DAMAGE_PARCEL_RETURN_ALLOWED_TIME: 86400000,
        RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    }
};

export default nextConfig;


rzp_live_RFojdMUaDJy9XM