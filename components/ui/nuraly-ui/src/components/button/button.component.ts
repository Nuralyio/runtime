/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ButtonType, ButtonSize, ButtonShape, EMPTY_STRING, IconPosition, ButtonIcons, ButtonIcon, ButtonIconsConfig } from './button.types.js';
import { styles } from './button.style.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';

// Import controllers
import {
    ButtonRippleController,
    ButtonKeyboardController,
    ButtonLinkController
} from './controllers/index.js';

// Import interfaces
import { ButtonHost } from './interfaces/index.js';

/**
 * Versatile button component with multiple variants, loading states, and enhanced icon support.
 * 
 * @example
 * ```html
 * <!-- Simple usage -->
 * <nr-button type="primary">Click me</nr-button>
 * 
 * <!-- Array-based icons (original API) -->
 * <nr-button type="primary" .icon=${['add']}>Add Item</nr-button>
 * <nr-button type="primary" .icon=${['home', 'arrow-right']}>Home</nr-button>
 * 
 * <!-- Separate icon properties (new API) -->
 * <nr-button type="primary" iconLeft="home" iconRight="arrow-right">Navigate</nr-button>
 * <nr-button type="primary" .iconLeft=${{name: 'home', color: 'blue'}}>Enhanced</nr-button>
 * 
 * <!-- Object-based icons (new API) -->
 * <nr-button type="primary" .icons=${{left: 'home', right: 'arrow-right'}}>Navigate</nr-button>
 * 
 * <!-- Loading state -->
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
  size: ButtonSize | '' = EMPTY_STRING;

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

  /** Icon configuration (supports strings or enhanced config objects) */
  @property({ type: Array })
  icon: ButtonIcons = [];

  /** Left icon (alternative to icon array) */
  @property({ type: Object })
  iconLeft?: ButtonIcon;

  /** Right icon (alternative to icon array) */
  @property({ type: Object })
  iconRight?: ButtonIcon;

  /** Icon configuration object (alternative to icon array) */
  @property({ type: Object })
  icons?: ButtonIconsConfig;

  /** Icon position relative to text */
  @property({ reflect: true })
  iconPosition: IconPosition = IconPosition.Left;

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

  override requiredComponents = ['nr-icon'];

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

  private renderIcon(iconConfig: ButtonIcon) {
    if (!this.isComponentAvailable('nr-icon')) {
      const iconName = typeof iconConfig === 'string' ? iconConfig : iconConfig.name;
      console.warn(
        `[nr-button] Icon component 'nr-icon' not available. Icon "${iconName}" will not render. ` +
        `Ensure the icon component is imported and registered.`
      );
      return nothing;
    }

    // Get appropriate icon size based on button size
    const getIconSizeForButtonSize = (): 'small' | 'medium' | 'large' | undefined => {
      switch (this.size) {
        case ButtonSize.Small:
          return 'small';
        case ButtonSize.Medium:
          return 'medium';
        case ButtonSize.Large:
          return 'large';
        default:
          return 'medium'; // Default to medium if no size specified
      }
    };

    // Handle simple string input (backward compatibility)
    if (typeof iconConfig === 'string') {
      const iconSize = getIconSizeForButtonSize();
      return html`<nr-icon name=${iconConfig} size=${ifDefined(iconSize)}></nr-icon>`;
    }

    // Handle enhanced icon configuration
    const {
      name,
      type = 'solid',
      size,
      color,
      alt
    } = iconConfig;

    // Use explicit size if provided, otherwise use size based on button size
    const resolvedSize = size || getIconSizeForButtonSize();
    const iconSize = resolvedSize as 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' | undefined;

    return html`<nr-icon 
      name=${name}
      type=${type}
      alt=${alt || ''}
      size=${ifDefined(iconSize)}
      color=${color || ''}
    ></nr-icon>`;
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

  /**
   * Get the resolved left icon from various sources
   */
  private getResolvedLeftIcon(): ButtonIcon | undefined {
    // Priority: iconLeft > icons.left > icon[0]
    if (this.iconLeft) return this.iconLeft;
    if (this.icons?.left) return this.icons.left;
    if (this.icon?.length > 0) return this.icon[0];
    return undefined;
  }

  /**
   * Get the resolved right icon from various sources
   */
  private getResolvedRightIcon(): ButtonIcon | undefined {
    // Priority: iconRight > icons.right > icon[1]
    if (this.iconRight) return this.iconRight;
    if (this.icons?.right) return this.icons.right;
    if (this.icon?.length === 2) return this.icon[1];
    return undefined;
  }

  override render() {
    const elementTag = this.linkController.getElementTag();
    const commonAttributes = this.getCommonAttributes();
    const linkAttributes = this.linkController.getLinkAttributes();
    
    const leftIcon = this.getResolvedLeftIcon();
    const rightIcon = this.getResolvedRightIcon();
    
    const content = html`
      <span id="container" part="container">
        ${leftIcon ? this.renderIcon(leftIcon) : nothing}
        <slot id="slot"></slot>
        ${rightIcon ? this.renderIcon(rightIcon) : nothing}
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
