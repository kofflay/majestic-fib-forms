/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.discordapp.com'],
  },
  // Публичные переменные, которые можно показывать в коде
  publicRuntimeConfig: {
    discordClientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
    discordRedirectUri: process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI,
  },
}

module.exports = nextConfig
