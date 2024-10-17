/** @type {import('next').NextConfig} */
const nextConfig = {
   output: 'export',
   images: {
     unoptimized: true,
   },
   assetPrefix: process.env.NODE_ENV === 'production' ? '/blog' : '',
   basePath: process.env.NODE_ENV === 'production' ? '/blog' : '',
   webpack(config) {
     config.experiments = {
       ...config.experiments,
       asyncWebAssembly: true,
     }
     return config
   },
 }
 
 export default nextConfig;