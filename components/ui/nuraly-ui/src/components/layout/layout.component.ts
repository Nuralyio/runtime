import { LitElement, html } from 'lit';
import { customElement, property, queryAssignedElements } from 'lit/decorators.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import { layoutStyles } from './layout.style.js';

/**
 * # Layout Component
 * 
 * The layout wrapper component that provides the base structure for a page layout.
 * Can contain Header, Sider, Content, Footer, or nested Layout components.
 * 
 * @element nr-layout
 * 
 * @slot - Default slot for layout children (Header, Sider, Content, Footer, or nested Layout)
 * 
 * @csspart layout - The layout container element
 * 
 * @example
 * ```html
 * <nr-layout>
 *   <nr-header>Header</nr-header>
 *   <nr-content>Content</nr-content>
 *   <nr-footer>Footer</nr-footer>
 * </nr-layout>
 * ```
 */
@customElement('nr-layout')
export class NrLayoutElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = layoutStyles;

  /**
   * Whether the layout contains a Sider component.
   * When true, the layout uses horizontal flex direction.
   * Automatically detected from slotted content.
   */
  @property({ type: Boolean, reflect: true, attribute: 'has-sider' })
  hasSider = false;

  @queryAssignedElements({ selector: 'nr-sider' })

  override connectedCallback(): void {
    super.connectedCallback();
    this.detectSider();
  }

  override updated(changedProperties: Map<string, unknown>): void {
    super.updated(changedProperties);
    this.detectSider();
  }

  /**
   * Detects if the layout has a Sider component as a direct child
   */
  private detectSider(): void {
    const slot = this.shadowRoot?.querySelector('slot');
    if (slot) {
      const assignedElements = slot.assignedElements();
      const hasSiderElement = assignedElements.some(
        (el) => el.tagName.toLowerCase() === 'nr-sider'
      );
      if (this.hasSider !== hasSiderElement) {
        this.hasSider = hasSiderElement;
      }
    }
  }

  /**
   * Handles slot changes to re-detect sider elements
   */
  private handleSlotChange(): void {
    this.detectSider();
  }

  override render() {
    return html`
      <div class="nr-layout" part="layout">
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-layout': NrLayoutElement;
  }
}
