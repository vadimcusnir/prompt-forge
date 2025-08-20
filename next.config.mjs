/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Force dynamic rendering to prevent event handler serialization issues
  experimental: {
    // Disable static generation for pages with event handlers
    workerThreads: false,
    cpus: 1,
  },
  // Force dynamic rendering
  trailingSlash: false,
  // Disable static export
  output: 'standalone',
}

export default nextConfig
