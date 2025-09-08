/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import summary from 'rollup-plugin-summary';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';

const components = [
  'button', 'input', 'datepicker', 'icon', 'dropdown', 'image', 'tabs', 
  'document', 'menu', 'radio', 'select', 'tooltips', 'colorpicker', 'modal', 
  'checkbox', 'video', 'table', 'slider-input', 'collapse', 'label', 
  'divider', 'canvas', 'chatbot', 'file-upload', 'card', 'carousel', 'toast'
];

const createConfig = (component) => ({
  input: `dist/components/${component}/index.js`,
  output: {
    file: `dist/components/${component}/bundle.js`,
    format: 'esm',
    inlineDynamicImports: true,
  },
  onwarn(warning) {
    if (warning.code !== 'THIS_IS_UNDEFINED') {
      console.error(`(!) ${warning.message}`);
    }
  },
  plugins: [
    replace({'Reflect.decorate': 'undefined'}),
    resolve(),
    terser({
      ecma: 2017,
      module: true,
      warnings: true,
      mangle: {
        properties: {
          regex: /^__/,
        },
      },
    }),
    summary(),
  ],
});

export default components.map(createConfig);
