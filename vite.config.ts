import { defineConfig } from 'vite';
import { resolve } from 'path';

// Check if we're building the bundle version
const isBundleBuild = process.env.BUILD_BUNDLE === 'true';

export default defineConfig({
  define: {
    // Replace process.env.NODE_ENV with a static value for browser bundles
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  build: {
    target: 'esnext', // Support top-level await
    // Don't empty outDir on bundle build to preserve regular build artifacts
    emptyOutDir: !isBundleBuild,
    lib: {
      entry: isBundleBuild
        ? { 'micro-app.bundle': resolve(__dirname, 'micro-app-entry.ts') }
        : {
            runtime: resolve(__dirname, 'index.ts'),
            'micro-app': resolve(__dirname, 'micro-app-entry.ts')
          },
      formats: ['es']
    },
    rollupOptions: {
      external: (id) => {
        // For bundle build, externalize @nuralyui to avoid broken import issues
        // Users will need to load @nuralyui components separately
        if (isBundleBuild) {
          // Externalize node built-ins and @nuralyui packages (they have broken internal imports)
          return /^node:/.test(id) || id.startsWith('@nuralyui/');
        }

        // For regular builds, externalize all external dependencies and node_modules
        const externals = [
          'lit',
          'lit/',
          'nanostores',
          'rxjs',
          'rxjs/',
          'immer',
          'uuid',
          '@nuralyui/',
          '@nuraly/dbclient',
          'acorn',
          'acorn-walk',
          'fast-deep-equal'
        ];

        return externals.some(ext => id.startsWith(ext)) ||
               id.includes('node_modules');
      },
      output: {
        // Always output to local dist folder for publishing
        dir: resolve(__dirname, 'dist'),
        format: 'es',
        globals: isBundleBuild ? {} : {
          lit: 'Lit',
          nanostores: 'Nanostores',
          rxjs: 'rxjs',
          immer: 'Immer'
        }
      }
    },
    // Increase chunk size warning limit for bundle build
    chunkSizeWarningLimit: isBundleBuild ? 2000 : 500,
    // Minify bundle build for smaller size
    minify: isBundleBuild ? 'esbuild' : false
  },
  resolve: {
    alias: [
      { find: '@', replacement: resolve(__dirname, './') },
      // Resolve dependencies from the main studio node_modules
      { find: 'lit', replacement: resolve(__dirname, '../../../node_modules/lit') },
      { find: 'nanostores', replacement: resolve(__dirname, '../../../node_modules/nanostores') },
      { find: 'rxjs', replacement: resolve(__dirname, '../../../node_modules/rxjs') },
      { find: 'immer', replacement: resolve(__dirname, '../../../node_modules/immer') },
      { find: 'uuid', replacement: resolve(__dirname, '../../../node_modules/uuid') },
      { find: 'acorn', replacement: resolve(__dirname, '../../../node_modules/acorn') },
      { find: 'acorn-walk', replacement: resolve(__dirname, '../../../node_modules/acorn-walk') },
      { find: 'fast-deep-equal', replacement: resolve(__dirname, '../../../node_modules/fast-deep-equal') },
      // Resolve all nuralyui packages using a regex pattern
      { find: /^@nuralyui\/(.*)$/, replacement: resolve(__dirname, '../../../node_modules/@nuralyui/$1') }
    ]
  }
});
