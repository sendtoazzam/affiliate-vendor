/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  env: {
    APP_COUNTRY: process.env.APP_COUNTRY || 'MY',
    APP_LANGUAGE: process.env.APP_LANGUAGE || 'en_MS',
    TIMEZONE: process.env.TIMEZONE || 'Asia/Kuala_Lumpur',
    NEXT_PUBLIC_APP_COUNTRY: process.env.APP_COUNTRY || process.env.NEXT_PUBLIC_APP_COUNTRY || 'MY',
    NEXT_PUBLIC_APP_LANGUAGE: process.env.APP_LANGUAGE || process.env.NEXT_PUBLIC_APP_LANGUAGE || 'en_MS',
    NEXT_PUBLIC_TIMEZONE: process.env.TIMEZONE || process.env.NEXT_PUBLIC_TIMEZONE || 'Asia/Kuala_Lumpur',
  },
};

export default nextConfig;
