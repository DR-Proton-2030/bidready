import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "bidready.s3.ap-south-1.amazonaws.com",
      "upload.wikimedia.org",
      "cdn.shopify.com",
    ], // ✅ allow S3, Wikimedia and Shopify CDN images
  },
};

export default nextConfig;
