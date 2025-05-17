// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { config as loadDotenv } from 'dotenv';

// ① Only load .env when NODE_ENV !== 'production'
if (process.env.NODE_ENV !== 'production') {
  loadDotenv();
}

// ② Now process.env.PUBLIC_* is available:


export default defineConfig({
  site: `https://${process.env.PUBLIC_SITE_DOMAIN}`,
  server: {
    port: Number(process.env.PUBLIC_DEV_PORT) || 5500,
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (
              id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom')
            ) {
              return 'react-vendor';
            }
          },
        },
      },
    },
  },
  integrations: [mdx(), react()],
});
