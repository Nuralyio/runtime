/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveController, ReactiveControllerHost } from 'lit';
import { ThemeVariant, getCurrentTheme } from '../themes/index.js';

/**
 * Theme controller that observes and reacts to theme changes on the host element or its parents
 * This controller watches for data-theme attribute changes and triggers re-renders
 */
export class ThemeController implements ReactiveController {
  private host: ReactiveControllerHost & HTMLElement;
  private observer?: MutationObserver;
  private _currentTheme: ThemeVariant | null = null;

  constructor(host: ReactiveControllerHost & HTMLElement) {
    this.host = host;
    host.addController(this);
  }

  /**
   * Get the current theme variant
   */
  get currentTheme(): ThemeVariant | null {
    return this._currentTheme;
  }

  /**
   * Check if the current theme is a dark variant
   */
  get isDark(): boolean {
    return this._currentTheme?.includes('dark') ?? false;
  }

  /**
   * Check if the current theme is a light variant
   */
  get isLight(): boolean {
    return this._currentTheme?.includes('light') ?? true;
  }

  /**
   * Get the theme system (default, carbon)
   */
  get themeSystem(): string {
    if (!this._currentTheme) return 'default';
    
    if (this._currentTheme.startsWith('carbon')) return 'carbon';
    return 'default';
  }

  hostConnected(): void {
    this.updateTheme();
    this.setupObserver();
  }

  hostDisconnected(): void {
    this.cleanup();
  }

  private updateTheme(): void {
    const newTheme = getCurrentTheme(this.host);
    if (newTheme !== this._currentTheme) {
      this._currentTheme = newTheme;
      this.host.requestUpdate();
    }
  }

  private setupObserver(): void {
    this.cleanup();

    // Create a mutation observer to watch for theme changes
    this.observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;

      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-theme'
        ) {
          shouldUpdate = true;
        }
      });

      if (shouldUpdate) {
        this.updateTheme();
      }
    });

    // Start observing the host element and its ancestors
    let element: HTMLElement | null = this.host;
    while (element) {
      this.observer.observe(element, {
        attributes: true,
        attributeFilter: ['data-theme']
      });
      element = element.parentElement;
    }

    // Also observe the document.body for theme changes
    if (typeof document !== 'undefined' && document.body) {
      this.observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['data-theme']
      });
    }
  }

  private cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }

  /**
   * Apply a theme to the closest themed ancestor or the host element
   * @param theme - The theme variant to apply
   */
  applyTheme(theme: ThemeVariant): void {
    // Find the closest element with a data-theme attribute, or use the host
    let targetElement: HTMLElement | null = this.host;
    
    while (targetElement && !targetElement.hasAttribute('data-theme')) {
      targetElement = targetElement.parentElement;
    }
    
    if (!targetElement) {
      targetElement = this.host;
    }

    targetElement.setAttribute('data-theme', theme);
  }

  /**
   * Toggle between light and dark variants of the current theme
   */
  toggleVariant(): void {
    const currentTheme = this._currentTheme || 'default-light';
    
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
      this.applyTheme(newTheme);
    }
  }
}
