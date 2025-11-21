#!/usr/bin/env ts-node
/**
 * Component Verification Script
 *
 * This script verifies that studio component parameters are aligned with NuralyUI library components.
 * It checks:
 * - Property definitions (config.json vs .component.ts @property decorators)
 * - Type definitions (select options vs TypeScript enums/types)
 * - CSS variables (theme.json vs .style.variables.ts)
 *
 * Usage: ts-node verify-components.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface StudioProperty {
  name: string;
  label: string;
  type: string;
  default: any;
  options?: Array<{ label: string; value: string }>;
}

interface StudioConfig {
  [key: string]: {
    properties: StudioProperty[];
  };
}

interface ThemeItem {
  label: string;
  cssVar: string;
  type?: string;
}

interface ThemeGroup {
  name: string;
  open: boolean;
  items: (ThemeItem | ThemeGroup)[];
}

interface StudioTheme {
  theme: {
    modes: ThemeGroup[];
  };
}

interface NuralyProperty {
  name: string;
  type: string;
  default?: any;
  reflect?: boolean;
}

interface ComponentMapping {
  studioPath: string;
  nuralyComponent: string;
  configKey?: string;  // Key in config.json (e.g., "buttonFields", "textLabelFields")
}

interface VerificationIssue {
  severity: 'error' | 'warning' | 'info';
  category: 'property' | 'type' | 'css-variable' | 'mapping';
  message: string;
  details?: string;
}

interface ComponentReport {
  studioComponent: string;
  nuralyComponent: string;
  status: 'aligned' | 'minor-issues' | 'major-issues' | 'missing-mapping';
  issues: VerificationIssue[];
  propertiesChecked: number;
  cssVariablesChecked: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const STUDIO_PARAMS_BASE = '/home/user/studio/src/features/studio/params';
const NURALY_COMPONENTS_BASE = '/home/user/studio/src/shared/ui/nuraly-ui/src/components';

const COMPONENT_MAPPINGS: ComponentMapping[] = [
  // Inputs
  { studioPath: 'inputs/text-label', nuralyComponent: 'label', configKey: 'textLabelFields' },
  { studioPath: 'inputs/checkbox', nuralyComponent: 'checkbox', configKey: 'checkboxFields' },
  { studioPath: 'inputs/select', nuralyComponent: 'select', configKey: 'selectFields' },
  { studioPath: 'inputs/datepicker', nuralyComponent: 'datepicker', configKey: 'datepickerFields' },
  { studioPath: 'inputs/text-input', nuralyComponent: 'input', configKey: 'textInputFields' },
  { studioPath: 'inputs/textarea', nuralyComponent: 'textarea', configKey: 'textareaFields' },
  { studioPath: 'inputs/slider', nuralyComponent: 'slider-input', configKey: 'sliderFields' },

  // Navigation
  { studioPath: 'navigation/button', nuralyComponent: 'button', configKey: 'buttonFields' },
  { studioPath: 'navigation/link', nuralyComponent: 'button', configKey: 'linkFields' },  // Links use button with variant
  { studioPath: 'navigation/dropdown', nuralyComponent: 'dropdown', configKey: 'dropdownFields' },

  // Media
  { studioPath: 'media/icon', nuralyComponent: 'icon', configKey: 'iconFields' },
  { studioPath: 'media/image', nuralyComponent: 'image', configKey: 'imageFields' },
  { studioPath: 'media/video', nuralyComponent: 'video', configKey: 'videoFields' },
  { studioPath: 'media/file-upload', nuralyComponent: 'file-upload', configKey: 'fileUploadFields' },

  // Layout
  { studioPath: 'layout/container', nuralyComponent: 'flex', configKey: 'containerFields' },  // Check if flex or grid
  { studioPath: 'layout/card', nuralyComponent: 'card', configKey: 'cardFields' },

  // Content
  { studioPath: 'content/document', nuralyComponent: 'document', configKey: 'documentFields' },

  // Data
  { studioPath: 'data/menu', nuralyComponent: 'menu', configKey: 'menuFields' },
  { studioPath: 'data/table', nuralyComponent: 'table', configKey: 'tableFields' },

  // Display
  { studioPath: 'display/badge', nuralyComponent: 'badge', configKey: 'badgeFields' },
  { studioPath: 'display/tag', nuralyComponent: 'tag', configKey: 'tagFields' },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function readJsonFile(filePath: string): any {
  if (!fileExists(filePath)) {
    return null;
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading JSON file ${filePath}:`, error);
    return null;
  }
}

function readTextFile(filePath: string): string | null {
  if (!fileExists(filePath)) {
    return null;
  }
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

// ============================================================================
// PARSERS
// ============================================================================

/**
 * Parse studio config.json to extract properties
 */
function parseStudioConfig(configPath: string, configKey?: string): StudioProperty[] {
  const config = readJsonFile(configPath) as StudioConfig;
  if (!config) return [];

  // If configKey is provided, use it; otherwise try to find the first key that contains "Fields"
  let properties: StudioProperty[] = [];

  if (configKey && config[configKey]) {
    properties = config[configKey].properties || [];
  } else {
    // Try to find the config key automatically
    const keys = Object.keys(config);
    const fieldsKey = keys.find(key => key.endsWith('Fields'));
    if (fieldsKey && config[fieldsKey]) {
      properties = config[fieldsKey].properties || [];
    }
  }

  return properties;
}

/**
 * Parse NuralyUI component .component.ts file to extract @property decorators
 */
function parseNuralyComponent(componentPath: string): NuralyProperty[] {
  const content = readTextFile(componentPath);
  if (!content) return [];

  const properties: NuralyProperty[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Look for @property decorator
    if (line.startsWith('@property')) {
      // Extract property configuration
      const propertyConfig: any = {};

      // Parse the decorator parameters
      const decoratorMatch = line.match(/@property\((.*?)\)/);
      if (decoratorMatch) {
        const params = decoratorMatch[1];
        propertyConfig.reflect = params.includes('reflect: true');

        // Extract type from decorator if present
        const typeMatch = params.match(/type:\s*(\w+)/);
        if (typeMatch) {
          propertyConfig.decoratorType = typeMatch[1];
        }
      }

      // Get the next line which should contain the property declaration
      i++;
      if (i < lines.length) {
        const propLine = lines[i].trim();
        const propMatch = propLine.match(/^(\w+)(\?)?:\s*([^=]+?)(\s*=\s*(.+?))?;?$/);

        if (propMatch) {
          const [, name, optional, type, , defaultValue] = propMatch;
          properties.push({
            name: name.trim(),
            type: type.trim(),
            default: defaultValue?.trim().replace(/;$/, ''),
            reflect: propertyConfig.reflect
          });
        }
      }
    }
  }

  return properties;
}

/**
 * Parse TypeScript types/enums from .types.ts file
 */
function parseTypeDefinitions(typesPath: string): Record<string, string[]> {
  const content = readTextFile(typesPath);
  if (!content) return {};

  const typeDefinitions: Record<string, string[]> = {};
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Match enum definitions: export const enum ButtonType {
    const enumMatch = line.match(/export\s+(?:const\s+)?enum\s+(\w+)\s*\{/);
    if (enumMatch) {
      const enumName = enumMatch[1];
      const values: string[] = [];

      // Read enum values
      i++;
      while (i < lines.length) {
        const enumLine = lines[i].trim();
        if (enumLine === '}') break;

        // Match: Primary = 'primary',
        const valueMatch = enumLine.match(/^\w+\s*=\s*['"]([^'"]+)['"]/);
        if (valueMatch) {
          values.push(valueMatch[1]);
        }
        i++;
      }

      typeDefinitions[enumName] = values;
    }

    // Match type definitions: export type LabelSize = 'small' | 'medium' | 'large';
    const typeMatch = line.match(/export\s+type\s+(\w+)\s*=\s*(.+);/);
    if (typeMatch) {
      const typeName = typeMatch[1];
      const typeValue = typeMatch[2];

      // Extract string literals from union type
      const literals = typeValue.match(/'([^']+)'/g);
      if (literals) {
        typeDefinitions[typeName] = literals.map(lit => lit.replace(/'/g, ''));
      }
    }
  }

  return typeDefinitions;
}

/**
 * Parse studio theme.json to extract CSS variables
 */
function parseStudioTheme(themePath: string): string[] {
  const theme = readJsonFile(themePath) as StudioTheme;
  if (!theme || !theme.theme) return [];

  const cssVars: string[] = [];

  function extractCssVars(items: (ThemeItem | ThemeGroup)[]) {
    for (const item of items) {
      if ('cssVar' in item) {
        cssVars.push(item.cssVar);
      } else if ('items' in item) {
        extractCssVars(item.items);
      }
    }
  }

  if (theme.theme.modes) {
    theme.theme.modes.forEach(mode => extractCssVars(mode.items));
  }

  return cssVars;
}

/**
 * Parse NuralyUI .style.variables.ts to extract CSS variables
 */
function parseNuralyStyleVariables(variablesPath: string): string[] {
  const content = readTextFile(variablesPath);
  if (!content) return [];

  const cssVars: string[] = [];
  const varRegex = /--([\w-]+):/g;
  let match;

  while ((match = varRegex.exec(content)) !== null) {
    cssVars.push(`--${match[1]}`);
  }

  return cssVars;
}

// ============================================================================
// VERIFICATION FUNCTIONS
// ============================================================================

/**
 * Verify a single component
 */
function verifyComponent(mapping: ComponentMapping): ComponentReport {
  const studioConfigPath = path.join(STUDIO_PARAMS_BASE, mapping.studioPath, 'config.json');
  const studioThemePath = path.join(STUDIO_PARAMS_BASE, mapping.studioPath, 'theme.json');

  const nuralyComponentPath = path.join(NURALY_COMPONENTS_BASE, mapping.nuralyComponent, `${mapping.nuralyComponent}.component.ts`);
  const nuralyTypesPath = path.join(NURALY_COMPONENTS_BASE, mapping.nuralyComponent, `${mapping.nuralyComponent}.types.ts`);
  const nuralyVariablesPath = path.join(NURALY_COMPONENTS_BASE, mapping.nuralyComponent, `${mapping.nuralyComponent}.style.variables.ts`);

  const report: ComponentReport = {
    studioComponent: mapping.studioPath,
    nuralyComponent: mapping.nuralyComponent,
    status: 'aligned',
    issues: [],
    propertiesChecked: 0,
    cssVariablesChecked: 0
  };

  // Check if files exist
  if (!fileExists(studioConfigPath)) {
    report.issues.push({
      severity: 'error',
      category: 'mapping',
      message: 'Studio config.json not found',
      details: studioConfigPath
    });
    report.status = 'missing-mapping';
    return report;
  }

  if (!fileExists(nuralyComponentPath)) {
    report.issues.push({
      severity: 'error',
      category: 'mapping',
      message: 'NuralyUI component file not found',
      details: nuralyComponentPath
    });
    report.status = 'missing-mapping';
    return report;
  }

  // Parse files
  const studioProps = parseStudioConfig(studioConfigPath, mapping.configKey);
  const nuralyProps = parseNuralyComponent(nuralyComponentPath);
  const typeDefinitions = fileExists(nuralyTypesPath) ? parseTypeDefinitions(nuralyTypesPath) : {};

  report.propertiesChecked = studioProps.length;

  // Create maps for easier lookup
  const studioPropsMap = new Map(studioProps.map(p => [p.name, p]));
  const nuralyPropsMap = new Map(nuralyProps.map(p => [p.name, p]));

  // Check for properties in studio that don't exist in NuralyUI
  for (const studioProp of studioProps) {
    const nuralyProp = nuralyPropsMap.get(studioProp.name);

    if (!nuralyProp) {
      report.issues.push({
        severity: 'warning',
        category: 'property',
        message: `Property "${studioProp.name}" exists in studio but not in NuralyUI component`,
        details: `Studio type: ${studioProp.type}, Default: ${studioProp.default}`
      });
    } else {
      // Check for type mismatches (basic check)
      const studioType = mapStudioTypeToTS(studioProp.type);
      const nuralyType = normalizeType(nuralyProp.type);

      if (!areTypesCompatible(studioType, nuralyType)) {
        report.issues.push({
          severity: 'warning',
          category: 'type',
          message: `Type mismatch for property "${studioProp.name}"`,
          details: `Studio: ${studioType}, NuralyUI: ${nuralyType}`
        });
      }

      // Check default values
      if (studioProp.default !== undefined && nuralyProp.default !== undefined) {
        const normalizedStudioDefault = normalizeDefault(studioProp.default);
        const normalizedNuralyDefault = normalizeDefault(nuralyProp.default);

        if (normalizedStudioDefault !== normalizedNuralyDefault) {
          report.issues.push({
            severity: 'info',
            category: 'property',
            message: `Different default value for "${studioProp.name}"`,
            details: `Studio: ${normalizedStudioDefault}, NuralyUI: ${normalizedNuralyDefault}`
          });
        }
      }
    }

    // Verify select options against type definitions
    if (studioProp.type === 'select' && studioProp.options) {
      const studioOptions = studioProp.options.map(opt => opt.value);

      // Try to find matching type definition
      const propName = studioProp.name;
      const capitalizedProp = propName.charAt(0).toUpperCase() + propName.slice(1);

      // Try different naming conventions for the type
      const possibleTypeNames = [
        capitalizedProp,
        `${mapping.nuralyComponent.charAt(0).toUpperCase() + mapping.nuralyComponent.slice(1)}${capitalizedProp}`,
        // Remove common suffixes and try again
        capitalizedProp.replace(/Type$/, ''),
      ];

      for (const typeName of possibleTypeNames) {
        if (typeDefinitions[typeName]) {
          const typeValues = typeDefinitions[typeName];

          // Check for missing options
          const missingInStudio = typeValues.filter(v => !studioOptions.includes(v));
          const extraInStudio = studioOptions.filter(v => !typeValues.includes(v));

          if (missingInStudio.length > 0) {
            report.issues.push({
              severity: 'warning',
              category: 'type',
              message: `Property "${studioProp.name}" missing options in studio config`,
              details: `Missing: ${missingInStudio.join(', ')} (from ${typeName} type)`
            });
          }

          if (extraInStudio.length > 0) {
            report.issues.push({
              severity: 'warning',
              category: 'type',
              message: `Property "${studioProp.name}" has extra options in studio config`,
              details: `Extra: ${extraInStudio.join(', ')} (not in ${typeName} type)`
            });
          }

          break; // Found matching type, stop looking
        }
      }
    }
  }

  // Check for properties in NuralyUI that don't exist in studio
  for (const nuralyProp of nuralyProps) {
    if (!studioPropsMap.has(nuralyProp.name)) {
      // Some properties might be internal or not exposed in studio, so this is just info
      report.issues.push({
        severity: 'info',
        category: 'property',
        message: `Property "${nuralyProp.name}" exists in NuralyUI but not exposed in studio`,
        details: `Type: ${nuralyProp.type}, Default: ${nuralyProp.default || 'undefined'}`
      });
    }
  }

  // Verify CSS variables
  if (fileExists(studioThemePath)) {
    const studioCssVars = parseStudioTheme(studioThemePath);
    report.cssVariablesChecked = studioCssVars.length;

    if (fileExists(nuralyVariablesPath)) {
      const nuralyCssVars = parseNuralyStyleVariables(nuralyVariablesPath);

      const studioCssVarsSet = new Set(studioCssVars);
      const nuralyCssVarsSet = new Set(nuralyCssVars);

      // Check for missing CSS vars
      const missingInStudio = nuralyCssVars.filter(v => !studioCssVarsSet.has(v));
      const extraInStudio = studioCssVars.filter(v => !nuralyCssVarsSet.has(v));

      if (missingInStudio.length > 0 && missingInStudio.length <= 10) {
        report.issues.push({
          severity: 'warning',
          category: 'css-variable',
          message: `Missing CSS variables in studio theme.json`,
          details: `Count: ${missingInStudio.length}, Variables: ${missingInStudio.join(', ')}`
        });
      } else if (missingInStudio.length > 10) {
        report.issues.push({
          severity: 'warning',
          category: 'css-variable',
          message: `Missing many CSS variables in studio theme.json`,
          details: `Count: ${missingInStudio.length} (too many to list)`
        });
      }

      if (extraInStudio.length > 0 && extraInStudio.length <= 10) {
        report.issues.push({
          severity: 'info',
          category: 'css-variable',
          message: `Extra CSS variables in studio theme.json`,
          details: `Count: ${extraInStudio.length}, Variables: ${extraInStudio.join(', ')}`
        });
      } else if (extraInStudio.length > 10) {
        report.issues.push({
          severity: 'info',
          category: 'css-variable',
          message: `Extra CSS variables in studio theme.json`,
          details: `Count: ${extraInStudio.length} (too many to list)`
        });
      }
    } else {
      report.issues.push({
        severity: 'info',
        category: 'css-variable',
        message: 'NuralyUI component does not have style.variables.ts file',
        details: 'CSS variables cannot be verified'
      });
    }
  }

  // Determine overall status
  const errorCount = report.issues.filter(i => i.severity === 'error').length;
  const warningCount = report.issues.filter(i => i.severity === 'warning').length;

  if (errorCount > 0 || warningCount > 3) {
    report.status = 'major-issues';
  } else if (warningCount > 0) {
    report.status = 'minor-issues';
  }

  return report;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function mapStudioTypeToTS(studioType: string): string {
  const mapping: Record<string, string> = {
    'text': 'string',
    'select': 'string',
    'radio': 'string',
    'boolean': 'boolean',
    'number': 'number',
    'icon': 'string',
    'color': 'string',
  };
  return mapping[studioType] || studioType;
}

function normalizeType(type: string): string {
  // Remove quotes and extra spaces
  type = type.replace(/['"]/g, '').trim();

  // Handle union types - just get the base type
  if (type.includes('|')) {
    const types = type.split('|').map(t => t.trim());
    // Return the first non-empty type
    return types.find(t => t !== "''") || types[0];
  }

  return type;
}

function areTypesCompatible(type1: string, type2: string): boolean {
  // Normalize types
  type1 = normalizeType(type1);
  type2 = normalizeType(type2);

  // Direct match
  if (type1 === type2) return true;

  // Check if type2 is a more specific version of type1
  // e.g., 'string' is compatible with 'ButtonType'
  if (type1 === 'string' && (type2.includes('Size') || type2.includes('Type') || type2.includes('Variant') || type2.includes('Shape'))) {
    return true;
  }

  // Boolean types
  if ((type1 === 'boolean' || type1 === 'Boolean') && (type2 === 'boolean' || type2 === 'Boolean')) {
    return true;
  }

  return false;
}

function normalizeDefault(value: any): string {
  if (value === null || value === undefined) return 'undefined';
  if (typeof value === 'string') return value.replace(/['"]/g, '');
  return String(value);
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

function generateMarkdownReport(reports: ComponentReport[]): string {
  let markdown = '# Component Verification Report\n\n';
  markdown += `Generated: ${new Date().toISOString()}\n\n`;

  // Summary
  const aligned = reports.filter(r => r.status === 'aligned');
  const minorIssues = reports.filter(r => r.status === 'minor-issues');
  const majorIssues = reports.filter(r => r.status === 'major-issues');
  const missing = reports.filter(r => r.status === 'missing-mapping');

  markdown += '## Summary\n\n';
  markdown += `- Total Components: ${reports.length}\n`;
  markdown += `- ✅ Fully Aligned: ${aligned.length}\n`;
  markdown += `- ⚠️  Minor Issues: ${minorIssues.length}\n`;
  markdown += `- ❌ Major Issues: ${majorIssues.length}\n`;
  markdown += `- 🔍 Missing Mapping: ${missing.length}\n\n`;

  // Detailed results
  markdown += '## Detailed Results\n\n';

  // Fully aligned components
  if (aligned.length > 0) {
    markdown += '### ✅ Fully Aligned Components\n\n';
    aligned.forEach(report => {
      markdown += `- **${report.studioComponent}** → ${report.nuralyComponent}\n`;
      markdown += `  - Properties checked: ${report.propertiesChecked}\n`;
      if (report.cssVariablesChecked > 0) {
        markdown += `  - CSS variables checked: ${report.cssVariablesChecked}\n`;
      }
    });
    markdown += '\n';
  }

  // Minor issues
  if (minorIssues.length > 0) {
    markdown += '### ⚠️  Components with Minor Issues\n\n';
    minorIssues.forEach(report => {
      markdown += `#### ${report.studioComponent} → ${report.nuralyComponent}\n\n`;
      markdown += `Properties checked: ${report.propertiesChecked}, CSS variables: ${report.cssVariablesChecked}\n\n`;

      const warnings = report.issues.filter(i => i.severity === 'warning');
      const infos = report.issues.filter(i => i.severity === 'info');

      if (warnings.length > 0) {
        markdown += '**Warnings:**\n';
        warnings.forEach(issue => {
          markdown += `- ${issue.message}\n`;
          if (issue.details) {
            markdown += `  - ${issue.details}\n`;
          }
        });
        markdown += '\n';
      }

      if (infos.length > 0 && infos.length <= 5) {
        markdown += '**Info:**\n';
        infos.forEach(issue => {
          markdown += `- ${issue.message}\n`;
          if (issue.details) {
            markdown += `  - ${issue.details}\n`;
          }
        });
        markdown += '\n';
      } else if (infos.length > 5) {
        markdown += `**Info:** ${infos.length} informational messages (omitted for brevity)\n\n`;
      }
    });
  }

  // Major issues
  if (majorIssues.length > 0) {
    markdown += '### ❌ Components with Major Issues\n\n';
    majorIssues.forEach(report => {
      markdown += `#### ${report.studioComponent} → ${report.nuralyComponent}\n\n`;
      markdown += `Properties checked: ${report.propertiesChecked}, CSS variables: ${report.cssVariablesChecked}\n\n`;

      const errors = report.issues.filter(i => i.severity === 'error');
      const warnings = report.issues.filter(i => i.severity === 'warning');

      if (errors.length > 0) {
        markdown += '**Errors:**\n';
        errors.forEach(issue => {
          markdown += `- ${issue.message}\n`;
          if (issue.details) {
            markdown += `  - ${issue.details}\n`;
          }
        });
        markdown += '\n';
      }

      if (warnings.length > 0) {
        markdown += '**Warnings:**\n';
        warnings.forEach(issue => {
          markdown += `- ${issue.message}\n`;
          if (issue.details) {
            markdown += `  - ${issue.details}\n`;
          }
        });
        markdown += '\n';
      }
    });
  }

  // Missing mappings
  if (missing.length > 0) {
    markdown += '### 🔍 Missing Mappings\n\n';
    missing.forEach(report => {
      markdown += `#### ${report.studioComponent} → ${report.nuralyComponent}\n\n`;
      report.issues.forEach(issue => {
        markdown += `- ${issue.message}\n`;
        if (issue.details) {
          markdown += `  - ${issue.details}\n`;
        }
      });
      markdown += '\n';
    });
  }

  // Statistics by category
  markdown += '## Issue Statistics by Category\n\n';
  const allIssues = reports.flatMap(r => r.issues);
  const categories = ['property', 'type', 'css-variable', 'mapping'];

  markdown += '| Category | Errors | Warnings | Info |\n';
  markdown += '|----------|--------|----------|------|\n';

  categories.forEach(category => {
    const categoryIssues = allIssues.filter(i => i.category === category);
    const errors = categoryIssues.filter(i => i.severity === 'error').length;
    const warnings = categoryIssues.filter(i => i.severity === 'warning').length;
    const infos = categoryIssues.filter(i => i.severity === 'info').length;

    markdown += `| ${category} | ${errors} | ${warnings} | ${infos} |\n`;
  });

  markdown += '\n---\n\n';
  markdown += '*This report was automatically generated by the component verification script.*\n';

  return markdown;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
  console.log('Starting component verification...\n');

  const reports: ComponentReport[] = [];

  for (const mapping of COMPONENT_MAPPINGS) {
    console.log(`Verifying: ${mapping.studioPath} → ${mapping.nuralyComponent}`);
    const report = verifyComponent(mapping);
    reports.push(report);

    const statusIcon = {
      'aligned': '✅',
      'minor-issues': '⚠️ ',
      'major-issues': '❌',
      'missing-mapping': '🔍'
    }[report.status];

    console.log(`  ${statusIcon} ${report.status} (${report.issues.length} issues)\n`);
  }

  console.log('\nGenerating report...\n');
  const markdownReport = generateMarkdownReport(reports);

  // Write report to file
  const reportPath = '/home/user/studio/component-verification-report.md';
  fs.writeFileSync(reportPath, markdownReport);
  console.log(`Report written to: ${reportPath}\n`);

  // Also output report to console
  console.log('\n' + '='.repeat(80));
  console.log(markdownReport);
  console.log('='.repeat(80) + '\n');

  // Summary statistics
  const aligned = reports.filter(r => r.status === 'aligned').length;
  const minorIssues = reports.filter(r => r.status === 'minor-issues').length;
  const majorIssues = reports.filter(r => r.status === 'major-issues').length;
  const missing = reports.filter(r => r.status === 'missing-mapping').length;

  console.log('Summary:');
  console.log(`  ✅ Aligned: ${aligned}`);
  console.log(`  ⚠️  Minor Issues: ${minorIssues}`);
  console.log(`  ❌ Major Issues: ${majorIssues}`);
  console.log(`  🔍 Missing: ${missing}`);
  console.log(`  Total: ${reports.length}`);
}

// Run the script
main();
