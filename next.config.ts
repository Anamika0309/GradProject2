import type { NextConfig } from "next";

// Hardcoded Railway backend URL — no env var needed, works out-of-the-box on Vercel.
// Next.js rewrites /api/* requests to this backend transparently from the browser,
// so there are ZERO CORS issues regardless of Railway's CORS configuration.
const BACKEND_URL =
  process.env.BACKEND_URL ?? "https://gradproject2-production.up.railway.app";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
