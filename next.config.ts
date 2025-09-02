import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["bidready.s3.ap-south-1.amazonaws.com", "upload.wikimedia.org"], // ✅ allow S3 bucket images
  },
};

export default nextConfig;