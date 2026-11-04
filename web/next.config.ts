import type { NextConfig } from "next";

// API NestJS (pasta api/). Na VPS o nginx pode servir /api direto; aqui o Next repassa.
const API_URL = process.env.API_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  rewrites: async () => [{ source: "/api/:caminho*", destination: `${API_URL}/api/:caminho*` }],
};

export default nextConfig;
