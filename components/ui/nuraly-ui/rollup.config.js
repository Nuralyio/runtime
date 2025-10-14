/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import summary from 'rollup-plugin-summary';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import fs from 'fs';
import path from 'path';

// Discover components dynamically from built JS in dist/components
const distComponentsDir = path.join(process.cwd(), 'dist', 'components');
let components = [];
try {
  components = fs
    .readdirSync(distComponentsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .filter((d) => fs.existsSync(path.join(distComponentsDir, d.name, 'index.js')))
    .map((d) => d.name)
    .sort();
} catch (e) {
  // If dist not built yet, fallback to previous static list
  components = [
  ];
}

const createConfig = (component) => ({
  input: `dist/components/${component}/index.js`,
  output: {
    file: `dist/components/${component}/bundle.js`,
    format: 'esm',
    inlineDynamicImports: true,
  },
  // Externalize shared deps so they are loaded once by the host (lean bundles)
  external: (id) => (
    id === 'lit' || id.startsWith('lit/') ||
    id === '@nuralyui/common' || id.startsWith('@nuralyui/common/')
  ),
  onwarn(warning) {
    if (warning.code !== 'THIS_IS_UNDEFINED') {
      console.error(`(!) ${warning.message}`);
    }
  },
  plugins: [
    replace({ 'Reflect.decorate': 'undefined', preventAssignment: true }),
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
