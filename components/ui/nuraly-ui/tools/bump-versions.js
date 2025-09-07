#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findPackageJsonFiles(dir, results = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findPackageJsonFiles(fullPath, results);
    } else if (file === 'package.json') {
      results.push(fullPath);
    }
  }
  
  return results;
}

function bumpVersion(version) {
  const parts = version.split('.');
  if (parts.length !== 3) {
    throw new Error(`Invalid version format: ${version}`);
  }
  
  // Increment patch version
  parts[2] = (parseInt(parts[2]) + 1).toString();
  return parts.join('.');
}

function updatePackageJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const packageData = JSON.parse(content);
    
    if (packageData.version) {
      const oldVersion = packageData.version;
      const newVersion = bumpVersion(oldVersion);
      packageData.version = newVersion;
      
      fs.writeFileSync(filePath, JSON.stringify(packageData, null, 2) + '\n');
      console.log(`Updated ${filePath}: ${oldVersion} -> ${newVersion}`);
      return true;
    } else {
      console.log(`Skipped ${filePath}: No version field found`);
      return false;
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  // Go up one directory from tools to reach the project root
  const rootDir = path.join(__dirname, '..');
  console.log(`Searching for package.json files in: ${rootDir}`);
  
  const packageFiles = findPackageJsonFiles(rootDir);
  console.log(`Found ${packageFiles.length} package.json files\n`);
  
  let updatedCount = 0;
  
  for (const filePath of packageFiles) {
    if (updatePackageJson(filePath)) {
      updatedCount++;
    }
  }
  
  console.log(`\nSummary: Updated ${updatedCount} of ${packageFiles.length} package.json files`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
