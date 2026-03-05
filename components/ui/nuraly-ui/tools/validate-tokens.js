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

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

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

/**
 * Parse a line inside a CSS block, tracking backtick depth for nested templates.
 * Returns { lineContent, closed } where closed indicates the block ended.
 */
function parseCSSBlockLine(line, state) {
  let escaped = false;
  let lineContent = '';
  for (const ch of line) {
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
      state.depth--;
      if (state.depth === 0) {
        return { lineContent, closed: true };
      }
    }
    lineContent += ch;
  }
  return { lineContent, closed: false };
}

/**
 * Check if a line starts a css`` tagged template. If so, update state and
 * return the content after the opening backtick; otherwise return null.
 */
function tryCSSBlockStart(line, state) {
  const cssStart = line.match(/css\s*`/);
  if (!cssStart) return null;

  state.depth = 1;
  const afterBacktick = line.substring(line.indexOf('`', cssStart.index) + 1);

  // Check for closing backtick on the same line
  for (const ch of afterBacktick) {
    if (ch === '`') {
      state.depth--;
      if (state.depth === 0) {
        return { afterBacktick, closedImmediately: true };
      }
    }
  }
  return { afterBacktick, closedImmediately: false };
}

function extractCSS(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const blocks = [];
  let inCSSBlock = false;
  let cssLines = [];
  let startLine = 0;
  const state = { depth: 0 };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (inCSSBlock) {
      const { lineContent, closed } = parseCSSBlockLine(line, state);
      if (closed) {
        inCSSBlock = false;
        cssLines.push({ text: lineContent, fileLine: i + 1 });
        blocks.push({ lines: cssLines, startLine });
        cssLines = [];
      } else {
        cssLines.push({ text: line, fileLine: i + 1 });
      }
      continue;
    }

    // Look for css` start
    const startResult = tryCSSBlockStart(line, state);
    if (!startResult) continue;

    startLine = i + 1;
    if (startResult.closedImmediately) continue;

    inCSSBlock = true;
    cssLines.push({ text: startResult.afterBacktick, fileLine: i + 1 });
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
const CSS_SELECTOR_RE = /^\s*[.#:&[\]@>~+*]/;
const PROPERTY_RE = /^\s*([\w-]+)\s*:\s*(.+?)\s*;?\s*$/;

/**
 * Strip comments from a CSS line and update the comment tracking state.
 * Returns null if the entire line is inside a comment (should be skipped).
 */
function stripComments(rawLine, commentState) {
  let line = rawLine;

  if (commentState.inComment) {
    if (!line.includes('*/')) return null;
    line = line.substring(line.indexOf('*/') + 2);
    commentState.inComment = false;
  }

  // Remove single-line block comments
  line = line.replaceAll(/\/\*.*?\*\//g, '');
  if (line.includes('/*')) {
    commentState.inComment = true;
    line = line.substring(0, line.indexOf('/*'));
  }

  // Remove // comments (not standard CSS but used in tagged templates)
  line = line.replace(/\/\/.*$/, '');

  return line.trim() || null;
}

/**
 * Update block-level tracking state (keyframes, media queries, brace depth).
 * Returns true if the line should be skipped (inside keyframes or is just a brace).
 */
function updateBlockState(line, blockState) {
  if (/@keyframes\b/.test(line)) {
    blockState.inKeyframes = true;
    blockState.keyframeDepth = blockState.braceDepth;
  }
  if (/@media\b/.test(line)) {
    blockState.inMediaQuery = true;
    blockState.mediaDepth = blockState.braceDepth;
  }

  const opens = (line.match(/{/g) || []).length;
  const closes = (line.match(/}/g) || []).length;
  blockState.braceDepth += opens - closes;

  if (blockState.inKeyframes && blockState.braceDepth <= blockState.keyframeDepth) {
    blockState.inKeyframes = false;
  }
  if (blockState.inMediaQuery && blockState.braceDepth <= blockState.mediaDepth) {
    blockState.inMediaQuery = false;
  }

  if (blockState.inKeyframes) return true;
  if (line === '{' || line === '}') return true;
  return false;
}

/**
 * Extract CSS declaration strings from a line, handling selector lines
 * with inline declarations like ".foo { color: red; }".
 * Returns an array of declaration strings, or null if the line should be skipped.
 */
function extractDeclarations(line) {
  if (CSS_SELECTOR_RE.test(line)) {
    const braceContent = line.match(/\{([^}]+)\}/);
    if (!braceContent) return null;
    const decls = braceContent[1].split(';').filter(d => d.trim());
    return decls.length > 0 ? decls.map(d => d.trim()) : null;
  }
  if (line.startsWith('}')) return null;
  return [line];
}

/** Check a custom property definition for non-standard naming. */
function checkCustomPropertyNaming(property, value, fileLine, relPath, violations) {
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
}

/** Check for hard-coded z-index values. */
function checkZIndex(value, property, fileLine, relPath, violations) {
  const zVal = value.trim();
  if (/^\d+$/.test(zVal) && Number.parseInt(zVal) > 1 && !VAR_RE.test(value)) {
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

/** Check for hard-coded transition/animation duration values. */
function checkTransitionDuration(value, property, fileLine, relPath, violations) {
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

const TRANSITION_PROPERTIES = new Set(['transition', 'transition-duration', 'animation-duration']);

/** Check that var() token references point to defined tokens. */
function checkTokenReferences(value, property, fileLine, relPath, violations, tokenMap) {
  const varRefs = [...value.matchAll(/var\(\s*(--nuraly-[\w-]+)\s*([,)])/g)];
  for (const ref of varRefs) {
    const tokenName = ref[1];
    const hasFallback = ref[2] === ',';
    if (tokenMap.has(tokenName)) continue;

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

/** Run all checks on a single CSS declaration. */
function checkDeclaration(property, value, fileLine, relPath, violations, tokenMap, inMediaQuery) {
  if (SKIP_PROPERTIES.has(property)) return;

  if (property.startsWith('--')) {
    checkCustomPropertyNaming(property, value, fileLine, relPath, violations);
    return;
  }

  if (COLOR_PROPERTIES.has(property)) {
    checkBareColors(value, property, fileLine, relPath, violations, inMediaQuery);
  }
  if (THEMEABLE_PROPERTIES.has(property)) {
    checkBareDimensions(value, property, fileLine, relPath, violations, inMediaQuery);
  }
  if (property === 'z-index') {
    checkZIndex(value, property, fileLine, relPath, violations);
  }
  if (TRANSITION_PROPERTIES.has(property)) {
    checkTransitionDuration(value, property, fileLine, relPath, violations);
  }

  checkTokenReferences(value, property, fileLine, relPath, violations, tokenMap);
  checkFallbacks(value, property, fileLine, relPath, violations);
}

function detectViolations(cssBlocks, filePath, tokenMap) {
  const violations = [];
  const relPath = relative(join(ROOT, 'src/components'), filePath);

  for (const block of cssBlocks) {
    const commentState = { inComment: false };
    const blockState = {
      inKeyframes: false, inMediaQuery: false,
      braceDepth: 0, keyframeDepth: 0, mediaDepth: 0,
    };

    for (const { text: rawLine, fileLine } of block.lines) {
      const line = stripComments(rawLine, commentState);
      if (!line) continue;

      if (updateBlockState(line, blockState)) continue;

      const declarationLines = extractDeclarations(line);
      if (!declarationLines) continue;

      for (const declLine of declarationLines) {
        const propMatch = declLine.match(PROPERTY_RE);
        if (!propMatch) continue;

        const property = propMatch[1].toLowerCase();
        const value = propMatch[2];
        checkDeclaration(property, value, fileLine, relPath, violations, tokenMap, blockState.inMediaQuery);
      }
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

/** Check if a dimension value should be skipped (allowed patterns). */
function shouldSkipDimension(trimmed, value, property) {
  if (ALLOWED_KEYWORDS.has(trimmed)) return true;
  if (/^var\(/.test(trimmed)) return true;
  if (/^0(px|rem|em)?$/.test(trimmed)) return true;
  if (/^[\d.]+%$/.test(trimmed)) return true;
  if (/^calc\(/.test(trimmed) && VAR_RE.test(trimmed)) return true;
  if (VAR_RE.test(value)) return true;
  if (!DIMENSION_RE.test(trimmed)) return true;
  if (property === 'border-width' && /^[012]px$/.test(trimmed)) return true;
  if ((property === 'border' || property.startsWith('border-')) && /^[012]px\s+\w+/.test(trimmed)) return true;
  return false;
}

function checkBareDimensions(value, property, line, file, violations, inMedia) {
  if (inMedia) return;

  const trimmed = value.trim();
  if (shouldSkipDimension(trimmed, value, property)) return;

  const dimMatches = [...trimmed.matchAll(/\b(\d+(?:\.\d+)?(?:px|rem|em))\b/g)];
  if (dimMatches.length > 0) {
    violations.push({
      severity: 'ERROR',
      type: 'HARD_CODED_DIMENSION',
      file,
      line,
      property,
      value: trimmed,
      message: 'Bare dimension' + (dimMatches.length > 1 ? 's' : '') + ' ' + dimMatches.map(m => '"' + m[1] + '"').join(', ') + ' — use a --nuraly-* token',
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
    result = result.replaceAll(/var\([^()]*\)/g, '');
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

/** Format violations for a single severity level within a file. */
function formatSeverityBlock(severity, fileViolations, file) {
  const filtered = fileViolations.filter(v => v.severity === severity);
  if (filtered.length === 0) return [];
  return [
    `${severity} ${file}`,
    ...filtered.flatMap(v => [`  L${v.line}: ${v.property}: ${v.value}`, `         ${v.message}`]),
    '',
  ];
}

/** Format coverage gap section. */
function formatCoverageGaps(coverageGaps) {
  if (coverageGaps.length === 0) return [];
  const lines = ['COVERAGE GAP'];
  for (const gap of coverageGaps.slice(0, 20)) {
    lines.push(`  ${gap.token}: defined in ${gap.definedIn.join(', ')}, missing in ${gap.missingIn.join(', ')}`);
  }
  if (coverageGaps.length > 20) {
    lines.push(`  ... and ${coverageGaps.length - 20} more`);
  }
  lines.push('');
  return lines;
}

/** Format the summary line. */
function formatSummary(allViolations) {
  const totalFiles = new Set(allViolations.map(v => v.file)).size;
  const totalStyleFiles = findStyleFiles().length;
  const totalErrors = allViolations.filter(v => v.severity === 'ERROR').length;
  const totalWarnings = allViolations.filter(v => v.severity === 'WARNING').length;
  return `Summary: ${totalStyleFiles} files scanned | ${totalFiles} with violations | ${totalErrors} errors | ${totalWarnings} warnings`;
}

function formatReport(allViolations, coverageGaps, format) {
  if (format === 'json') {
    return JSON.stringify({ violations: allViolations, coverageGaps }, null, 2);
  }

  const lines = ['=== NuralyUI CSS Token Validation ===\n'];

  // Group violations by file
  const byFile = new Map();
  for (const v of allViolations) {
    if (!byFile.has(v.file)) byFile.set(v.file, []);
    byFile.get(v.file).push(v);
  }

  for (const file of [...byFile.keys()].sort()) {
    const fileViolations = byFile.get(file);
    lines.push(...formatSeverityBlock('ERROR', fileViolations, file));
    lines.push(...formatSeverityBlock('WARNING', fileViolations, file));
  }

  lines.push(...formatCoverageGaps(coverageGaps));
  lines.push(formatSummary(allViolations));

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
