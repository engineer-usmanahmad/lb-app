import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: true,
    port: Number(process.env.PORT) || 4321,
    strictPort: true,
    // Allow Replit's external URL(s)
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      // Replit domains (suffix form supported)
      ".replit.dev",
      ".repl.co",
      // Your exact error host (belt & suspenders)
      "5bf60926-3860-4d5d-b216-a26bfb60427a-00-2j8zaa9pns4xf.sisko.replit.dev",
    ],
    // Helps HMR over HTTPS on Replit
    hmr: {
      clientPort: 443,
    },
  },
});
