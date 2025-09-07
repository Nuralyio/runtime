/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement} from 'lit';

/**
 * Theme detection and management mixin for Lit components
 * Provides data-theme attribute detection with system fallback
 */
export interface ThemeAware {
  currentTheme: 'light' | 'dark';
}

type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Mixin that adds theme management functionality to LitElement components
 * 
 * @param superClass - The base class to extend (typically LitElement)
 * @returns Enhanced class with theme management capabilities
 * 
 * @example
 * ```typescript
 * @customElement('my-component')
 * export class MyComponent extends ThemeAwareMixin(LitElement) {
 *   render() {
 *     return html`<div data-theme="${this.currentTheme}">Content</div>`;
 *   }
 * }
 * ```
 */
export const ThemeAwareMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class ThemeAwareClass extends superClass implements ThemeAware {
    private themeObserver?: MutationObserver;
    private mediaQuery?: MediaQueryList;

    override connectedCallback() {
      super.connectedCallback();
      this.setupThemeObserver();
      this.setupSystemThemeListener();
    }

    override disconnectedCallback() {
      super.disconnectedCallback();
      this.themeObserver?.disconnect();
      this.mediaQuery?.removeEventListener('change', this.handleSystemThemeChange);
    }

    /**
     * Gets the current theme by checking data-theme attribute in DOM hierarchy
     * Falls back to system preference if no data-theme is found
     */
    get currentTheme(): 'light' | 'dark' {
      // Check for data-theme attribute starting from this element and going up
      const dataTheme = this.closest('[data-theme]')?.getAttribute('data-theme') ||
                       document.documentElement.getAttribute('data-theme');
      
      if (dataTheme === 'dark' || dataTheme === 'light') {
        return dataTheme;
      }

      // Fallback to system preference
      if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      
      return 'light';
    }

    private setupThemeObserver() {
      // Watch for data-theme changes on document
      this.themeObserver = new MutationObserver(() => {
        this.requestUpdate();
      });

      // Observe document element for data-theme changes
      this.themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
      });
    }

    private setupSystemThemeListener() {
      if (window.matchMedia) {
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.mediaQuery.addEventListener('change', this.handleSystemThemeChange);
      }
    }

    private handleSystemThemeChange = () => {
      // Only trigger update if no explicit data-theme is set
      if (!this.closest('[data-theme]') && !document.documentElement.hasAttribute('data-theme')) {
        this.requestUpdate();
      }
    };
  }

  return ThemeAwareClass as Constructor<ThemeAware> & T;
};

/**
 * Standalone theme detection utility function
 * For components that don't want to use the mixin approach
 * 
 * @param element - The element to start theme detection from
 * @returns The detected theme ('light' or 'dark')
 */
export function detectTheme(element: Element): 'light' | 'dark' {
  // Check for data-theme attribute starting from this element and going up
  const dataTheme = element.closest('[data-theme]')?.getAttribute('data-theme') ||
                   document.documentElement.getAttribute('data-theme');
  
  if (dataTheme === 'dark' || dataTheme === 'light') {
    return dataTheme;
  }

  // Fallback to system preference
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'light';
}

/**
 * CSS template literal helper for theme-aware styles
 * Generates CSS with both data-theme selectors and system fallback
 * 
 * @param lightThemeVars - CSS custom properties for light theme
 * @param darkThemeVars - CSS custom properties for dark theme
 * @returns CSS template literal
 * 
 * @example
 * ```typescript
 * import { css } from 'lit';
 * import { createThemeStyles } from '../shared/theme-mixin.js';
 * 
 * const styles = css`
 *   ${createThemeStyles(
 *     css`--color: black; --bg: white;`,
 *     css`--color: white; --bg: black;`
 *   )}
 *   
 *   .content {
 *     color: var(--color);
 *     background: var(--bg);
 *   }
 * `;
 * ```
 */
export function createThemeStyles(lightThemeVars: any, darkThemeVars: any) {
  return `
    /* Light theme (default) */
    :host {
      ${lightThemeVars}
    }
    
    /* Dark theme using data-theme attribute */
    :host([data-theme="dark"]) {
      ${darkThemeVars}
    }
    
    /* System theme fallback for dark preference */
    @media (prefers-color-scheme: dark) {
      :host(:not([data-theme])) {
        ${darkThemeVars}
      }
    }
  `;
}
