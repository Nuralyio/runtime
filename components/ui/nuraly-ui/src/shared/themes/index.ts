/**
 * Theme CSS Variables Index
 * 
 * Import these CSS files to apply design system themes:
 * 
 * @example
 * ```html
 * <!-- Apply Carbon Design System -->
 * <link rel="stylesheet" href="./carbon.css">
 * 
 * <!-- Apply Polaris Design System -->
 * <link rel="stylesheet" href="./polaris.css">
 * 
 * <!-- Use default theme -->
 * <link rel="stylesheet" href="./default.css">
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
  default: './default.css',
  carbon: './carbon.css',
  polaris: './polaris.css'
} as const;

export type ThemeName = keyof typeof THEME_FILES;
