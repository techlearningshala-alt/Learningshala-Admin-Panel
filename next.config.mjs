import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: false, // ✅ disable Turbopack, use Webpack instead
  },
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@ckeditor/ckeditor5-utils": path.resolve(__dirname, "node_modules/@ckeditor/ckeditor5-utils"),
      "@ckeditor/ckeditor5-engine": path.resolve(__dirname, "node_modules/@ckeditor/ckeditor5-engine"),
    };
    return config;
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: true, // use false if you may change it later
      },
    ];
  },
};

export default nextConfig;
