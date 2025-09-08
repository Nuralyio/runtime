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
 * A versatile button component that supports multiple variants, sizes, and interactive states.
 * 
 * Features:
 * - Multiple button types (default, primary, secondary, danger, ghost, link)
 * - Configurable shapes (default, circle, round)
 * - Loading states with spinner integration
 * - Icon support with flexible positioning
 * - Accessibility compliant (WCAG 2.1 AA)
 * - Keyboard navigation support
 * - Material Design ripple effects
 * - Theme system integration
 * 
 * @example Basic usage
 * ```html
 * <nr-button type="primary">Click me</nr-button>
 * ```
 * 
 * @example With icon
 * ```html
 * <nr-button type="primary" icon='["home"]'>Home</nr-button>
 * ```
 * 
 * @example Loading state
 * ```html
 * <nr-button loading>Processing...</nr-button>
 * ```
 * 
 * @fires button-clicked - Fired when the button is clicked
 * @fires link-navigation - Fired when button acts as a link
 * 
 * @slot default - The button's text content
 * 
 * @csspart container - The inner container element
 * @csspart icon - The icon elements
 * 
 * @cssprop --nr-button-color - Button text color
 * @cssprop --nr-button-background - Button background color
 * @cssprop --nr-button-border - Button border
 * @cssprop --nr-button-radius - Button border radius
 * @cssprop --nr-button-padding - Button padding
 * @cssprop --nr-button-font-size - Button font size
 * @cssprop --nr-button-height - Button height
 */
@customElement('nr-button')
export class NrButtonElement extends RippleMixin(
  KeyboardMixin(
    LinkMixin(
      NuralyUIBaseMixin(LitElement)
    )
  )
) {
  /**
   * Disables the button and prevents user interaction.
   * When disabled, the button cannot be clicked, focused, or activated via keyboard.
   */
  @property({ type: Boolean })
  override disabled = false;

  /**
   * Shows a loading spinner and disables interaction.
   * Useful for async operations like form submissions or API calls.
   */
  @property({ type: Boolean })
  loading = false;

  /**
   * Controls the button size.
   * @default "" (medium)
   * Accepts: "small", "large", or empty string for default size
   */
  @property({ type: String })
  size = EMPTY_STRING;

  /**
   * Defines the button's visual style and semantic meaning.
   * @default ButtonType.Default
   */
  @property({ type: String })
  override type: ButtonType = ButtonType.Default;

  /**
   * Controls the button's corner radius and overall shape.
   * @default ButtonShape.Default
   */
  @property({ type: String })
  shape: ButtonShape = ButtonShape.Default;

  /**
   * Makes the button span the full width of its container.
   * Useful for mobile layouts or form buttons.
   */
  @property({ type: Boolean })
  block = false;

  /**
   * Applies a dashed border style instead of solid.
   * Typically used for secondary actions or upload areas.
   */
  @property({ type: Boolean })
  dashed = false;

  /**
   * Array of icon names to display within the button.
   * Supports 1-2 icons: [leftIcon] or [leftIcon, rightIcon]
   * Icons are rendered using the hy-icon component.
   */
  @property({ type: Array })
  icon: string[] = [];

  /**
   * Controls the position of the primary icon relative to text.
   * @default IconPosition.Left
   */
  @property({ reflect: true })
  iconPosition = IconPosition.Left;

  /**
   * URL for link-type buttons.
   * When provided with type="link", renders as an anchor element.
   */
  @property({ type: String })
  override href = EMPTY_STRING;

  /**
   * Target attribute for link-type buttons.
   * Common values: "_blank", "_self", "_parent", "_top"
   */
  @property({ type: String })
  override target = EMPTY_STRING;

  /**
   * Enables Material Design ripple effect on interaction.
   * @default true
   */
  @property({ type: Boolean })
  override ripple = true;

  /**
   * Custom aria-label for enhanced accessibility.
   * Use when button text doesn't adequately describe its purpose.
   */
  @property({ type: String })
  buttonAriaLabel = EMPTY_STRING;

  /**
   * References other elements that describe this button.
   * Should contain space-separated IDs of descriptive elements.
   */
  @property({ type: String })
  ariaDescribedBy = EMPTY_STRING;

  /**
   * HTML button type attribute.
   * Valid values: "button", "submit", "reset"
   * @default "button"
   */
  @property({ type: String })
  htmlType = EMPTY_STRING;

  /**
   * List of component dependencies that must be available in the registry.
   * These components are validated during initialization to ensure proper functionality.
   * @internal
   */
  override requiredComponents = ['hy-icon'];

  /**
   * Lifecycle method called when the element is added to the DOM.
   * Validates that all required dependencies are available and initializes the component.
   * @internal
   */
  override connectedCallback() {
    super.connectedCallback();
    this.validateDependencies();
  }

  /**
   * Generates common HTML attributes for both button and anchor elements.
   * Centralizes attribute logic to ensure consistency across element types.
   * @returns Object containing data attributes, ARIA properties, and styling classes
   * @private
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
   * Renders an icon element with dependency validation.
   * Provides graceful degradation when the icon component is unavailable.
   * @param iconName - The name of the icon to render
   * @returns Lit template result or nothing if component unavailable
   * @private
   */
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

  /**
   * Handles click events with comprehensive state validation and event dispatching.
   * Manages ripple effects, link navigation, and custom event emission.
   * @param event - The mouse click event
   * @private
   */
  private handleClick(event: MouseEvent) {
    // Prevent interaction when disabled
    if (this.disabled) {
      event.preventDefault();
      return;
    }

    // Trigger ripple effect for visual feedback
    this.handleRippleClick(event);
    
    // Handle link-specific behavior
    if (this.isLinkType()) {
      this.dispatchCustomEvent('link-navigation', {
        href: this.href,
        target: this.target,
        timestamp: Date.now(),
        originalEvent: event
      });
    }
    
    // Emit button click event with component state
    this.dispatchEventWithMetadata('button-clicked', {
      type: this.type,
      disabled: this.disabled,
      loading: this.loading,
      href: this.href || null
    });
  }

  /**
   * Renders the button component as either a button or anchor element.
   * The element type is determined by the button type and href presence.
   * Implements semantic HTML with comprehensive accessibility support.
   * @returns Lit template result containing the rendered button
   */
  override render() {
    const elementTag = this.getElementTag();
    const commonAttributes = this.getCommonAttributes();
    const linkAttributes = this.getLinkAttributes();
    
    // Shared content template for both button and anchor elements
    const content = html`
      <span id="container" part="container">
        ${this.icon?.length ? this.renderIcon(this.icon[0]) : nothing}
        <slot id="slot"></slot>
        ${this.icon?.length === 2 ? this.renderIcon(this.icon[1]) : nothing}
      </span>
    `;
    
    // Render as anchor element for link-type buttons
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
    
    // Render as button element for standard buttons
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

  /**
   * Component styles imported from the style module.
   * Supports CSS custom properties for theme customization.
   */
  static override styles = styles;
}
