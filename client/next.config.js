/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['res.cloudinary.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? 'http://backend:5000/api/:path*'
          : 'http://localhost:5000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;