/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import summary from 'rollup-plugin-summary';
import {terser} from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets';
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';
import url from '@rollup/plugin-url';
import virtual from '@rollup/plugin-virtual';

export default {
  input: 'dist/components/button/hy-button.js',
  output: {
    file: 'hy-button.bundled.js',
    format: 'esm',
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
};
