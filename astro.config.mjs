// astro.config.mjs
import { defineConfig, loadEnv } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig(({ mode }) => {
  // Load environment variables from .env files
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  // Site domain loaded from PUBLIC_SITE_DOMAIN, fallback to existing domain
  const domain = process.env.PUBLIC_SITE_DOMAIN;

  return {
    site: `https://${domain}`,
    server: {
      port: 9000,
    },
    vite: {
      plugins: [tailwindcss()],
      build: {
        rollupOptions: {
          output: {
            manualChunks(id) {
              // Split React-related code into a separate chunk
              if (
                id.includes('node_modules/react') ||
                id.includes('node_modules/react-dom')
              ) {
                return 'react-vendor';
              }
              // Further customization can be added here for other libraries
            },
          },
        },
      },
    },
    integrations: [mdx(), react(), sitemap()],
  };
});
