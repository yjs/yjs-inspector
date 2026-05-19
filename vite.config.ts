import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import Info from "unplugin-info/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), Info()],
  base: "./",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    sourcemap: true,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react",
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            },
            {
              name: "yjs",
              test: /[\\/]node_modules[\\/]yjs[\\/]/,
            },
            {
              name: "lucide",
              test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            },
            {
              name: "fn-sphere",
              test: /[\\/]node_modules[\\/](@fn-sphere[\\/]filter|zod)[\\/]/,
            },
          ],
        },
      },
    },
  },
});
