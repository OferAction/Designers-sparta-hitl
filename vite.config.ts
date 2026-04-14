import path from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    svgr(),
    {
      name: "html-transform",
      transformIndexHtml(html) {
        const mode = process.env.VITE_MODE || "dev";
        return html.replace("%VITE_MODE%", mode);
      },
    },
  ],
  base: "/", // Adjust if deploying to a subpath
  build: {
    outDir: "dist", // Default output directory
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "process.env": process.env,
  },
});
