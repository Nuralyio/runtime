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
  if (isNaN(date.getTime())) return '';

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
