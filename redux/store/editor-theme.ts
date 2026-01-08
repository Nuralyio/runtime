/**
 * Editor Theme Store
 * Manages theme for the studio editor UI
 * Reads theme from current application settings (saved in DB, no localStorage)
 */

import { atom, computed } from 'nanostores';
import { $currentApplication } from './apps';

// Types
export type ThemeMode = 'light' | 'dark' | 'system';
export type DesignSystem = 'default' | 'carbon';
export type ThemeVariant = 'default-light' | 'default-dark' | 'carbon-light' | 'carbon-dark';

export interface EditorThemeSettings {
  mode: ThemeMode;
  designSystem: DesignSystem;
}

/**
 * Environment detection flag
 */
const isServer: boolean = typeof window === 'undefined';

/**
 * Detect system color scheme preference
 */
function getSystemPreference(): 'light' | 'dark' {
  if (isServer) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Parse editor theme from application data
 */
function parseEditorTheme(app: any): EditorThemeSettings {
  const editorTheme = app?.editorTheme;
  if (!editorTheme) {
    return { mode: 'system', designSystem: 'default' };
  }
  return {
    mode: editorTheme.mode || 'system',
    designSystem: editorTheme.designSystem || 'default'
  };
}

/**
 * System preference atom for reactivity when OS theme changes
 */
export const $systemPreference = atom<'light' | 'dark'>(getSystemPreference());

/**
 * Computed: Editor theme settings from current application
 */
export const $editorTheme = computed($currentApplication, (app): EditorThemeSettings => {
  return parseEditorTheme(app);
});

/**
 * Computed: Resolved theme variant (e.g., 'default-dark')
 * Combines editor settings with system preference
 */
export const $editorThemeVariant = computed(
  [$editorTheme, $systemPreference],
  (settings, systemPref): ThemeVariant => {
    const resolvedMode = settings.mode === 'system' ? systemPref : settings.mode;
    return `${settings.designSystem}-${resolvedMode}` as ThemeVariant;
  }
);

/**
 * Check if current theme is dark
 */
export const $isEditorDark = computed($editorThemeVariant, (variant): boolean => {
  return variant.includes('dark');
});

/**
 * Initialize system preference listener
 * Call on app startup to react to OS theme changes
 * @returns Cleanup function
 */
export function initSystemPreferenceListener(): () => void {
  if (isServer) return () => {};

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => {
    $systemPreference.set(getSystemPreference());
  };

  mediaQuery.addEventListener('change', handler);
  return () => mediaQuery.removeEventListener('change', handler);
}

/**
 * Get editor theme settings for updating application
 * Use this when saving theme to database
 */
export function createEditorThemePayload(mode: ThemeMode, designSystem: DesignSystem): EditorThemeSettings {
  return { mode, designSystem };
}
