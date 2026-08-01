import type { NextConfig } from "next";
import path from "path";

const isDev = process.env.NODE_ENV !== "production";

const cspScriptSrc = [
  "'self'",
  "'unsafe-inline'",
  "https://checkout.razorpay.com",
  "https://*.clerk.accounts.dev",
  ...(isDev ? ["'unsafe-eval'"] : []),
].join(" ");

const csp = [
  `default-src 'self'`,
  `script-src ${cspScriptSrc}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: https:`,
  `font-src 'self' https://fonts.gstatic.com`,
  `connect-src 'self' https://*.supabase.co https://*.clerk.accounts.dev https://api.razorpay.com`,
  `frame-src https://checkout.razorpay.com https://api.razorpay.com`,
  `worker-src 'self' blob:`,
  `object-src 'none'`,
  `base-uri 'self'`,
].join("; ");

const nextConfig: NextConfig = {
  reactCompiler: true,

  turbopack: {
    root: path.join(__dirname),
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: csp,
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload"
          },
          {
            key: "X-Frame-Options",
            value: "DENY"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()"
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
