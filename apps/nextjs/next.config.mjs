// Importing env files here to validate on build
import "./src/env.mjs"

import million from "million/compiler"

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@pachi/api",
    "@pachi/db",
    "@pachi/types",
    "@pachi/utils",
  ],
  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
  },
}
const millionConfig = {
  // auto: true,
  // if you're using RSC:
  auto: { rsc: true },
}

export default million.next(nextConfig, millionConfig)
