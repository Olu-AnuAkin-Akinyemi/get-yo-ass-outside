import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Path alias for cleaner imports
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  // Development server configuration
  server: {
    port: 5173,
    open: true, // Auto-open browser
    host: true, // Expose to network for mobile testing
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Target modern browsers for smaller bundle
    target: 'es2020',
    // Minification
    minify: 'esbuild',
  },

  // CSS configuration
  css: {
    devSourcemap: true,
  },
});
