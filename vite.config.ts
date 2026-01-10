import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [".onrender.com"]
  },
  plugins: [
    react({
      // Force production JSX transform
      jsxRuntime: 'automatic',
      dev: mode === 'development'  // Only dev mode gets dev features
    }), 
    mode === "development" ? componentTagger() : null
  ].filter(Boolean),
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") }
  },
  base: "/",
  build: {
    target: 'esnext',  // Modern browsers, proper JSX
    minify: 'terser'   // Ensure terser is installed
  }
}));
