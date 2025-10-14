#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_COMPONENTS_DIR = path.join(__dirname, '../../../dist/components');
const DIST_DIR = path.join(__dirname, '../dist');
const PACKAGE_ROOT = path.join(__dirname, '..');

// Layout components to include in the package
const LAYOUT_COMPONENTS = [
  'layout',
  'grid',
  'flex',
  'card'
];

async function getPackageVersion() {
  const packageJsonPath = path.join(PACKAGE_ROOT, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);
  return packageJson.version;
}

async function build() {
  try {
    console.log('🚀 Building @nuralyui/layout package...\n');

    // Clean dist directory
    console.log('🧹 Cleaning dist directory...');
    await fs.emptyDir(DIST_DIR);

    // Check if dist/components exists
    if (!await fs.pathExists(DIST_COMPONENTS_DIR)) {
      console.error('❌ Error: dist/components not found. Please run "npm run build" first.');
      process.exit(1);
    }

    // Copy each layout component
    for (const component of LAYOUT_COMPONENTS) {
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

    // Create main index.js that exports all components
    console.log('📝 Creating main index file...');
    const indexContent = LAYOUT_COMPONENTS
      .map(component => `export * from './${component}/index.js';`)
      .join('\n') + '\n';
    
    await fs.writeFile(path.join(DIST_DIR, 'index.js'), indexContent);

    // Create TypeScript declaration file
    const indexDtsContent = LAYOUT_COMPONENTS
      .map(component => `export * from './${component}/index.js';`)
      .join('\n') + '\n';
    
    await fs.writeFile(path.join(DIST_DIR, 'index.d.ts'), indexDtsContent);

    // Create react.js that exports all React wrappers
    console.log('📝 Creating React exports file...');
    const reactContent = LAYOUT_COMPONENTS
      .map(component => `export * from './${component}/react.js';`)
      .join('\n') + '\n';
    
    await fs.writeFile(path.join(DIST_DIR, 'react.js'), reactContent);

    // Create react.d.ts
    const reactDtsContent = LAYOUT_COMPONENTS
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
    
    for (const component of LAYOUT_COMPONENTS) {
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

This package includes the following layout components with their respective versions:

${versionsList.join('\n')}

---

**Package Version**: ${await getPackageVersion()}
**Build Date**: ${new Date().toISOString().split('T')[0]}
`;

    await fs.writeFile(path.join(DIST_DIR, 'VERSIONS.md'), versionsMarkdown);

    console.log('\n✅ @nuralyui/layout package built successfully!');
    console.log(`📂 Output: ${DIST_DIR}`);
    console.log('\n📦 Included components:');
    LAYOUT_COMPONENTS.forEach(comp => console.log(`   - ${comp}`));

  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
