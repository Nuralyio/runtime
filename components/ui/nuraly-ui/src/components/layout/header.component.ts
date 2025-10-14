import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import { headerStyles } from './header.style.js';

/**
 * # Header Component
 * 
 * The top layout component with default styling.
 * Must be placed inside a Layout component.
 * 
 * @element nr-header
 * 
 * @slot - Default slot for header content
 * 
 * @csspart header - The header container element
 * 
 * @example
 * ```html
 * <nr-layout>
 *   <nr-header>
 *     <div class="logo">My App</div>
 *     <nav>Navigation</nav>
 *   </nr-header>
 * </nr-layout>
 * ```
 */
@customElement('nr-header')
export class NrHeaderElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = headerStyles;

  /**
   * Height of the header. Default is 64px.
   */
  @property({ type: String })
  height = '64px';

  override render() {
    return html`
      <header 
        class="nr-header" 
        part="header"
        style="height: ${this.height}"
      >
        <slot></slot>
      </header>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-header': NrHeaderElement;
  }
}
