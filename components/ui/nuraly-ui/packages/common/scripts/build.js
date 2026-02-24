#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_COMPONENTS_DIR = path.join(__dirname, '../../../dist/src/components');
const DIST_DIR = path.join(__dirname, '../dist');
const PACKAGE_ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(PACKAGE_ROOT, 'src');

async function getPackageVersion() {
  const packageJsonPath = path.join(PACKAGE_ROOT, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);
  return packageJson.version;
}

async function build() {
  try {
    console.log('🚀 Building @nuralyui/common package...\n');

    // Check if dist folder exists (should be created by tsc -p packages/common/tsconfig.json)
    if (!await fs.pathExists(path.join(DIST_DIR, 'shared'))) {
      console.log('🔨 Compiling TypeScript files...');
      try {
        execSync('tsc -p .', { 
          cwd: PACKAGE_ROOT,
          stdio: 'inherit'
        });
        console.log('✅ TypeScript compilation completed\n');
      } catch (error) {
        console.error('❌ TypeScript compilation failed');
        throw error;
      }
    } else {
      console.log('✅ TypeScript already compiled\n');
    }

    // Nothing else to do: the TypeScript build emits dist and our subpath
    // index.ts files ensure dist/<name>/index.js exists without hacks.

    // Copy README and LICENSE if they exist
    const readmePath = path.join(PACKAGE_ROOT, 'README.md');
    if (await fs.pathExists(readmePath)) {
      await fs.copy(readmePath, path.join(DIST_DIR, 'README.md'));
    }

    const licensePath = path.join(__dirname, '../../../LICENSE');
    if (await fs.pathExists(licensePath)) {
      await fs.copy(licensePath, path.join(DIST_DIR, 'LICENSE'));
    }

    // Optionally generate a simple VERSIONS.md with package version only
    const versionsMarkdown = `# @nuralyui/common\n\nVersion: ${await getPackageVersion()}\nBuild Date: ${new Date().toISOString().split('T')[0]}\n`;
    await fs.writeFile(path.join(DIST_DIR, 'VERSIONS.md'), versionsMarkdown);

    console.log('\n✅ @nuralyui/common package built successfully!');
    console.log(`📂 Output: ${DIST_DIR}`);
  // Components are no longer mirrored into common; import them directly from their own packages.

  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
