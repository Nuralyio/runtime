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

// Import icon component
import '../icon/icon.component.js';

// Import controllers
import {
  ButtonRippleController,
  ButtonKeyboardController,
  ButtonLinkController
} from './controllers/index.js';

// Import interfaces
import { ButtonHost } from './interfaces/index.js';

/**
 * Versatile button component with multiple variants, loading states, and icon support.
 * 
 * @example
 * ```html
 * <nr-button type="primary">Click me</nr-button>
 * <nr-button type="primary" icon='["home"]'>Home</nr-button>
 * <nr-button loading>Processing...</nr-button>
 * ```
 * 
 * @fires button-clicked - Button clicked
 * @fires link-navigation - Link navigation
 * 
 * @slot default - Button text content
 */
@customElement('nr-button')
export class NrButtonElement extends NuralyUIBaseMixin(LitElement) implements ButtonHost {
  static override styles = styles;
  /** Disables the button */
  @property({ type: Boolean })
  disabled = false;

  /** Shows loading spinner */
  @property({ type: Boolean })
  loading = false;

  /** Button size (small, medium, large) */
  @property({ type: String })
  size = EMPTY_STRING;

  /** Button type (default, primary, secondary, danger, ghost, link) */
  @property({ type: String })
  type: ButtonType = ButtonType.Default;

  /** Button shape (default, circle, round) */
  @property({ type: String })
  shape: ButtonShape = ButtonShape.Default;

  /** Makes button full width */
  @property({ type: Boolean })
  block = false;

  /** Applies dashed border */
  @property({ type: Boolean })
  dashed = false;

  /** Icon names array (supports 1-2 icons) */
  @property({ type: Array })
  icon: string[] = [];

  /** Icon position relative to text */
  @property({ reflect: true })
  iconPosition = IconPosition.Left;

  /** URL for link-type buttons */
  @property({ type: String })
  href = EMPTY_STRING;

  /** Target attribute for links */
  @property({ type: String })
  target = EMPTY_STRING;

  /** Enables ripple effect */
  @property({ type: Boolean })
  ripple = true;

  /** Custom aria-label */
  @property({ type: String })
  buttonAriaLabel = EMPTY_STRING;

  /** References to descriptive elements */
  @property({ type: String })
  ariaDescribedBy = EMPTY_STRING;

  /** HTML button type */
  @property({ type: String })
  htmlType = EMPTY_STRING;

  override requiredComponents = ['hy-icon'];

  // Controllers
  private rippleController = new ButtonRippleController(this);
  private keyboardController = new ButtonKeyboardController(this);
  private linkController = new ButtonLinkController(this);

  override connectedCallback() {
    super.connectedCallback();
    this.validateDependencies();
  }

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

  private renderIcon(iconName: string) {
    if (!this.isComponentAvailable('hy-icon')) {
      console.warn(
        `[nr-button] Icon component 'hy-icon' not available. Icon "${iconName}" will not render. ` +
        `Ensure the icon component is imported and registered.`
      );
      return nothing;
    }
    return html`<hy-icon name=${iconName}></hy-icon>`;
  }

  private handleClick(event: MouseEvent) {
    if (this.disabled) {
      event.preventDefault();
      return;
    }

    this.rippleController.handleRippleClick(event);
    
    if (this.linkController.isLinkType()) {
      this.linkController.handleLinkNavigation(event);
    }
    
    this.dispatchEventWithMetadata('button-clicked', {
      type: this.type,
      disabled: this.disabled,
      loading: this.loading,
      href: this.href || null
    });
  }

  private handleKeydown(event: KeyboardEvent) {
    this.keyboardController.handleKeydown(event);
  }

  override render() {
    const elementTag = this.linkController.getElementTag();
    const commonAttributes = this.getCommonAttributes();
    const linkAttributes = this.linkController.getLinkAttributes();
    
    const content = html`
      <span id="container" part="container">
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
}
