// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Output directory for the build
  outDir: './dist',
  
  // Public directory for static assets
  publicDir: './public',
  
  // Build configuration
  build: {
    // Use the same directory structure for assets
    assets: 'assets'
  },
  
  // Image optimization configuration
  image: {
    // Enable image optimization
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  },
  
  // Vite configuration for handling existing assets
  vite: {
    build: {
      assetsInlineLimit: 0 // Don't inline images
    }
  }
});
