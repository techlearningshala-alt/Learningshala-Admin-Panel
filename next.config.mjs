/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@ckeditor/ckeditor5-utils": path.resolve(__dirname, "node_modules/@ckeditor/ckeditor5-utils"),
      "@ckeditor/ckeditor5-engine": path.resolve(__dirname, "node_modules/@ckeditor/ckeditor5-engine"),
    };
    return config;
  },
};

export default nextConfig;
