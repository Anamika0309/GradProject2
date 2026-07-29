// API base URL strategy:
//
// • Browser on Vercel (production):
//     "" (empty) → calls go to /api/* on the Next.js server.
//     Next.js rewrites them transparently to Railway — NO CORS issues.
//
// • Browser on localhost (local dev):
//     http://localhost:8000 — calls the local FastAPI server directly.
//
// • Server-side (RSC / layout.tsx server fetch):
//     Railway URL directly — server-to-server, CORS never applies.

const isServer    = typeof window === "undefined";
const isLocalhost = !isServer && window.location.hostname === "localhost";

export const API_BASE = isServer
  ? (process.env.BACKEND_URL ?? "https://gradproject2-production.up.railway.app")
  : isLocalhost
  ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000")
  : ""; // browser in production — /api/* is proxied by Next.js to Railway
