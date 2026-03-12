import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // 本番で AUTH_URL 未設定時は Vercel の URL から組み立て（Invalid URL 防止）
    AUTH_URL:
      process.env.AUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined),
  },
};

export default nextConfig;
