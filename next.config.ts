import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const BUILD_OUTPUT = process.env.NEXT_STANDALONE_OUTPUT
  ? "standalone"
  : undefined;

export default () => {
  // Allow basePath to be configured via environment variable
  // Defaults to '/better-chatbot' for production, empty for development
  const basePath =
    process.env.NEXT_PUBLIC_BASE_PATH ||
    (process.env.NODE_ENV === "production" ? "/better-chatbot" : "");

  const origin = process.env.BETTER_AUTH_URL || "http://localhost:3000";

  const nextConfig: NextConfig = {
    basePath: basePath,
    output: BUILD_OUTPUT,
    cleanDistDir: true,
    devIndicators: {
      position: "bottom-right",
    },
    env: {
      NO_HTTPS: process.env.NO_HTTPS,
    },
    experimental: {
      taint: true,
    },
    async rewrites() {
      // Keep API routes accessible at root (no basePath) while the app uses basePath
      if (!basePath) return [];
      return [
        {
          source: "/api/:path*",
          // Must be absolute URL since source disables basePath
          destination: `${origin}${basePath}/api/:path*`,
          basePath: false,
        },
      ];
    },
  };
  const withNextIntl = createNextIntlPlugin();
  return withNextIntl(nextConfig);
};
