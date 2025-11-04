/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { styles } from './radio.style.js';
import { RadioSize } from './radio.types.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';

/**
 * A simple radio button component that can be used standalone or within a form.
 * For grouped radio buttons with more features, use nr-radio-group instead.
 * 
 * @example
 * ```html
 * <nr-radio name="option" value="1">Option 1</nr-radio>
 * <nr-radio name="option" value="2" checked>Option 2</nr-radio>
 * <nr-radio name="option" value="3" disabled>Option 3</nr-radio>
 * ```
 * 
 * @fires nr-change - Dispatched when the radio button is selected
 * @fires nr-focus - Dispatched when the radio button receives focus
 * @fires nr-blur - Dispatched when the radio button loses focus
 * 
 * @slot default - Radio button label content
 */

@customElement('nr-radio')
export class NrRadioElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = styles;

  override requiredComponents = ['nr-label'];
  
  /** Whether the radio button is checked */
  @property({ type: Boolean, reflect: true })
  checked = false;

  /** Whether the radio button is disabled */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Radio button size (small, medium, large) */
  @property({ reflect: true })
  size: RadioSize = RadioSize.Medium;

  /** Form field name - used to group radio buttons */
  @property({ type: String })
  name = '';

  /** Form field value */
  @property({ type: String })
  value = '';

  /** Radio button ID */
  @property({ type: String })
  override id = '';

  /** Tab index */
  @property({ type: Number })
  override tabIndex = 0;

  /** Whether the radio button is required */
  @property({ type: Boolean })
  required = false;

  @query('input')
  private inputElement!: HTMLInputElement;

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this._handleClick);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this._handleClick);
  }

  private _handleClick = (e: Event) => {
    if (this.disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (!this.checked) {
      this.checked = true;
      this._uncheckSiblings();
      this._dispatchChangeEvent();
    }
  };

  private _handleInputChange = (e: Event) => {
    e.stopPropagation();
    if (this.disabled) return;
    
    this.checked = this.inputElement.checked;
    if (this.checked) {
      this._uncheckSiblings();
      this._dispatchChangeEvent();
    }
  };

  private _handleFocus = () => {
    if (this.disabled) return;
    this.dispatchEvent(new CustomEvent('nr-focus', { bubbles: true, composed: true }));
  };

  private _handleBlur = () => {
    if (this.disabled) return;
    this.dispatchEvent(new CustomEvent('nr-blur', { bubbles: true, composed: true }));
  };

  private _uncheckSiblings() {
    if (!this.name) return;

    // Find all radio buttons with the same name in the same root
    const root = this.getRootNode() as Document | ShadowRoot;
    const radios = root.querySelectorAll(`nr-radio[name="${this.name}"]`);
    
    radios.forEach((radio) => {
      if (radio !== this && radio instanceof NrRadioElement) {
        radio.checked = false;
      }
    });
  }

  private _dispatchChangeEvent() {
    this.dispatchEvent(
      new CustomEvent('nr-change', {
        detail: { value: this.value, checked: this.checked },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Sets focus on the radio button
   */
  override focus() {
    this.inputElement?.focus();
  }

  /**
   * Removes focus from the radio button
   */
  override blur() {
    this.inputElement?.blur();
  }

  override render() {
    return html`
      <div class="radio-wrapper" data-theme="${this.currentTheme}" data-size="${this.size}">
        <input
          type="radio"
          class="radio-input"
          .checked=${this.checked}
          .disabled=${this.disabled}
          .name=${this.name}
          .value=${this.value}
          .required=${this.required}
          tabindex=${this.tabIndex}
          @change=${this._handleInputChange}
          @focus=${this._handleFocus}
          @blur=${this._handleBlur}
          aria-checked=${this.checked}
          aria-disabled=${this.disabled}
        />
        <span class="radio-circle"></span>
        <nr-label class="radio-label" data-theme="${this.currentTheme}">
          <slot></slot>
        </nr-label>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-radio': NrRadioElement;
  }
}
