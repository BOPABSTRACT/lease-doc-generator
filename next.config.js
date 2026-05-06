/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['libreoffice-convert'],
  },
}

module.exports = nextConfig
