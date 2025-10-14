#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_COMPONENTS_DIR = path.join(__dirname, '../../../dist/components');

// Common components to check
const COMMON_COMPONENTS = [
  'icon',
  'badge', 
  'divider',
  'label'
];

async function getVersions() {
  console.log('📦 @nuralyui/common - Component Versions\n');
  console.log('═'.repeat(50));
  
  const versions = {};
  
  for (const component of COMMON_COMPONENTS) {
    const packagePath = path.join(DIST_COMPONENTS_DIR, component, 'package.json');
    
    if (await fs.pathExists(packagePath)) {
      const packageJson = await fs.readJson(packagePath);
      versions[component] = packageJson.version;
      console.log(`  ${component.padEnd(15)} v${packageJson.version}`);
    } else {
      console.log(`  ${component.padEnd(15)} ⚠️  Not found`);
    }
  }
  
  console.log('═'.repeat(50));
  console.log('\n✨ These versions are bundled in @nuralyui/common\n');
  
  return versions;
}

getVersions().catch(console.error);
