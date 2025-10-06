import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { NuralyUIBaseMixin } from '../../shared/base-mixin.js';
import { contentStyles } from './content.style.js';

/**
 * # Content Component
 * 
 * The content layout component with default styling.
 * Must be placed inside a Layout component.
 * 
 * @element nr-content
 * 
 * @slot - Default slot for main content
 * 
 * @csspart content - The content container element
 * 
 * @example
 * ```html
 * <nr-layout>
 *   <nr-content>
 *     <h1>Main Content</h1>
 *     <p>Your content goes here...</p>
 *   </nr-content>
 * </nr-layout>
 * ```
 */
@customElement('nr-content')
export class NrContentElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = contentStyles;

  override render() {
    return html`
      <main class="nr-content" part="content">
        <slot></slot>
      </main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-content': NrContentElement;
  }
}
