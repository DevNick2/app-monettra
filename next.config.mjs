/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@mui/material",
      "@mui/x-charts",
      "@radix-ui"
    ],
  },
}

export default nextConfig
