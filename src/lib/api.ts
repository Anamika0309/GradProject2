// Centralised API base URL.
// In production (Vercel), set NEXT_PUBLIC_API_URL to your Railway backend URL.
// Locally it falls back to http://localhost:8000.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
