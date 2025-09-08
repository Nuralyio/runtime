/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ButtonType, ButtonShape, EMPTY_STRING, IconPosition } from './button.types.js';
import { styles } from './button.style.js';
import { NuralyUIBaseMixin } from '../../shared/base-mixin.js';
import { RippleMixin, KeyboardMixin, LinkMixin } from './mixins/index.js';

/**
 * - NuralyUIBaseMixin: Core functionality (theme, dependencies, events)
 * - RippleMixin: Ripple effect handling
 * - KeyboardMixin: Keyboard interaction (Enter/Space activation)
 * - LinkMixin: Link-specific behavior for ButtonType.Link
 */
@customElement('nr-button')
export class NrButtonElement extends RippleMixin(
  KeyboardMixin(
    LinkMixin(
      NuralyUIBaseMixin(LitElement)
    )
  )
) {
  // Button state properties
  @property({ type: Boolean })
  override disabled = false;

  @property({ type: Boolean })
  loading = false;

  @property({ type: String })
  size = EMPTY_STRING;

  @property({ type: String })
  override type: ButtonType = ButtonType.Default;

  @property({ type: String })
  shape: ButtonShape = ButtonShape.Default;

  @property({ type: Boolean })
  block = false;

  @property({ type: Boolean })
  dashed = false;

  // Icon properties
  @property({ type: Array })
  icon: string[] = [];

  @property({ reflect: true })
  iconPosition = IconPosition.Left;

  // Link properties (inherited from LinkMixin)
  @property({ type: String })
  override href = EMPTY_STRING;

  @property({ type: String })
  override target = EMPTY_STRING;

  // Ripple property (inherited from RippleMixin)
  @property({ type: Boolean })
  override ripple = true;

  // Accessibility properties
  @property({ type: String })
  buttonAriaLabel = EMPTY_STRING;

  @property({ type: String })
  ariaDescribedBy = EMPTY_STRING;

  @property({ type: String })
  htmlType = EMPTY_STRING;

  /**
   * Required components that must be registered for this component to work properly
   */
  override requiredComponents = ['hy-icon'];

  /**
   * Check for required dependencies when component is connected to DOM
   */
  override connectedCallback() {
    super.connectedCallback();
    this.validateDependencies();
  }

  /**
   * Get common attributes for both button and anchor elements
   */
  private getCommonAttributes() {
    return {
      'data-type': this.type,
      'data-shape': this.shape,
      'data-size': this.size || nothing,
      'data-state': this.loading ? 'loading' : nothing,
      'data-theme': this.currentTheme,
      'data-block': this.block ? 'true' : nothing,
      'class': this.dashed ? 'button-dashed' : '',
      'aria-disabled': this.disabled ? 'true' : 'false',
      'aria-label': this.buttonAriaLabel || nothing,
      'aria-describedby': this.ariaDescribedBy || nothing,
      'tabindex': this.disabled ? '-1' : '0'
    };
  }

  /**
   * Renders an icon if the hy-icon component is available
   * @param iconName - The name of the icon to render
   * @returns TemplateResult or nothing
   */
  private renderIcon(iconName: string) {
    if (!this.isComponentAvailable('hy-icon')) {
      console.warn(
        `hy-icon component not found. Icon "${iconName}" will not be displayed. ` +
        `Please import hy-icon component.`
      );
      return nothing;
    }
    return html`<hy-icon name=${iconName}></hy-icon>`;
  }

  /**
   * Handle comprehensive click events with proper event dispatching
   */
  private handleClick(event: MouseEvent) {
    if (this.disabled) {
      event.preventDefault();
      return;
    }

    // Use RippleMixin method
    this.handleRippleClick(event);
    
    // Handle link navigation if it's a link type
    if (this.isLinkType()) {
      this.dispatchCustomEvent('link-navigation', {
        href: this.href,
        target: this.target,
        timestamp: Date.now(),
        originalEvent: event
      });
    }
    
    // Dispatch button event with metadata using EventHandlerMixin
    this.dispatchEventWithMetadata('button-clicked', {
      type: this.type,
      disabled: this.disabled,
      loading: this.loading,
      href: this.href || null
    });
  }

  override render() {
    const elementTag = this.getElementTag(); // From LinkMixin
    const commonAttributes = this.getCommonAttributes();
    const linkAttributes = this.getLinkAttributes(); // From LinkMixin
    
    const content = html`
      <span id="container">
        ${this.icon?.length ? this.renderIcon(this.icon[0]) : nothing}
        <slot id="slot"></slot>
        ${this.icon?.length === 2 ? this.renderIcon(this.icon[1]) : nothing}
      </span>
    `;
    
    if (elementTag === 'a') {
      return html`
        <a
          href="${linkAttributes.href}"
          target="${linkAttributes.target || nothing}"
          rel="${linkAttributes.rel || nothing}"
          role="${linkAttributes.role}"
          data-type="${commonAttributes['data-type']}"
          data-shape="${commonAttributes['data-shape']}"
          data-size="${commonAttributes['data-size']}"
          data-state="${commonAttributes['data-state']}"
          data-theme="${commonAttributes['data-theme']}"
          data-block="${commonAttributes['data-block']}"
          class="${commonAttributes.class}"
          aria-disabled="${this.disabled}"
          aria-label="${this.buttonAriaLabel || nothing}"
          aria-describedby="${this.ariaDescribedBy || nothing}"
          tabindex="${this.disabled ? -1 : 0}"
          @click="${this.handleClick}"
          @keydown="${this.handleKeydown}"
        >
          ${content}
        </a>
      `;
    }
    
    return html`
      <button
        ?disabled="${this.disabled}"
        type="${(this.htmlType || 'button') as 'button' | 'submit' | 'reset'}"
        role="${linkAttributes.role}"
        data-type="${commonAttributes['data-type']}"
        data-shape="${commonAttributes['data-shape']}"
        data-size="${commonAttributes['data-size']}" 
        data-state="${commonAttributes['data-state']}"
        data-theme="${commonAttributes['data-theme']}"
        data-block="${commonAttributes['data-block']}"
        class="${commonAttributes.class}"
        aria-disabled="${this.disabled}"
        aria-label="${this.buttonAriaLabel || nothing}"
        aria-describedby="${this.ariaDescribedBy || nothing}"
        tabindex="${this.disabled ? -1 : 0}"
        @click="${this.handleClick}"
        @keydown="${this.handleKeydown}"
      >
        ${content}
      </button>
    `;
  }
  static override styles = styles;
}
