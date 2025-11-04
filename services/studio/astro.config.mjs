import { defineConfig } from 'astro/config';
import react from "@astrojs/react";
import lit from "@astrojs/lit";
import worker from "@astropub/worker";
import yaml from '@rollup/plugin-yaml';

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
   plugins: [yaml()],
   resolve: {
     alias: [
       { find: '$store', replacement: '/src/shared/redux/store' },
       { find: '@features', replacement: '/src/features' },
       { find: '@shared', replacement: '/src/shared' },
       { find: '@services', replacement: '/src/services' },
       { find: '@runtime', replacement: '/src/features/runtime' },
       { find: '@studio', replacement: '/src/features/studio' },
       { find: '@utils', replacement: '/src/utils' },
       { find: /^@nuralyui\/common\/(.+)$/, replacement: '/src/shared/ui/nuraly-ui/packages/common/src/$1' },
       { find: /^@nuralyui\/(.+)$/, replacement: '/src/shared/ui/nuraly-ui/src/components/$1' },
     ]
   },
   build:{
    assetsInlineLimit:0,
    
   },
   ssr:{
    noExternal:['monaco-editor']
   }
  },
});