/** @type {import('next').NextConfig} */
const nextConfig = {
  // The app reads live data from GitHub on every request; nothing is prerendered.
  output: "standalone",
};

export default nextConfig;
