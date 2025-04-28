/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/introduction/what-is-nixcats',
        permanent: false,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/docs/:path*',
        destination: '/:path*',
      }
    ]
  }
}
