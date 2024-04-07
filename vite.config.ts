import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import Info from "unplugin-info/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), Info()],
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
