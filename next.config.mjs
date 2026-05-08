/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: 'https://capital-seriously-ghoul.ngrok-free.app',
  },
};

export default nextConfig;