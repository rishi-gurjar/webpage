/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  experimental: {
    serverActions: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: 'https://capital-seriously-ghoul.ngrok-free.app',
  },
  // images: { unoptimized: true },
};

export default nextConfig;