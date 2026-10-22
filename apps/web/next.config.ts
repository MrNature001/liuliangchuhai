import type { NextConfig } from "next"

/**
 * The demo is published in two shapes: the standalone site and an embeddable
 * page meant to be framed by a host site. Framing is therefore allowed for
 * `/embed` only; every other route keeps Next's default denial so the main site
 * cannot be clickjacked.
 */
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/embed",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors *" },
          { key: "X-Frame-Options", value: "ALLOWALL" },
        ],
      },
      {
        source: "/:path((?!embed$).*)",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ]
  },
}

export default nextConfig
