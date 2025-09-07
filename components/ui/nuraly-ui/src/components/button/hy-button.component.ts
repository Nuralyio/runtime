/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ButtonType, EMPTY_STRING, IconPosition } from './hy-button.types.js';
import { styles } from './hy-button.style.js';
import { ThemeAwareMixin } from '../../shared/theme-mixin.js';
import { DependencyValidationMixin } from '../../shared/dependency-mixin.js';

@customElement('hy-button')
export class HyButtonElement extends DependencyValidationMixin(ThemeAwareMixin(LitElement)) {
  @property({type: Boolean})
  disabled = false;

  @property({type: Boolean})
  loading = false;

  @property({type: String})
  size = EMPTY_STRING;

  @property({type: String})
  type: ButtonType = ButtonType.Default;

  @property({type: Boolean})
  dashed = false;

  @property({type: Array})
  icon: string[] = [];

  @property({reflect: true})
  iconPosition = IconPosition.Left;

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
    return html`
      <button
        ?disabled="${this.disabled}"
        data-type="${this.type}"
        data-size=${this.size ? this.size : nothing}
        data-state="${this.loading ? 'loading' : nothing}"
        data-theme="${this.currentTheme}"
        class="${this.dashed ? 'button-dashed' : ''}"
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
