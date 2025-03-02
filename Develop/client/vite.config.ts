import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

console.log("Build output directory:", process.cwd());

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist", // Make sure this is relative to the root folder.
    rollupOptions: {
      external: ["@apollo/client"],
      output: {
        dir: "dist", // Make sure this matches the `outDir` setting.
      },
    },
  },

  server: {
    port: 3000,
    open: true,
  },
});
