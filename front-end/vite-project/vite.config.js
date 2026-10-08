import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      "/customers": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/products": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      // Lab 4 — Wishlist
      "/wishlist": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      // Lab 5 — Cart
      "/cart": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      // Lab 6 — Orders
      "/orders": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});