import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { NuralyUIBaseMixin } from '../../shared/base-mixin.js';
import { footerStyles } from './footer.style.js';

/**
 * # Footer Component
 * 
 * The bottom layout component with default styling.
 * Must be placed inside a Layout component.
 * 
 * @element nr-footer
 * 
 * @slot - Default slot for footer content
 * 
 * @csspart footer - The footer container element
 * 
 * @example
 * ```html
 * <nr-layout>
 *   <nr-footer>
 *     Copyright © 2025 My Company
 *   </nr-footer>
 * </nr-layout>
 * ```
 */
@customElement('nr-footer')
export class NrFooterElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = footerStyles;

  /**
   * Padding of the footer. Default is "24px 50px".
   */
  @property({ type: String })
  padding = '24px 50px';

  override render() {
    return html`
      <footer 
        class="nr-footer" 
        part="footer"
        style="padding: ${this.padding}"
      >
        <slot></slot>
      </footer>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-footer': NrFooterElement;
  }
}
