import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["bidready.s3.ap-south-1.amazonaws.com"], // ✅ allow S3 bucket images
  },
};

export default nextConfig;