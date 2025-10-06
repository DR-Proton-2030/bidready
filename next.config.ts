import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "bidready.s3.ap-south-1.amazonaws.com",
      "upload.wikimedia.org",
      "cdn.shopify.com",
    ], // ✅ allow S3, Wikimedia and Shopify CDN images
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Allow builds to proceed even if ESLint/type errors exist in the codebase.
  // This is useful for developer workflows where you want the production build
  // to succeed and address lint/type issues separately.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // WARNING: Setting this to true will allow production builds to succeed
    // even if TypeScript reports type errors. Use with caution.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
