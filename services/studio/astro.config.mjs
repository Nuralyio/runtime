import { defineConfig } from 'astro/config';
import react from "@astrojs/react";
import lit from "@astrojs/lit";
import tailwind from "@astrojs/tailwind";
import sentry from "@sentry/astro";
import worker from "@astropub/worker"

import node from "@astrojs/node";

import compressor from "astro-compressor";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), lit(), tailwind({}), worker(), compressor()],
  output: "server",
  adapter: node({
    mode: "standalone"
  }),
  vite: {
   build:{
    assetsInlineLimit:0,
    
   },
   ssr:{
    noExternal:['monaco-editor']
   }
  },
});