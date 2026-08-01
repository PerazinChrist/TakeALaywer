import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Photos d'avocats et illustrations d'articles (stockage S3 / R2 a venir).
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
