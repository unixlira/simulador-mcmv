import type { NextConfig } from "next";

// Exportação estática (pasta out/) para a Hostinger compartilhada: o /api é PHP (pasta servidor/).
// Em desenvolvimento o Next repassa /api para o PHP local (npm run api, porta 8000).
const API_URL = process.env.API_URL ?? "http://localhost:8000";
const desenvolvimento = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  output: desenvolvimento ? undefined : "export",
  trailingSlash: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  ...(desenvolvimento && {
    rewrites: async () => [{ source: "/api/:caminho*", destination: `${API_URL}/api/:caminho*` }],
  }),
};

export default nextConfig;
