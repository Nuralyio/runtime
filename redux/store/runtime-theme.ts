/**
 * Runtime Theme Store
 * Manages theme hierarchy for preview/runtime: System → App → Page → Component
 * All values come from database (no localStorage)
 */

import { atom, computed, map } from 'nanostores';

// Types
export type RuntimeThemeValue = 'default-light' | 'default-dark' | 'carbon-light' | 'carbon-dark' | 'auto';
export type ResolvedTheme = 'default-light' | 'default-dark' | 'carbon-light' | 'carbon-dark';

/**
 * Environment detection flag
 */
const isServer: boolean = typeof window === 'undefined';

/**
 * Detect system color scheme preference
 */
function getSystemPreference(): ResolvedTheme {
  if (isServer) return 'default-light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'default-dark'
    : 'default-light';
}

/**
 * Resolve theme value - if 'auto', use parent theme
 */
export function resolveTheme(value: RuntimeThemeValue | undefined, parentTheme: ResolvedTheme): ResolvedTheme {
  if (!value || value === 'auto') return parentTheme;
  return value;
}

/**
 * System preference atom (reactive to OS changes)
 */
export const $runtimeSystemTheme = atom<ResolvedTheme>(getSystemPreference());

/**
 * App theme from application data
 * Set via setAppTheme() when app data is loaded or updated
 */
export const $appTheme = atom<RuntimeThemeValue>('auto');

/**
 * Page theme from page data
 * Set via setPageTheme() when page data is loaded or updated
 */
export const $pageTheme = atom<RuntimeThemeValue>('auto');

/**
 * Component-level theme overrides
 * Key: component UUID, Value: theme setting
 */
export const $componentThemes = map<Record<string, RuntimeThemeValue>>({});

/**
 * Computed: Resolved app theme (app setting or system fallback)
 */
export const $resolvedAppTheme = computed(
  [$appTheme, $runtimeSystemTheme],
  (appTheme, systemTheme): ResolvedTheme => {
    return resolveTheme(appTheme, systemTheme);
  }
);

/**
 * Computed: Resolved page theme (page setting or app fallback)
 */
export const $resolvedPageTheme = computed(
  [$pageTheme, $resolvedAppTheme],
  (pageTheme, appTheme): ResolvedTheme => {
    return resolveTheme(pageTheme, appTheme);
  }
);

/**
 * Check if resolved page theme is dark
 */
export const $isRuntimeDark = computed($resolvedPageTheme, (theme): boolean => {
  return theme.includes('dark');
});

/**
 * Set app theme (call when app data is loaded/updated)
 */
export function setAppTheme(theme: RuntimeThemeValue): void {
  $appTheme.set(theme);
}

/**
 * Set page theme (call when page data is loaded/updated)
 */
export function setPageTheme(theme: RuntimeThemeValue): void {
  $pageTheme.set(theme);
}

/**
 * Set component theme override
 */
export function setComponentTheme(componentId: string, theme: RuntimeThemeValue): void {
  $componentThemes.setKey(componentId, theme);
}

/**
 * Clear component theme override
 */
export function clearComponentTheme(componentId: string): void {
  const themes = { ...$componentThemes.get() };
  delete themes[componentId];
  $componentThemes.set(themes);
}

/**
 * Get resolved theme for a specific component
 * @param componentId - Component UUID
 * @param componentTheme - Optional theme from component data
 * @returns Resolved theme (component → page → app → system)
 */
export function getResolvedComponentTheme(componentId: string, componentTheme?: RuntimeThemeValue): ResolvedTheme {
  // Check component-level override first
  const overrideTheme = $componentThemes.get()[componentId];
  if (overrideTheme && overrideTheme !== 'auto') {
    return overrideTheme;
  }

  // Check component data theme
  if (componentTheme && componentTheme !== 'auto') {
    return componentTheme;
  }

  // Fallback to page theme
  return $resolvedPageTheme.get();
}

/**
 * Initialize system preference listener
 * Call on app startup to react to OS theme changes
 * @returns Cleanup function
 */
export function initRuntimeSystemListener(): () => void {
  if (isServer) return () => {};

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => {
    $runtimeSystemTheme.set(getSystemPreference());
  };

  mediaQuery.addEventListener('change', handler);
  return () => mediaQuery.removeEventListener('change', handler);
}

/**
 * Initialize runtime theme from app and page data
 * Call when app/page is loaded
 */
export function initRuntimeThemeFromData(
  appData?: { theme?: RuntimeThemeValue },
  pageData?: { theme?: RuntimeThemeValue }
): void {
  if (appData?.theme) {
    $appTheme.set(appData.theme);
  }
  if (pageData?.theme) {
    $pageTheme.set(pageData.theme);
  }
}

/**
 * Reset all runtime theme state
 */
export function resetRuntimeTheme(): void {
  $appTheme.set('auto');
  $pageTheme.set('auto');
  $componentThemes.set({});
}
