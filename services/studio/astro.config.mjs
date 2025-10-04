import { defineConfig } from 'astro/config';
import react from "@astrojs/react";
import lit from "@astrojs/lit";
import worker from "@astropub/worker";

import node from "@astrojs/node";

import compressor from "astro-compressor";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), lit(),  worker(), compressor()],
  output: "server",
  adapter: node({
    mode: "standalone"
  }),
  vite: {
   resolve: {
     alias: {
       '$store': '/src/shared/redux/store',
       '@features': '/src/features',
       '@shared': '/src/shared',
       '@api': '/src/api',
       '@runtime': '/src/features/runtime',
       '@studio': '/src/features/studio',
       '@utils': '/src/utils',
     }
   },
   build:{
    assetsInlineLimit:0,
    
   },
   ssr:{
    noExternal:['monaco-editor']
   }
  },
});