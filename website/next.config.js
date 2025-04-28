/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/introduction/what-is-nixcats',
        permanent: true,
      },
    ]
  },
}
