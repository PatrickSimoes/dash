import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/sonar/dash",
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "attachments.clickup.com",
      },
    ],
  },
};

export default nextConfig;
