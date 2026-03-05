#!/usr/bin/env node

/**
 * NuralyUI CSS Token Validation Script
 *
 * Scans component .style.ts files for CSS custom property violations:
 * - Hard-coded colors (hex, rgb, rgba, hsl) not wrapped in var()
 * - Hard-coded dimensions for themeable properties
 * - Hard-coded z-index and transition durations
 * - Non-standard local token naming patterns
 * - References to undefined tokens (typo detection)
 * - Hard-coded fallback values inside var()
 *
 * Usage:
 *   node tools/validate-tokens.js              # Human-readable report
 *   node tools/validate-tokens.js --format json # JSON output
 *   node tools/validate-tokens.js --help
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// ---------------------------------------------------------------------------
// 1. Collect defined tokens from theme CSS files
// ---------------------------------------------------------------------------

function collectTokens() {
  const tokenMap = new Map(); // tokenName -> Set<theme>
  const themeDirs = ['default', 'carbon', 'editor'];
  const themeSrcDir = join(ROOT, 'src/shared/themes');
  const themeDistDir = join(ROOT, 'packages/themes/dist');

  for (const theme of themeDirs) {
    const cssFiles = [];

    // Collect from source dir
    const srcDir = join(themeSrcDir, theme);
    if (existsSync(srcDir)) {
      walkDir(srcDir, (f) => f.endsWith('.css') && cssFiles.push(f));
    }

    // Also collect from dist (bundled) as fallback
    const distFile = join(themeDistDir, `${theme}.css`);
    if (existsSync(distFile)) {
      cssFiles.push(distFile);
    }

    for (const file of cssFiles) {
      const content = readFileSync(file, 'utf8');
      // Match custom property definitions: --nuraly-*: value
      const re = /--nuraly-[\w-]+(?=\s*:)/g;
      let match;
      while ((match = re.exec(content)) !== null) {
        const token = match[0];
        if (!tokenMap.has(token)) {
          tokenMap.set(token, new Set());
        }
        tokenMap.get(token).add(theme);
      }
    }
  }

  // Also collect tokens referenced (not just defined) in component style files
  // as component API extension points. A token like --nuraly-select-small-icon-size
  // may not be defined in any theme but exists as a customization hook with a fallback.
  const componentsDir = join(ROOT, 'src/components');
  if (existsSync(componentsDir)) {
    walkDir(componentsDir, (f) => {
      if (!f.endsWith('.style.ts')) return;
      const content = readFileSync(f, 'utf8');
      // Collect tokens that are DEFINED (--nuraly-*: value) in component styles
      const defRe = /--nuraly-[\w-]+(?=\s*:)/g;
      let m;
      while ((m = defRe.exec(content)) !== null) {
        const token = m[0];
        if (!tokenMap.has(token)) {
          tokenMap.set(token, new Set());
        }
        tokenMap.get(token).add('component');
      }
    });
  }

  return tokenMap;
}

function walkDir(dir, cb) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      walkDir(full, cb);
    } else if (entry.isFile()) {
      cb(full);
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Find and parse component .style.ts files
// ---------------------------------------------------------------------------

function findStyleFiles() {
  const componentsDir = join(ROOT, 'src/components');
  const files = [];
  walkDir(componentsDir, (f) => {
    if (f.endsWith('.style.ts')) files.push(f);
  });
  return files;
}

function extractCSS(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Find css`...` tagged template literal
  // We need to track backtick depth for nested templates
  const blocks = [];
  let inCSSBlock = false;
  let cssLines = [];
  let startLine = 0;
  let depth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!inCSSBlock) {
      // Look for css` start (handles `= css``, `export ... css``, etc.)
      const cssStart = line.match(/css\s*`/);
      if (cssStart) {
        inCSSBlock = true;
        startLine = i + 1; // 1-indexed
        depth = 1;
        // Get content after opening backtick on same line
        const afterBacktick = line.substring(line.indexOf('`', cssStart.index) + 1);
        // Count any nested backticks or closing backtick on same line
        for (const ch of afterBacktick) {
          if (ch === '`') {
            depth--;
            if (depth === 0) {
              inCSSBlock = false;
              break;
            }
          }
        }
        if (inCSSBlock) {
          cssLines.push({ text: afterBacktick, fileLine: i + 1 });
        }
      }
    } else {
      // Inside css block - look for closing backtick
      let escaped = false;
      let lineContent = '';
      for (let j = 0; j < line.length; j++) {
        const ch = line[j];
        if (escaped) {
          escaped = false;
          lineContent += ch;
          continue;
        }
        if (ch === '\\') {
          escaped = true;
          lineContent += ch;
          continue;
        }
        if (ch === '`') {
          depth--;
          if (depth === 0) {
            inCSSBlock = false;
            cssLines.push({ text: lineContent, fileLine: i + 1 });
            blocks.push({ lines: cssLines, startLine });
            cssLines = [];
            break;
          }
        }
        lineContent += ch;
      }
      if (inCSSBlock) {
        cssLines.push({ text: line, fileLine: i + 1 });
      }
    }
  }

  if (cssLines.length > 0) {
    blocks.push({ lines: cssLines, startLine });
  }

  return blocks;
}

// ---------------------------------------------------------------------------
// 3. Violation detection
// ---------------------------------------------------------------------------

// CSS keywords and values that are always allowed
const ALLOWED_KEYWORDS = new Set([
  'transparent', 'inherit', 'initial', 'unset', 'revert', 'revert-layer',
  'currentcolor', 'currentColor', 'none', 'auto', '0', 'normal',
  'bold', 'bolder', 'lighter', 'italic', 'oblique',
  'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset',
  'hidden', 'visible', 'collapse', 'scroll', 'fixed', 'absolute', 'relative',
  'static', 'sticky', 'block', 'inline', 'inline-block', 'inline-flex',
  'flex', 'grid', 'inline-grid', 'contents', 'table', 'table-row', 'table-cell',
  'nowrap', 'wrap', 'wrap-reverse', 'row', 'row-reverse', 'column', 'column-reverse',
  'center', 'flex-start', 'flex-end', 'start', 'end', 'stretch',
  'space-between', 'space-around', 'space-evenly', 'baseline',
  'pointer', 'default', 'text', 'move', 'not-allowed', 'grab', 'grabbing',
  'ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear', 'step-start', 'step-end',
  'cover', 'contain', 'no-repeat', 'repeat', 'repeat-x', 'repeat-y',
  'top', 'bottom', 'left', 'right',
  'middle', 'sub', 'super', 'text-top', 'text-bottom',
  'uppercase', 'lowercase', 'capitalize',
  'underline', 'overline', 'line-through',
  'ellipsis', 'clip',
  'border-box', 'content-box', 'padding-box',
  'all', 'opacity', 'transform', 'background-color', 'color', 'border-color',
  'box-shadow', 'width', 'height', 'max-height', 'max-width',
  'min-content', 'max-content', 'fit-content',
  'pre', 'pre-wrap', 'pre-line', 'break-spaces',
]);

// Properties where hard-coded dimensions are a problem
const THEMEABLE_PROPERTIES = new Set([
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'gap', 'row-gap', 'column-gap',
  'font-size', 'line-height',
  'border-radius',
  'border-width',
  'box-shadow',
  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
]);

// Properties where hard-coded colors are a problem
const COLOR_PROPERTIES = new Set([
  'color', 'background-color', 'background', 'border-color',
  'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
  'border', 'border-top', 'border-right', 'border-bottom', 'border-left',
  'outline-color', 'outline',
  'fill', 'stroke',
  'text-decoration-color', 'caret-color', 'accent-color',
  'box-shadow', 'text-shadow',
]);

// Properties to skip entirely (never flag values for these)
const SKIP_PROPERTIES = new Set([
  'content', 'font-family', 'animation', 'animation-name',
  'transform', 'translate', 'rotate', 'scale',
  'filter', 'backdrop-filter',
  'grid-template-columns', 'grid-template-rows', 'grid-template-areas',
  'grid-column', 'grid-row', 'grid-area',
  'cursor', 'list-style', 'list-style-type',
  'white-space', 'word-break', 'overflow-wrap', 'text-overflow',
  'overflow', 'overflow-x', 'overflow-y',
  'position', 'display', 'visibility', 'float', 'clear',
  'text-align', 'vertical-align', 'text-decoration', 'text-transform',
  'flex-direction', 'flex-wrap', 'flex-flow', 'justify-content',
  'align-items', 'align-content', 'align-self', 'justify-self',
  'flex-shrink', 'flex-grow', 'flex-basis', 'flex', 'order',
  'object-fit', 'object-position',
  'pointer-events', 'user-select', 'touch-action', 'resize',
  'appearance', '-webkit-appearance', '-moz-appearance',
  'box-sizing', 'table-layout', 'border-collapse', 'border-spacing',
  'background-image', 'background-position', 'background-size', 'background-repeat',
  'background-clip', '-webkit-background-clip',
  'text-rendering', 'font-smoothing', '-webkit-font-smoothing', '-moz-osx-font-smoothing',
  'aspect-ratio', 'isolation', 'mix-blend-mode',
  'will-change', 'contain', 'container-type',
  'unicode-bidi', 'direction',
  'scroll-behavior', 'overscroll-behavior',
  '-webkit-text-fill-color', '-webkit-line-clamp', '-webkit-box-orient',
]);

// Regex patterns
const HEX_COLOR_RE = /#(?:[0-9a-fA-F]{3,4}){1,2}\b/;
const RGB_RE = /\brgba?\s*\(/i;
const HSL_RE = /\bhsla?\s*\(/i;
const DIMENSION_RE = /\b\d+(?:\.\d+)?(?:px|rem|em)\b/;
const VAR_RE = /var\s*\(/;
const CSS_SELECTOR_RE = /^\s*[.#:&\[\]@>~+*]/;
const PROPERTY_RE = /^\s*([\w-]+)\s*:\s*(.+?)\s*;?\s*$/;

function detectViolations(cssBlocks, filePath, tokenMap) {
  const violations = [];
  const relPath = relative(join(ROOT, 'src/components'), filePath);

  for (const block of cssBlocks) {
    let inKeyframes = false;
    let inMediaQuery = false;
    let braceDepth = 0;
    let keyframeDepth = 0;
    let mediaDepth = 0;
    let inComment = false;

    for (const { text: rawLine, fileLine } of block.lines) {
      let line = rawLine;

      // Handle multi-line comments
      if (inComment) {
        if (line.includes('*/')) {
          line = line.substring(line.indexOf('*/') + 2);
          inComment = false;
        } else {
          continue;
        }
      }

      // Remove single-line comments
      line = line.replace(/\/\*.*?\*\//g, '');
      if (line.includes('/*')) {
        inComment = true;
        line = line.substring(0, line.indexOf('/*'));
      }

      // Remove // comments (not standard CSS but used in tagged templates)
      line = line.replace(/\/\/.*$/, '');

      line = line.trim();
      if (!line) continue;

      // Track @keyframes blocks
      if (/@keyframes\b/.test(line)) {
        inKeyframes = true;
        keyframeDepth = braceDepth;
      }

      // Track @media blocks
      if (/@media\b/.test(line)) {
        inMediaQuery = true;
        mediaDepth = braceDepth;
      }

      // Track brace depth
      const opens = (line.match(/{/g) || []).length;
      const closes = (line.match(/}/g) || []).length;
      braceDepth += opens - closes;

      // Exit keyframes/media
      if (inKeyframes && braceDepth <= keyframeDepth) {
        inKeyframes = false;
      }
      if (inMediaQuery && braceDepth <= mediaDepth) {
        inMediaQuery = false;
      }

      // Skip @keyframes content
      if (inKeyframes) continue;

      // Skip lines that are just braces
      if (line === '{' || line === '}') continue;

      // For lines with selectors, extract inline declarations from { ... }
      // e.g. ".badge-indicator.pink { background-color: #eb2f96; }"
      let declarationLines = [];
      if (CSS_SELECTOR_RE.test(line)) {
        const braceContent = line.match(/\{([^}]+)\}/);
        if (braceContent) {
          // Split multiple declarations separated by ;
          const decls = braceContent[1].split(';').filter(d => d.trim());
          for (const decl of decls) {
            declarationLines.push(decl.trim());
          }
        }
        if (declarationLines.length === 0) continue;
      } else if (line.startsWith('}')) {
        continue;
      } else {
        declarationLines = [line];
      }

      for (const declLine of declarationLines) {
      // Parse property: value declarations
      const propMatch = declLine.match(PROPERTY_RE);
      if (!propMatch) continue;

      const property = propMatch[1].toLowerCase();
      const value = propMatch[2];

      // Skip properties we never flag
      if (SKIP_PROPERTIES.has(property)) continue;

      // Skip CSS custom property definitions (--nuraly-* definitions are fine)
      if (property.startsWith('--')) {
        // Check for non-standard naming: --nuraly-*-local-*
        if (/^--nuraly-.*-local-/.test(property)) {
          violations.push({
            severity: 'WARNING',
            type: 'NON_STANDARD_TOKEN',
            file: relPath,
            line: fileLine,
            property,
            value,
            message: `Non-standard local token naming "${property}" — use --nuraly-{component}-{property} pattern`,
          });
        }
        continue;
      }

      // --- Check for bare hard-coded colors ---
      if (COLOR_PROPERTIES.has(property)) {
        checkBareColors(value, property, fileLine, relPath, violations, inMediaQuery);
      }

      // --- Check for bare hard-coded dimensions ---
      if (THEMEABLE_PROPERTIES.has(property)) {
        checkBareDimensions(value, property, fileLine, relPath, violations, inMediaQuery);
      }

      // --- Check z-index ---
      if (property === 'z-index') {
        const zVal = value.trim();
        if (/^\d+$/.test(zVal) && parseInt(zVal) > 1 && !VAR_RE.test(value)) {
          violations.push({
            severity: 'ERROR',
            type: 'HARD_CODED_VALUE',
            file: relPath,
            line: fileLine,
            property,
            value,
            message: 'Use a --nuraly-z-* token for z-index',
          });
        }
      }

      // --- Check transition durations ---
      if (property === 'transition' || property === 'transition-duration' || property === 'animation-duration') {
        if (/\b\d+(?:\.\d+)?m?s\b/.test(value) && !VAR_RE.test(value)) {
          violations.push({
            severity: 'ERROR',
            type: 'HARD_CODED_VALUE',
            file: relPath,
            line: fileLine,
            property,
            value,
            message: 'Use a --nuraly-transition-* token for timing values',
          });
        }
      }

      // --- Check var() references point to defined tokens ---
      // Match var(--token) or var(--token, fallback) — capture token and check for comma (fallback)
      const varRefs = [...value.matchAll(/var\(\s*(--nuraly-[\w-]+)\s*([,)])/g)];
      for (const ref of varRefs) {
        const tokenName = ref[1];
        const hasFallback = ref[2] === ',';
        if (!tokenMap.has(tokenName)) {
          // If the var() has a fallback value, it's an optional extension point — just warn
          const severity = hasFallback ? 'WARNING' : 'ERROR';
          violations.push({
            severity,
            type: 'UNDEFINED_TOKEN',
            file: relPath,
            line: fileLine,
            property,
            value: tokenName,
            message: `Token "${tokenName}" is not defined in any theme${hasFallback ? ' (has fallback)' : ''}`,
          });
        }
      }

      // --- Check for hard-coded fallback values in var() ---
      checkFallbacks(value, property, fileLine, relPath, violations);
      } // end for declarationLines
    }
  }

  return violations;
}

function checkBareColors(value, property, line, file, violations, inMedia) {
  if (inMedia) return;

  // Skip if value is entirely wrapped in var()
  if (/^var\(/.test(value.trim()) && !HEX_COLOR_RE.test(stripVarCalls(value))) return;

  // Skip allowed keywords
  const trimmed = value.trim().toLowerCase();
  if (ALLOWED_KEYWORDS.has(trimmed)) return;

  // Skip values that are only var() calls
  const stripped = stripVarCalls(value);
  if (!stripped.trim()) return;

  // Check for bare hex colors (not inside var())
  if (HEX_COLOR_RE.test(stripped)) {
    // Make sure it's not a CSS selector ID like #container
    const hexMatches = [...stripped.matchAll(/#(?:[0-9a-fA-F]{3,4}){1,2}\b/g)];
    for (const m of hexMatches) {
      violations.push({
        severity: 'ERROR',
        type: 'HARD_CODED_COLOR',
        file,
        line,
        property,
        value: value.trim(),
        message: `Bare hex color "${m[0]}" — use a var(--nuraly-color-*) token`,
      });
    }
    return;
  }

  // Check for bare rgb/rgba
  if (RGB_RE.test(stripped)) {
    violations.push({
      severity: 'ERROR',
      type: 'HARD_CODED_COLOR',
      file,
      line,
      property,
      value: value.trim(),
      message: 'Bare rgb/rgba value — use a var(--nuraly-color-*) token',
    });
    return;
  }

  // Check for bare hsl/hsla
  if (HSL_RE.test(stripped)) {
    violations.push({
      severity: 'ERROR',
      type: 'HARD_CODED_COLOR',
      file,
      line,
      property,
      value: value.trim(),
      message: 'Bare hsl/hsla value — use a var(--nuraly-color-*) token',
    });
  }
}

function checkBareDimensions(value, property, line, file, violations, inMedia) {
  if (inMedia) return;

  const trimmed = value.trim();
  if (ALLOWED_KEYWORDS.has(trimmed)) return;

  // Skip if value starts with var()
  if (/^var\(/.test(trimmed)) return;

  // Skip pure 0
  if (/^0(px|rem|em)?$/.test(trimmed)) return;

  // Skip percentage values
  if (/^[\d.]+%$/.test(trimmed)) return;

  // Skip calc() expressions that use tokens
  if (/^calc\(/.test(trimmed) && VAR_RE.test(trimmed)) return;

  // Skip values in shorthand that already use var()
  if (VAR_RE.test(value)) return;

  // Skip if no dimensions present
  if (!DIMENSION_RE.test(trimmed)) return;

  // Skip known safe small values: 1px borders, etc.
  if (property === 'border-width' && /^[012]px$/.test(trimmed)) return;
  if ((property === 'border' || property.startsWith('border-')) && /^[012]px\s+\w+/.test(trimmed)) return;

  // Flag bare dimensions
  const dimMatches = [...trimmed.matchAll(/\b(\d+(?:\.\d+)?(?:px|rem|em))\b/g)];
  if (dimMatches.length > 0) {
    violations.push({
      severity: 'ERROR',
      type: 'HARD_CODED_DIMENSION',
      file,
      line,
      property,
      value: trimmed,
      message: `Bare dimension${dimMatches.length > 1 ? 's' : ''} ${dimMatches.map(m => `"${m[1]}"`).join(', ')} — use a --nuraly-* token`,
    });
  }
}

function checkFallbacks(value, property, line, file, violations) {
  // Match var(--token, fallback) patterns
  const varWithFallback = /var\(\s*--[\w-]+\s*,\s*([^)]+)\)/g;
  let match;
  while ((match = varWithFallback.exec(value)) !== null) {
    const fallback = match[1].trim();

    // Skip if fallback is another var()
    if (/^var\(/.test(fallback)) continue;

    // Check if fallback contains hard-coded color or dimension
    if (HEX_COLOR_RE.test(fallback) || RGB_RE.test(fallback) || HSL_RE.test(fallback)) {
      violations.push({
        severity: 'WARNING',
        type: 'HARD_CODED_FALLBACK',
        file,
        line,
        property,
        value: value.trim(),
        message: `Hard-coded fallback value "${fallback}" — consider removing or using another token`,
      });
    }
  }
}

/** Strip all var(...) calls from value to check what remains */
function stripVarCalls(value) {
  let result = value;
  let prev = '';
  // Iteratively remove var() calls (handles nested)
  while (result !== prev) {
    prev = result;
    result = result.replace(/var\([^()]*\)/g, '');
  }
  return result;
}

// ---------------------------------------------------------------------------
// 4. Coverage gap detection
// ---------------------------------------------------------------------------

function detectCoverageGaps(tokenMap) {
  const gaps = [];
  const allThemes = ['default', 'carbon', 'editor'];

  for (const [token, themes] of tokenMap) {
    // Only check global tokens (not component-specific ones that may only exist in one theme)
    if (token.match(/^--nuraly-(color|font|spacing|border|shadow|size|z-|transition|ease|focus|line-height)-/)) {
      const missing = allThemes.filter(t => !themes.has(t));
      if (missing.length > 0 && missing.length < allThemes.length) {
        gaps.push({
          token,
          definedIn: [...themes],
          missingIn: missing,
        });
      }
    }
  }

  return gaps;
}

// ---------------------------------------------------------------------------
// 5. Report formatting
// ---------------------------------------------------------------------------

function formatReport(allViolations, coverageGaps, format) {
  if (format === 'json') {
    return JSON.stringify({ violations: allViolations, coverageGaps }, null, 2);
  }

  const lines = [];
  lines.push('=== NuralyUI CSS Token Validation ===\n');

  // Group violations by file
  const byFile = new Map();
  for (const v of allViolations) {
    if (!byFile.has(v.file)) byFile.set(v.file, []);
    byFile.get(v.file).push(v);
  }

  // Sort files alphabetically
  const sortedFiles = [...byFile.keys()].sort();

  for (const file of sortedFiles) {
    const fileViolations = byFile.get(file);

    // Group by severity for display
    const errors = fileViolations.filter(v => v.severity === 'ERROR');
    const warnings = fileViolations.filter(v => v.severity === 'WARNING');

    if (errors.length > 0) {
      lines.push(`ERROR ${file}`);
      for (const v of errors) {
        lines.push(`  L${v.line}: ${v.property}: ${v.value}`);
        lines.push(`         ${v.message}`);
      }
      lines.push('');
    }

    if (warnings.length > 0) {
      lines.push(`WARNING ${file}`);
      for (const v of warnings) {
        lines.push(`  L${v.line}: ${v.property}: ${v.value}`);
        lines.push(`         ${v.message}`);
      }
      lines.push('');
    }
  }

  // Coverage gaps
  if (coverageGaps.length > 0) {
    lines.push('COVERAGE GAP');
    for (const gap of coverageGaps.slice(0, 20)) {
      lines.push(`  ${gap.token}: defined in ${gap.definedIn.join(', ')}, missing in ${gap.missingIn.join(', ')}`);
    }
    if (coverageGaps.length > 20) {
      lines.push(`  ... and ${coverageGaps.length - 20} more`);
    }
    lines.push('');
  }

  // Summary
  const totalFiles = new Set(allViolations.map(v => v.file)).size;
  const totalStyleFiles = findStyleFiles().length;
  const totalErrors = allViolations.filter(v => v.severity === 'ERROR').length;
  const totalWarnings = allViolations.filter(v => v.severity === 'WARNING').length;

  lines.push(`Summary: ${totalStyleFiles} files scanned | ${totalFiles} with violations | ${totalErrors} errors | ${totalWarnings} warnings`);

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`Usage: node tools/validate-tokens.js [options]

Options:
  --format json    Output results as JSON
  --help           Show this help message
`);
    process.exit(0);
  }

  const format = args.includes('--format') ? args[args.indexOf('--format') + 1] : 'text';

  // Step 1: Collect tokens
  const tokenMap = collectTokens();
  if (format !== 'json') {
    console.error(`Collected ${tokenMap.size} tokens from theme files\n`);
  }

  // Step 2: Find and scan style files
  const styleFiles = findStyleFiles();
  const allViolations = [];

  for (const file of styleFiles) {
    const cssBlocks = extractCSS(file);
    if (cssBlocks.length === 0) continue;

    const violations = detectViolations(cssBlocks, file, tokenMap);
    allViolations.push(...violations);
  }

  // Step 3: Coverage gaps
  const coverageGaps = detectCoverageGaps(tokenMap);

  // Step 4: Output report
  const report = formatReport(allViolations, coverageGaps, format);
  console.log(report);

  // Exit with error code if violations found
  const errorCount = allViolations.filter(v => v.severity === 'ERROR').length;
  if (errorCount > 0) {
    process.exit(1);
  }
}

main();
