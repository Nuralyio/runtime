/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Theme utilities and type definitions
 * 
 * NOTE: CSS theme files are in the @nuralyui/themes package
 * This file only contains TypeScript utilities and types
 */

export const THEME_VARIANTS = {
  'default-light': 'Default Light',
  'default-dark': 'Default Dark',
  'carbon-light': 'Carbon Light',
  'carbon-dark': 'Carbon Dark',
  // Backward compatibility
  'light': 'Default Light',
  'dark': 'Default Dark'
} as const;

export type ThemeVariant = keyof typeof THEME_VARIANTS;

/**
 * Utility function to apply theme to an element
 * @param element - The element to apply the theme to
 * @param theme - The theme variant to apply
 */
export function applyTheme(element: HTMLElement, theme: ThemeVariant): void {
  // Remove existing theme attributes
  element.removeAttribute('data-theme');
  
  // Apply new theme
  element.setAttribute('data-theme', theme);
}

/**
 * Utility function to get current theme from an element or its parents
 * @param element - The element to check for theme
 * @returns The current theme variant or null if not found
 */
export function getCurrentTheme(element: HTMLElement): ThemeVariant | null {
  let currentElement: HTMLElement | null = element;
  
  while (currentElement) {
    const theme = currentElement.getAttribute('data-theme') as ThemeVariant;
    if (theme && theme in THEME_VARIANTS) {
      return theme;
    }
    currentElement = currentElement.parentElement;
  }
  
  return null;
}

/**
 * Utility function to toggle between light and dark variants of the same theme
 * @param element - The element to toggle theme on
 */
export function toggleThemeVariant(element: HTMLElement): void {
  const currentTheme = getCurrentTheme(element);
  
  if (!currentTheme) {
    // Default to default-light if no theme is set
    applyTheme(element, 'default-light');
    return;
  }
  
  // Toggle between light and dark variants
  const toggleMap: Record<ThemeVariant, ThemeVariant> = {
    'default-light': 'default-dark',
    'default-dark': 'default-light',
    'carbon-light': 'carbon-dark',
    'carbon-dark': 'carbon-light',
    'light': 'dark',
    'dark': 'light'
  };
  
  const newTheme = toggleMap[currentTheme];
  if (newTheme) {
    applyTheme(element, newTheme);
  }
}

/**
 * Get the theme system name from a theme variant
 * @param theme - The theme variant
 * @returns The theme system name ('carbon' or 'default')
 */
export function getThemeSystem(theme: ThemeVariant | null): 'carbon' | 'default' {
  if (!theme) return 'default';
  if (theme.startsWith('carbon')) return 'carbon';
  return 'default';
}
