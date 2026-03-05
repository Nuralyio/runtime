/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Format timestamp for display
 * Shows time only (e.g., "5:30 PM") for today, or date + time for older messages
 */
export function formatTimestamp(timestamp: Date | string | undefined): string {
  if (!timestamp) return '';

  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };

  if (isToday) {
    return date.toLocaleTimeString(undefined, timeOptions);
  }

  // For older messages, show date + time
  const dateOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    ...timeOptions
  };

  return date.toLocaleDateString(undefined, dateOptions);
}

/** Escape HTML entities for safe insertion into innerHTML */
export function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** Language display-name map shared by artifact plugin and panel template */
const LANG_DISPLAY_NAMES: Record<string, string> = {
  javascript: 'JavaScript', typescript: 'TypeScript', python: 'Python',
  java: 'Java', go: 'Go', rust: 'Rust', c: 'C', cpp: 'C++',
  csharp: 'C#', ruby: 'Ruby', php: 'PHP', swift: 'Swift',
  kotlin: 'Kotlin', html: 'HTML', css: 'CSS', scss: 'SCSS',
  sql: 'SQL', graphql: 'GraphQL', json: 'JSON', yaml: 'YAML',
  xml: 'XML', toml: 'TOML', markdown: 'Markdown', md: 'Markdown',
  bash: 'Bash', shell: 'Shell', sh: 'Shell', zsh: 'Zsh',
  dockerfile: 'Dockerfile', makefile: 'Makefile', text: 'Text'
};

/** Map a language identifier to a human-readable display name */
export function getLangDisplayName(lang: string): string {
  return LANG_DISPLAY_NAMES[lang] || lang.charAt(0).toUpperCase() + lang.slice(1);
}

/**
 * Render a subset of Markdown to HTML.
 *
 * Supports: code blocks, inline code, headings (h1-h3), bold, italic,
 * links, unordered lists, and paragraph wrapping.  The input is HTML-escaped
 * first so the result is safe for innerHTML.
 */
export function renderMarkdown(text: string): string {
  let t = escapeHtml(text);

  // Code blocks ```...```
  t = t.replaceAll(/```([\s\S]*?)```/g, '<pre class="md-code"><code>$1</code></pre>');

  // Inline code `...`
  t = t.replaceAll(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');

  // Headings (anchored to line start — negated class prevents backtracking)
  t = t.replaceAll(/^###[^\S\n]+(.+)$/gm, '<h3>$1</h3>');
  t = t.replaceAll(/^##[^\S\n]+(.+)$/gm, '<h2>$1</h2>');
  t = t.replaceAll(/^#[^\S\n]+(.+)$/gm, '<h1>$1</h1>');

  // Bold / Italic (negated class prevents backtracking)
  t = t.replaceAll(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replaceAll(/\*([^*]+)\*/g, '<em>$1</em>');

  // Links (negated classes prevent backtracking)
  t = t.replaceAll(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Unordered lists
  t = t.replaceAll(/(?:^|\n)-\s+(.+)(?=\n|$)/g, (_m: string, item: string) => `\n<ul><li>${item}</li></ul>`);
  t = t.replaceAll(/<ul>\s*<li>([\s\S]*?)<\/li>\s*<\/ul>\n<ul>/g, '<ul><li>$1</li>');

  // Paragraphs: wrap text blocks that are not block elements
  t = t.split(/\n\n+/)
    .map(block => /^(<h\d|<pre|<ul|<ol|<blockquote)/.test(block.trim()) ? block : `<p>${block.replaceAll('\n', '<br/>')}</p>`)
    .join('\n');

  return t;
}
