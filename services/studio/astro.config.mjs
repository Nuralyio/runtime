import { defineConfig } from 'astro/config';
import react from "@astrojs/react";
import lit from "@astrojs/lit";
import worker from "@astropub/worker";
import yaml from '@rollup/plugin-yaml';
import { fileURLToPath } from 'url';
import path from 'path';

import node from "@astrojs/node";

import compressor from "astro-compressor";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nuralyUIPath = path.resolve(__dirname, 'src/features/runtime/components/ui/nuraly-ui/src/components');

// https://astro.build/config
export default defineConfig({
  integrations: [react(), lit(),  worker(), compressor()],
  output: "server",
  adapter: node({
    mode: "standalone"
  }),
  server: {
    port: 3000,
    host: true
  },
  vite: {
   plugins: [yaml()],
   resolve: {
     dedupe: ['dayjs', 'lit', 'lucide', 'vanilla-colorful', '@lit/reactive-element', '@lit/localize'],
     alias: {
       '@nuralyui/alert': path.join(nuralyUIPath, 'alert'),
       '@nuralyui/badge': path.join(nuralyUIPath, 'badge'),
       '@nuralyui/breadcrumb': path.join(nuralyUIPath, 'breadcrumb'),
       '@nuralyui/button': path.join(nuralyUIPath, 'button'),
       '@nuralyui/canvas': path.join(nuralyUIPath, 'canvas'),
       '@nuralyui/card': path.join(nuralyUIPath, 'card'),
       '@nuralyui/chatbot': path.join(nuralyUIPath, 'chatbot'),
       '@nuralyui/checkbox': path.join(nuralyUIPath, 'checkbox'),
       '@nuralyui/collapse': path.join(nuralyUIPath, 'collapse'),
       '@nuralyui/color-picker': path.join(nuralyUIPath, 'colorpicker'),
       '@nuralyui/datepicker': path.join(nuralyUIPath, 'datepicker'),
       '@nuralyui/divider': path.join(nuralyUIPath, 'divider'),
       '@nuralyui/document': path.join(nuralyUIPath, 'document'),
       '@nuralyui/dropdown': path.join(nuralyUIPath, 'dropdown'),
       '@nuralyui/file-upload': path.join(nuralyUIPath, 'file-upload'),
       '@nuralyui/flex': path.join(nuralyUIPath, 'flex'),
       '@nuralyui/forms': path.join(nuralyUIPath, 'form'),
       '@nuralyui/grid': path.join(nuralyUIPath, 'grid'),
       '@nuralyui/icon': path.join(nuralyUIPath, 'icon'),
       '@nuralyui/image': path.join(nuralyUIPath, 'image'),
       '@nuralyui/input': path.join(nuralyUIPath, 'input'),
       '@nuralyui/label': path.join(nuralyUIPath, 'label'),
       '@nuralyui/layout': path.join(nuralyUIPath, 'layout'),
       '@nuralyui/menu': path.join(nuralyUIPath, 'menu'),
       '@nuralyui/modal': path.join(nuralyUIPath, 'modal'),
       '@nuralyui/panel': path.join(nuralyUIPath, 'panel'),
       '@nuralyui/popconfirm': path.join(nuralyUIPath, 'popconfirm'),
       '@nuralyui/radio': path.join(nuralyUIPath, 'radio'),
       '@nuralyui/select': path.join(nuralyUIPath, 'select'),
       '@nuralyui/skeleton': path.join(nuralyUIPath, 'skeleton'),
       '@nuralyui/slider-input': path.join(nuralyUIPath, 'slider-input'),
       '@nuralyui/table': path.join(nuralyUIPath, 'table'),
       '@nuralyui/tabs': path.join(nuralyUIPath, 'tabs'),
       '@nuralyui/tag': path.join(nuralyUIPath, 'tag'),
       '@nuralyui/textarea': path.join(nuralyUIPath, 'textarea'),
       '@nuralyui/timeline': path.join(nuralyUIPath, 'timeline'),
       '@nuralyui/toast': path.join(nuralyUIPath, 'toast'),
       '@nuralyui/video': path.join(nuralyUIPath, 'video'),
       '@nuralyui/radio-group': path.join(nuralyUIPath, 'radio-group'),
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