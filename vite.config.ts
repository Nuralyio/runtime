import { defineConfig } from 'vite';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Check if we're building the bundle version
const isBundleBuild = process.env.BUILD_BUNDLE === 'true';

// Helper to find node_modules - check local first, then parent (for monorepo)
function findNodeModule(moduleName: string): string {
  const localPath = resolve(__dirname, 'node_modules', moduleName);
  const parentPath = resolve(__dirname, '../../../node_modules', moduleName);

  // Prefer local node_modules (standalone build), fallback to parent (monorepo)
  if (existsSync(localPath)) {
    return localPath;
  }
  return parentPath;
}

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
      // Resolve dependencies - automatically finds local or parent node_modules
      { find: 'lit', replacement: findNodeModule('lit') },
      { find: 'nanostores', replacement: findNodeModule('nanostores') },
      { find: 'rxjs', replacement: findNodeModule('rxjs') },
      { find: 'immer', replacement: findNodeModule('immer') },
      { find: 'uuid', replacement: findNodeModule('uuid') },
      { find: 'acorn', replacement: findNodeModule('acorn') },
      { find: 'acorn-walk', replacement: findNodeModule('acorn-walk') },
      { find: 'fast-deep-equal', replacement: findNodeModule('fast-deep-equal') },
      // Resolve all nuralyui packages - check local first, then parent
      {
        find: /^@nuralyui\/(.*)$/,
        replacement: existsSync(resolve(__dirname, 'node_modules/@nuralyui'))
          ? resolve(__dirname, 'node_modules/@nuralyui/$1')
          : resolve(__dirname, '../../../node_modules/@nuralyui/$1')
      }
    ]
  }
});
