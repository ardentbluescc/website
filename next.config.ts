import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
const webpack = require('webpack')

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname),
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'img.cdn.nvplay.net' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // resolveSignedURLKey imports payload/internal (server-only) — replace with
      // a no-op stub for the client bundle so the chain doesn't pull in undici.
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /plugin-cloud-storage[\\/]dist[\\/]utilities[\\/]resolveSignedURLKey/,
          path.resolve('./src/lib/stubs/resolveSignedURLKey.js')
        )
      )
    }
    return config
  },
}

export default withPayload(nextConfig)
