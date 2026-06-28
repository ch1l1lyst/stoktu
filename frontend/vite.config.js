import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/", // <--- Esto es para que los CSS/JS no den 404 en Render
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000", // <--- FIJO. Solo para LOCAL.
        changeOrigin: true,
      },
    },
  },
});
