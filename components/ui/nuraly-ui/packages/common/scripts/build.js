#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_COMPONENTS_DIR = path.join(__dirname, '../../../dist/components');
const DIST_DIR = path.join(__dirname, '../dist');
const PACKAGE_ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(PACKAGE_ROOT, 'src');

// Common components to include in the package
const COMMON_COMPONENTS = [
  'icon',
  'badge', 
  'divider',
  'label'
];

async function getPackageVersion() {
  const packageJsonPath = path.join(PACKAGE_ROOT, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);
  return packageJson.version;
}

async function build() {
  try {
    console.log('🚀 Building @nuralyui/common package...\n');

    // Clean dist directory
    console.log('🧹 Cleaning dist directory...');
    await fs.emptyDir(DIST_DIR);

    // Compile TypeScript files from packages/common/src
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

    // Check if dist/components exists
    if (!await fs.pathExists(DIST_COMPONENTS_DIR)) {
      console.error('❌ Error: dist/components not found. Please run "npm run build" first.');
      process.exit(1);
    }

    // Copy each common component
    for (const component of COMMON_COMPONENTS) {
      const sourcePath = path.join(DIST_COMPONENTS_DIR, component);
      const destPath = path.join(DIST_DIR, component);

      if (await fs.pathExists(sourcePath)) {
        console.log(`📦 Copying ${component}...`);
        await fs.copy(sourcePath, destPath, {
          filter: (src) => {
            // Exclude bundle files, only keep modular files
            return !src.includes('bundle.js') && !src.includes('.bundled.js');
          }
        });
      } else {
        console.warn(`⚠️  Warning: ${component} not found in dist/components`);
      }
    }

    // Note: Shared utilities (mixins, controllers, themes, utils) are now compiled
    // from packages/common/src/shared during the main TypeScript build
    // The compiled files will be in the dist folder automatically

    // Create main index.js that exports all components
    console.log('📝 Creating main index file...');
    const indexContent = COMMON_COMPONENTS
      .map(component => `export * from './${component}/index.js';`)
      .join('\n') + '\n';
    
    await fs.writeFile(path.join(DIST_DIR, 'index.js'), indexContent);

    // Create TypeScript declaration file
    const indexDtsContent = COMMON_COMPONENTS
      .map(component => `export * from './${component}/index.js';`)
      .join('\n') + '\n';
    
    await fs.writeFile(path.join(DIST_DIR, 'index.d.ts'), indexDtsContent);

    // Create re-export files for shared utilities (these will be compiled from src)
    console.log('📝 Creating shared utility re-export files...');
    
    // These files are compiled from the src/ folder during the main build
    // and copied from dist/shared during this build script
    
    // The source files (mixins.ts, controllers.ts, etc.) are in packages/common/src/
    // They get compiled to dist/ by TypeScript during the main build
    // Then this script copies from dist/shared to dist/ in the package

    // Create react.js that exports all React wrappers
    console.log('📝 Creating React exports file...');
    const reactContent = COMMON_COMPONENTS
      .map(component => `export * from './${component}/react.js';`)
      .join('\n') + '\n';
    
    await fs.writeFile(path.join(DIST_DIR, 'react.js'), reactContent);

    // Create react.d.ts
    const reactDtsContent = COMMON_COMPONENTS
      .map(component => `export * from './${component}/react.js';`)
      .join('\n') + '\n';
    
    await fs.writeFile(path.join(DIST_DIR, 'react.d.ts'), reactDtsContent);

    // Copy README and LICENSE if they exist
    const readmePath = path.join(PACKAGE_ROOT, 'README.md');
    if (await fs.pathExists(readmePath)) {
      await fs.copy(readmePath, path.join(DIST_DIR, 'README.md'));
    }

    const licensePath = path.join(__dirname, '../../../LICENSE');
    if (await fs.pathExists(licensePath)) {
      await fs.copy(licensePath, path.join(DIST_DIR, 'LICENSE'));
    }

    // Generate versions information
    console.log('📝 Generating versions information...');
    const versions = {};
    const versionsList = [];
    
    for (const component of COMMON_COMPONENTS) {
      const packagePath = path.join(DIST_COMPONENTS_DIR, component, 'package.json');
      if (await fs.pathExists(packagePath)) {
        const packageJson = await fs.readJson(packagePath);
        versions[component] = packageJson.version;
        versionsList.push(`- **${component}**: v${packageJson.version}`);
      }
    }

    // Create versions.json
    await fs.writeJson(path.join(DIST_DIR, 'versions.json'), versions, { spaces: 2 });

    // Create VERSIONS.md
    const versionsMarkdown = `# Component Versions

This package includes the following components with their respective versions:

${versionsList.join('\n')}

---

**Package Version**: ${await getPackageVersion()}
**Build Date**: ${new Date().toISOString().split('T')[0]}

## Usage

To check versions programmatically:

\`\`\`javascript
import versions from '@nuralyui/common/versions.json';

console.log(versions);
// Output: { icon: "0.0.7", badge: "0.0.1", divider: "0.0.4", label: "0.0.13" }
\`\`\`
`;

    await fs.writeFile(path.join(DIST_DIR, 'VERSIONS.md'), versionsMarkdown);

    console.log('\n✅ @nuralyui/common package built successfully!');
    console.log(`📂 Output: ${DIST_DIR}`);
    console.log('\n📦 Included components:');
    COMMON_COMPONENTS.forEach(comp => console.log(`   - ${comp}`));

  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
