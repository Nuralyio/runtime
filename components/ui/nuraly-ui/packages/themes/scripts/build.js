#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const THEMES_DIR = path.join(__dirname, '../../../src/shared/themes');
const DIST_DIR = path.join(__dirname, '../dist');
const PACKAGE_ROOT = path.join(__dirname, '..');

// Theme configurations
const THEMES = {
  carbon: {
    name: 'carbon',
    files: [
      'theme.css',
      'index.css',
      'button/index.css',
      'button/common.css',
      'button/light.css', 
      'button/dark.css',
      'input/index.css',
      'input/common.css',
      'input/light.css',
      'input/dark.css',
      'icon/index.css',
      'icon/common.css',
      'icon/light.css',
      'icon/dark.css',
      'checkbox/index.css',
      'checkbox/common.css',
      'checkbox/light.css',
      'checkbox/dark.css',
      'radio/index.css',
      'radio/common.css',
      'radio/light.css',
      'radio/dark.css',
      'select/index.css',
      'select/common.css',
      'select/light.css',
      'select/dark.css',
      'textarea/index.css',
      'textarea/common.css',
      'textarea/light.css',
      'textarea/dark.css',
      'datepicker/index.css',
      'datepicker/common.css',
      'datepicker/light.css',
      'datepicker/dark.css',
      'timepicker/index.css',
      'timepicker/common.css',
      'timepicker/light.css',
      'timepicker/dark.css',
      'slider-input/index.css',
      'slider-input/common.css',
      'slider-input/light.css',
      'slider-input/dark.css',
      'label/index.css',
      'label/common.css',
      'label/light.css',
      'label/dark.css',
      'card/index.css',
      'card/common.css',
      'card/light.css',
      'card/dark.css',
      'dropdown/index.css',
      'dropdown/common.css',
      'dropdown/light.css',
      'dropdown/dark.css',
      'modal/index.css',
      'modal/common.css',
      'modal/light.css',
      'modal/dark.css',
      'tabs/index.css',
      'tabs/common.css',
      'tabs/light.css',
      'tabs/dark.css',
      'collapse/index.css',
      'collapse/common.css',
      'collapse/light.css',
      'collapse/dark.css',
      'colorpicker/index.css',
      'colorpicker/common.css',
      'colorpicker/light.css',
      'colorpicker/dark.css',
      // Tag component
      'tag/index.css',
      'tag/common.css',
      'tag/light.css',
      'tag/dark.css',
      // Chatbot component
      'chatbot/index.css',
      'chatbot/common.css',
      'chatbot/light.css',
      'chatbot/dark.css'
    ]
  },
  default: {
    name: 'default',
    files: [
      'theme.css',
      'index.css',
      'button/index.css',
      'button/common.css',
      'button/light.css',
      'button/dark.css',
      'input/index.css',
      'input/common.css',
      'input/light.css',
      'input/dark.css',
      'icon/index.css',
      'icon/common.css',
      'icon/light.css',
      'icon/dark.css',
      'checkbox/index.css',
      'checkbox/common.css',
      'checkbox/light.css',
      'checkbox/dark.css',
      'radio/index.css',
      'radio/common.css',
      'radio/light.css',
      'radio/dark.css',
      'select/index.css',
      'select/common.css',
      'select/light.css',
      'select/dark.css',
      'textarea/index.css',
      'textarea/common.css',
      'textarea/light.css',
      'textarea/dark.css',
      'datepicker/index.css',
      'datepicker/common.css',
      'datepicker/light.css',
      'datepicker/dark.css',
      'timepicker/index.css',
      'timepicker/common.css',
      'timepicker/light.css',
      'timepicker/dark.css',
      'slider-input/index.css',
      'slider-input/common.css',
      'slider-input/light.css',
      'slider-input/dark.css',
      'label/index.css',
      'label/common.css',
      'label/light.css',
      'label/dark.css',
      'card/index.css',
      'card/common.css',
      'card/light.css',
      'card/dark.css',
      'dropdown/index.css',
      'dropdown/common.css',
      'dropdown/light.css',
      'dropdown/dark.css',
      'modal/index.css',
      'modal/common.css',
      'modal/light.css',
      'modal/dark.css',
      'tabs/index.css',
      'tabs/common.css',
      'tabs/light.css',
      'tabs/dark.css',
      'collapse/index.css',
      'collapse/common.css',
      'collapse/light.css',
      'collapse/dark.css',
      'colorpicker/index.css',
      'colorpicker/common.css',
      'colorpicker/light.css',
      'colorpicker/dark.css',
      // Tag component
      'tag/index.css',
      'tag/common.css',
      'tag/light.css',
      'tag/dark.css',
      // Chatbot component
      'chatbot/index.css',
      'chatbot/common.css',
      'chatbot/light.css',
      'chatbot/dark.css'
    ]
  }
};

/**
 * Reads and concatenates CSS files for a theme
 */
async function bundleTheme(themeName, config) {
  console.log(`📦 Bundling ${themeName} theme...`);
  
  const themeDir = path.join(THEMES_DIR, themeName);
  let bundledContent = `/**\n * ${themeName.charAt(0).toUpperCase() + themeName.slice(1)} Theme Bundle\n * Generated automatically - do not edit directly\n * Source: src/shared/themes/${themeName}\n */\n\n`;
  
  for (const file of config.files) {
    const filePath = path.join(themeDir, file);
    
    if (await fs.pathExists(filePath)) {
      console.log(`  ✓ Adding ${file}`);
      const content = await fs.readFile(filePath, 'utf8');
      
      // Add file header comment
      bundledContent += `/* ==============================================\n`;
      bundledContent += ` * ${file}\n`;
      bundledContent += ` * ============================================== */\n\n`;
      
      // Process content - remove @import statements since we're bundling
      const processedContent = content
        .replace(/@import\s+['"][^'"]*['"];?\s*/g, '') // Remove @import statements
        .replace(/\/\*\*[\s\S]*?\*\//g, '') // Remove doc comments to reduce size
        .replace(/\/\*(?!\*)[\s\S]*?\*\//g, '') // Remove regular comments but keep /** doc comments for first pass
        .replace(/\n\s*\n\s*\n/g, '\n\n') // Reduce multiple empty lines
        .trim();
      
      if (processedContent) {
        bundledContent += processedContent + '\n\n';
      }
    } else {
      console.log(`  ⚠️  File not found: ${file}`);
    }
  }
  
  // Write bundled theme
  const outputPath = path.join(DIST_DIR, `${themeName}.css`);
  await fs.writeFile(outputPath, bundledContent);
  console.log(`  ✅ ${themeName}.css created (${(bundledContent.length / 1024).toFixed(1)}KB)`);
  
  return bundledContent.length;
}

/**
 * Creates the main index file that exports all themes
 */
async function createIndexFile() {
  console.log('📝 Creating index file...');
  
  const indexContent = `/**
 * @nuraly/themes - Main Export
 * Provides access to all available themes
 */

// Import individual themes
import './carbon.css';
import './polaris.css'; 
import './default.css';

/**
 * Available themes in this package
 */
export const themes = {
  carbon: 'carbon',
  polaris: 'polaris',
  default: 'default'
};

/**
 * Apply a theme to the document root
 * @param {string} themeName - Name of the theme to apply
 * @param {string} variant - Theme variant ('light' | 'dark')
 */
export function applyTheme(themeName, variant = 'light') {
  if (!themes[themeName]) {
    console.warn(\`Theme "\${themeName}" not found. Available themes: \${Object.keys(themes).join(', ')}\`);
    return;
  }
  
  const themeClass = variant === 'dark' ? \`\${themeName}-dark\` : \`\${themeName}-light\`;
  document.documentElement.setAttribute('data-theme', themeClass);
}

/**
 * Get the currently applied theme
 */
export function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'default-light';
}

export default {
  themes,
  applyTheme,
  getCurrentTheme
};
`;

  await fs.writeFile(path.join(DIST_DIR, 'index.js'), indexContent);
  
  // Also create a CommonJS version
  const cjsContent = indexContent.replace(/export/g, 'module.exports =').replace(/import/g, 'require');
  await fs.writeFile(path.join(DIST_DIR, 'index.cjs'), cjsContent);
  
  console.log('  ✅ index.js and index.cjs created');
}

/**
 * Main build function
 */
async function build() {
  console.log('🚀 Building @nuraly/themes package...\n');
  
  // Ensure dist directory exists
  await fs.ensureDir(DIST_DIR);
  
  // Clean existing files
  await fs.emptyDir(DIST_DIR);
  
  let totalSize = 0;
  
  // Bundle each theme
  for (const [themeName, config] of Object.entries(THEMES)) {
    const size = await bundleTheme(themeName, config);
    totalSize += size;
  }
  
  // Create index file
  await createIndexFile();
  
  // Copy and modify package.json for distribution
  const packageJson = await fs.readJson(path.join(PACKAGE_ROOT, 'package.json'));
  
  // Modify exports to remove dist/ prefix since we're publishing from dist
  const distPackageJson = {
    ...packageJson,
    main: "index.js",
    files: [
      "*.css",
      "*.js",
      "*.cjs", 
      "README.md"
    ],
    exports: {
      ".": {
        "import": "./index.js",
        "require": "./index.cjs"
      },
      "./carbon": {
        "import": "./carbon.css",
        "require": "./carbon.css"
      },
      "./polaris": {
        "import": "./polaris.css",
        "require": "./polaris.css"
      },
      "./default": {
        "import": "./default.css",
        "require": "./default.css"
      }
    }
  };
  
  await fs.writeJson(path.join(DIST_DIR, 'package.json'), distPackageJson, { spaces: 2 });
  
  // Copy README to dist for npm publishing
  const readmePath = path.join(PACKAGE_ROOT, 'README.md');
  if (await fs.pathExists(readmePath)) {
    await fs.copy(readmePath, path.join(DIST_DIR, 'README.md'));
    console.log('📄 README.md copied to dist');
  }
  
  console.log(`\n✨ Build complete! Total size: ${(totalSize / 1024).toFixed(1)}KB`);
  console.log(`📁 Output: ${DIST_DIR}`);
}

/**
 * Watch mode
 */
function watch() {
  console.log('👀 Watching for changes...');
  
  const watcher = chokidar.watch(THEMES_DIR, {
    ignored: /node_modules/,
    persistent: true
  });
  
  watcher.on('change', async (filePath) => {
    console.log(`🔄 File changed: ${path.relative(THEMES_DIR, filePath)}`);
    await build();
  });
  
  watcher.on('add', async (filePath) => {
    console.log(`➕ File added: ${path.relative(THEMES_DIR, filePath)}`);
    await build();
  });
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const isWatch = args.includes('--watch');
  
  try {
    await build();
    
    if (isWatch) {
      watch();
    }
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

main();