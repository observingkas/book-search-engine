import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

console.log("Build output directory:", process.cwd());

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    rollupOptions: {
      external: ["@apollo/client"],
      output: {
        dir: process.env.VITE_OUT_DIR || "dist",
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
