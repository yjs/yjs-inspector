import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import Info from "unplugin-info/vite";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
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
    rollupOptions: {
      output: {
        manualChunks: {
          react: [
            "react",
            "react-dom",
            "react/jsx-runtime",
            "react-dom/client",
          ],
          yjs: ["yjs"],
          lucide: ["lucide-react"],
          "fn-sphere": ["@fn-sphere/filter", "zod"],
        },
      },
    },
  },
});
