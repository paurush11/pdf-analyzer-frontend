/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  trailingSlash: true,
  async rewrites() {
    const backendUrl = process.env.BACKEND_API_URL ?? 'http://localhost:3001';
    console.log('[next] rewrites →', backendUrl);
    return {
      // run BEFORE checking Next's /pages, /app, and built-in API routes
      beforeFiles: [
        { source: '/api/:path*', destination: `${backendUrl}/api/:path*` },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};
export default nextConfig;
