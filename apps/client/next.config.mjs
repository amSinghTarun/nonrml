/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@nonorml/trpc"
  ]
};

export default nextConfig;
