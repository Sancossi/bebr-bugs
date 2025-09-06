/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'cdn.discordapp.com',
      'media.discordapp.net',
      'via.placeholder.com'
    ],
  },
  // Переменные окружения будут загружены автоматически из .env.local
  experimental: {
    serverComponentsExternalPackages: ['discord.js']
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('discord.js')
    }
    return config
  }
}

module.exports = nextConfig 