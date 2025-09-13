/**
 * Theme CSS Variables Index
 * 
 * Import these CSS files to apply design system themes with light/dark variants:
 * 
 * @example
 * ```html
 * <!-- Apply Carbon Design System Light -->
 * <div data-theme="carbon-light">
 *   <nr-button type="primary">Carbon Light Button</nr-button>
 * </div>
 * 
 * <!-- Apply Carbon Design System Dark -->
 * <div data-theme="carbon-dark">
 *   <nr-button type="primary">Carbon Dark Button</nr-button>
 * </div>
 * 
 * <!-- Apply Polaris Design System Light -->
 * <div data-theme="polaris-light">
 *   <nr-button type="primary">Polaris Light Button</nr-button>
 * </div>
 * 
 * <!-- Apply Polaris Design System Dark -->
 * <div data-theme="polaris-dark">
 *   <nr-button type="primary">Polaris Dark Button</nr-button>
 * </div>
 * 
 * <!-- Use default theme light -->
 * <div data-theme="default-light">
 *   <nr-button type="primary">Default Light Button</nr-button>
 * </div>
 * 
 * <!-- Use default theme dark -->
 * <div data-theme="default-dark">
 *   <nr-button type="primary">Default Dark Button</nr-button>
 * </div>
 * ```
 * 
 * @example JavaScript/TypeScript
 * ```ts
 * // In your app entry point
 * import './themes/carbon.css'; // for Carbon theme
 * // OR
 * import './themes/polaris.css'; // for Polaris theme
 * // OR
 * import './themes/default.css'; // for default theme
 * ```
 */

export const THEME_FILES = {
  // Main theme files (import complete themes with all components)
  default: './default.css',
  carbon: './carbon.css',
  polaris: './polaris.css',
  
  // Individual theme folders (for granular imports)
  'default-folder': './default/index.css',
  'carbon-folder': './carbon/index.css',
  'polaris-folder': './polaris/index.css',
  
  // Component-specific theme files (for component-only imports)
  'default-button': './default/button/index.css',
  'carbon-button': './carbon/button/index.css',
  'polaris-button': './polaris/button/index.css',
  
  // Core theme variables only (no component styles)
  'default-core': './default/theme.css',
  'carbon-core': './carbon/theme.css',
  'polaris-core': './polaris/theme.css'
} as const;

export type ThemeName = keyof typeof THEME_FILES;

export const THEME_VARIANTS = {
  'default-light': 'Default Light',
  'default-dark': 'Default Dark',
  'carbon-light': 'Carbon Light',
  'carbon-dark': 'Carbon Dark',
  'polaris-light': 'Polaris Light',
  'polaris-dark': 'Polaris Dark',
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
    'polaris-light': 'polaris-dark',
    'polaris-dark': 'polaris-light',
    'light': 'dark',
    'dark': 'light'
  };
  
  const newTheme = toggleMap[currentTheme];
  if (newTheme) {
    applyTheme(element, newTheme);
  }
}
