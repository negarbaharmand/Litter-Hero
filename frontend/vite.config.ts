import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // LAN access so phone can open the dev server (mobil test)
    host: true,
    allowedHosts: true,
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": "http://backend:3000",
    },
  },
});
