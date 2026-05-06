/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: false,
  },
  experimental: {
    serverComponentsExternalPackages: ['libreoffice-convert'],
  },
}

module.exports = nextConfig
