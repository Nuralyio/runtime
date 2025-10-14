/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import gzipPlugin from 'rollup-plugin-gzip';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Helper to format bytes as human-readable
const formatBytes = (bytes) => {
  if (!bytes || bytes <= 0) return '0 B';
  const KB = 1024;
  const MB = KB * 1024;
  if (bytes >= MB) return `${(bytes / MB).toFixed(2)} MB`;
  if (bytes >= KB) return `${(bytes / KB).toFixed(2)} kB`;
  return `${bytes} B`;
};

// Custom summary that shows raw and gzip sizes in a single table per bundle
const gzipSummary = () => ({
  name: 'gzip-summary',
  generateBundle(outputOptions, bundle) {
    // Find the main JS and its gzip asset
    const files = Object.values(bundle);
    const js = files.find((f) => f.fileName && f.fileName.endsWith('bundle.js'));
    const jsBytes = js
      ? (js.type === 'chunk'
          ? Buffer.byteLength(js.code || '', 'utf8')
          : (typeof js.source === 'string' ? Buffer.byteLength(js.source, 'utf8') : (js.source?.byteLength || 0)))
      : 0;
    // Compute gzip size directly from JS code to ensure availability in summary
    const jsContent = js
      ? (js.type === 'chunk' ? (js.code || '') : (typeof js.source === 'string' ? js.source : (js.source?.toString('utf8') || '')))
      : '';
    let gzBytes = 0;
    try {
      const gzBuf = zlib.gzipSync(jsContent, { level: 9 });
      gzBytes = gzBuf.length;
    } catch (e) {
      gzBytes = 0;
    }

    const header = `Build summary for ${outputOptions.file} - es`;
    const rows = [
      ['File name', 'Size', 'Gzip'],
      ['---------', '----------', '----------'],
      ['bundle.js', formatBytes(jsBytes), formatBytes(gzBytes)],
    ];

    const colWidths = [
      Math.max(...rows.map((r) => r[0].length)),
      Math.max(...rows.map((r) => r[1].length)),
      Math.max(...rows.map((r) => r[2].length)),
    ];

    const pad = (str, len) => str + ' '.repeat(len - str.length);
    const line = (lhs, mid, rhs) => `│ ${pad(lhs, colWidths[0])} │ ${pad(mid, colWidths[1])} │ ${pad(rhs, colWidths[2])} │`;
    const top = `┌${'─'.repeat(colWidths[0] + 2)}┬${'─'.repeat(colWidths[1] + 2)}┬${'─'.repeat(colWidths[2] + 2)}┐`;
    const sep = `│ ${'-'.repeat(colWidths[0])} │ ${'-'.repeat(colWidths[1])} │ ${'-'.repeat(colWidths[2])} │`;
    const bot = `└${'─'.repeat(colWidths[0] + 2)}┴${'─'.repeat(colWidths[1] + 2)}┴${'─'.repeat(colWidths[2] + 2)}┘`;

    // Print table
    console.log('\n' + header);
    console.log(top);
    console.log(line(rows[0][0], rows[0][1], rows[0][2]));
    console.log(sep);
    console.log(line(rows[2][0], rows[2][1], rows[2][2]));
    console.log(bot + '\n');
  },
});

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
    // Minify HTML and CSS inside template literals (lit html`` and css``)
    minifyHTML({
      // aggressively minify CSS in css`` literals
      minifyCSS: true,
      // keep JS as-is; terser will handle it
      minifyJS: false,
    }),
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
    // Emit precompressed gzip alongside bundle.js -> bundle.js.gz
    // The default naming is <asset>.gz; use fileName to force bundle.js.gz for clarity
    gzipPlugin({
      minSize: 0,
      fileName: (assetInfo) => {
        // Always emit alongside the JS as bundle.js.gz
        return 'bundle.js.gz';
      },
    }),
    gzipSummary(),
  ],
});

export default components.map(createConfig);
