import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Path alias for cleaner imports
  resolve: {
    alias: {
      '@': '/src',
    },
  },

  // Vitest configuration
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.ts'],
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
