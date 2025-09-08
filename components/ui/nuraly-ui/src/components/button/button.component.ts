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

@customElement('nr-button')
export class NrButtonElement extends NuralyUIBaseMixin(LitElement) {
  @property({type: Boolean})
  disabled = false;

  @property({type: Boolean})
  loading = false;

  @property({type: String})
  size = EMPTY_STRING;

  @property({type: String})
  type: ButtonType = ButtonType.Default;

  @property({type: String})
  shape: ButtonShape = ButtonShape.Default;

  @property({type: Boolean})
  block = false;

  @property({type: Boolean})
  dashed = false;

  @property({type: Array})
  icon: string[] = [];

  @property({reflect: true})
  iconPosition = IconPosition.Left;

  @property({type: String})
  href = EMPTY_STRING;

  @property({type: String})
  target = EMPTY_STRING;

  /**
   * Required components that must be registered for this component to work properly
   * Can be overridden by parent implementations
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
   * Get the appropriate element tag based on button type
   */
  private getElementTag() {
    return this.type === ButtonType.Link && this.href ? 'a' : 'button';
  }

  /**
   * Get attributes for accessibility and functionality
   */
  private getElementAttributes() {
    const attributes: any = {
      '?disabled': this.disabled && this.type !== ButtonType.Link,
      'data-type': this.type,
      'data-shape': this.shape,
      'data-size': this.size ? this.size : nothing,
      'data-state': this.loading ? 'loading' : nothing,
      'data-theme': this.currentTheme,
      'data-block': this.block ? 'true' : nothing,
      'class': this.dashed ? 'button-dashed' : '',
      'role': this.type === ButtonType.Link ? 'link' : 'button',
      'aria-disabled': this.disabled ? 'true' : 'false',
      'aria-label': this.buttonAriaLabel || nothing,
      'aria-describedby': this.ariaDescribedBy || nothing,
    };

    // Add link-specific attributes
    if (this.type === ButtonType.Link && this.href) {
      attributes.href = this.href;
      if (this.target) {
        attributes.target = this.target;
      }
      if (this.target === '_blank') {
        attributes.rel = 'noopener noreferrer';
      }
    }

    // Add button-specific attributes
    if (this.type !== ButtonType.Link) {
      attributes.type = this.htmlType || 'button';
    }

    return attributes;
  }

  @property({type: String})
  buttonAriaLabel = EMPTY_STRING;

  @property({type: String})
  ariaDescribedBy = EMPTY_STRING;

  @property({type: String})
  htmlType = EMPTY_STRING;

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

  override render() {
    const elementTag = this.getElementTag();
    const attributes = this.getElementAttributes();
    
    if (elementTag === 'a') {
      return html`
        <a
          href="${attributes.href}"
          target="${attributes.target || nothing}"
          rel="${attributes.rel || nothing}"
          data-type="${attributes['data-type']}"
          data-shape="${attributes['data-shape']}"
          data-size="${attributes['data-size']}"
          data-state="${attributes['data-state']}"
          data-theme="${attributes['data-theme']}"
          data-block="${attributes['data-block']}"
          class="${attributes.class}"
          role="${attributes.role}"
          aria-disabled="${attributes['aria-disabled']}"
          aria-label="${attributes['aria-label']}"
          aria-describedby="${attributes['aria-describedby']}"
        >
          <span id="container">
            ${this.icon?.length ? this.renderIcon(this.icon[0]) : nothing}
            <slot id="slot"></slot>
            ${this.icon?.length == 2 ? this.renderIcon(this.icon[1]) : nothing}
          </span>
        </a>
      `;
    }
    
    return html`
      <button
        ?disabled="${attributes['?disabled']}"
        type="${attributes.type || nothing}"
        data-type="${attributes['data-type']}"
        data-shape="${attributes['data-shape']}"
        data-size="${attributes['data-size']}"
        data-state="${attributes['data-state']}"
        data-theme="${attributes['data-theme']}"
        data-block="${attributes['data-block']}"
        class="${attributes.class}"
        role="${attributes.role}"
        aria-disabled="${attributes['aria-disabled']}"
        aria-label="${attributes['aria-label']}"
        aria-describedby="${attributes['aria-describedby']}"
      >
        <span id="container">
          ${this.icon?.length ? this.renderIcon(this.icon[0]) : nothing}
          <slot id="slot"></slot>
          ${this.icon?.length == 2 ? this.renderIcon(this.icon[1]) : nothing}
        </span>
      </button>
    `;
  }
  static override styles = styles;
}
