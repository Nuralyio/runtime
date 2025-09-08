/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement } from 'lit';
import { ThemeAwareMixin, ThemeAware } from './theme-mixin.js';
import { DependencyValidationMixin, DependencyAware } from './dependency-mixin.js';
import { EventHandlerMixin, EventHandlerCapable } from './event-handler-mixin.js';

/**
 * Base interface combining theme awareness, dependency validation, and event handling
 */
export interface NuralyUIBaseElement extends ThemeAware, DependencyAware, EventHandlerCapable {}

type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Global base mixin that combines ThemeAwareMixin and DependencyValidationMixin
 * This mixin provides a single entry point for all common functionality needed
 * by Nuraly UI components, reducing boilerplate code in individual components.
 * 
 * @param superClass - The base class to extend (typically LitElement)
 * @returns Enhanced class with both theme management and dependency validation capabilities
 * 
 * @example
 * ```typescript
 * @customElement('my-component')
 * export class MyComponent extends NuralyUIBaseMixin(LitElement) {
 *   requiredComponents = ['hy-icon'];
 *   
 *   render() {
 *     return html`<div data-theme="${this.currentTheme}">Content</div>`;
 *   }
 * }
 * ```
 */
export const NuralyUIBaseMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  // Apply all base mixins in the correct order:
  // EventHandlerMixin first, then DependencyValidationMixin, then ThemeAwareMixin
  return DependencyValidationMixin(ThemeAwareMixin(EventHandlerMixin(superClass)));
};

/**
 * Alternative shorter name for convenience
 */
export const BaseMixin = NuralyUIBaseMixin;
