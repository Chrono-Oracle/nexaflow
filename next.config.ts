import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  // Allow ngrok tunnels and remote dev origins to access Next.js dev resources without cross-origin blocking
  allowedDevOrigins: [
    'vividly-concept-viewless.ngrok-free.dev',
    '*.ngrok-free.dev',
    '*.ngrok-free.app',
    '*.ngrok.app',
  ],
  // Disable floating dev indicators that obstruct touch targets on mobile screens
  devIndicators: false,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withNextIntl(nextConfig);
