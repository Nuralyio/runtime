import { defineConfig } from 'astro/config';
import react from "@astrojs/react";
import lit from "@astrojs/lit";
import tailwind from "@astrojs/tailwind";
import preact from "@astrojs/preact";
import svelte from "@astrojs/svelte";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), lit(), tailwind({}), preact(), svelte()],
  output: "server",
  adapter: node({
    mode: "standalone"
  }),
  vite: {
   build:{
    assetsInlineLimit:0,
   },
   ssr:{
    noExternal:[
    ]
   }
  },
});