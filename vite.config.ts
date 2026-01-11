import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [".onrender.com", ".builderio.xyz"],
    hmr: process.env.VITE_HMR_HOST
      ? {
          host: process.env.VITE_HMR_HOST,
          protocol: process.env.VITE_HMR_PROTOCOL || "wss",
          port: process.env.VITE_HMR_PORT ? parseInt(process.env.VITE_HMR_PORT) : 443,
        }
      : undefined,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "terser",
    target: "esnext"
  },
  plugins: [react(), mode === "production" ? null : componentTagger()].filter(Boolean),
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") }
  },
  base: "/"  // Important for Render root deployment
}));
