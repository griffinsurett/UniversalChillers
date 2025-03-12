// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  server: {
    port: 3000 // Change this to your desired port
  },
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [mdx(), react()]
});