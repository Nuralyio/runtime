/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { choose } from 'lit/directives/choose.js';
import { classMap } from 'lit/directives/class-map.js';

// Import dependencies
import '../icon/icon.component.js';
import '../button/button.component.js';

import { NuralyUIBaseMixin } from '../../shared/base-mixin.js';
import {
  RadioGroupMixin,
  RadioDisplayMixin,
  RadioKeyboardMixin
} from './mixins/index.js';
import { styles } from './radio.style.js';
import { RadioButtonType, RadioButtonOption } from './radio.type.js';
import { ButtonType } from '../button/button.types.js';

/**
 * A radio button group component that follows the NuralyUI architecture pattern.
 * 
 * Supports multiple display modes:
 * - Default: Traditional radio buttons with labels
 * - Button: Button-style radio group
 * 
 * Features:
 * - Theme-aware styling with light/dark mode support
 * - Keyboard navigation (arrow keys, space, enter)
 * - Accessibility compliance
 * - Standardized event handling
 * - Flexible positioning and layout options
 * 
 * @example
 * ```html
 * <nr-radio 
 *   .options='[
 *     { value: "option1", label: "Option 1" },
 *     { value: "option2", label: "Option 2" }
 *   ]'
 *   default-value="option1"
 *   direction="horizontal">
 * </nr-radio>
 * ```
 * 
 * @fires change - Dispatched when the selected option changes
 */
@customElement('nr-radio')
export class NrRadioElement extends RadioKeyboardMixin(
  RadioDisplayMixin(
    RadioGroupMixin(
      NuralyUIBaseMixin(LitElement)
    )
  )
) {
  static override styles = styles;

  override requiredComponents = ['hy-icon'];

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }



  /**
   * Handle radio option change - override from RadioGroupMixin
   */
  override handleSelectionChange(option: RadioButtonOption): void {
    super.handleSelectionChange(option);
  }

  /**
   * Add ripple effect on radio input click
   */
  private addRippleEffect(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target && target.type === 'radio') {
      // Remove any existing ripple animation
      target.style.animation = 'none';
      
      // Force reflow
      target.offsetHeight;
      
      // Add ripple animation
      target.style.animation = `radioRipple var(--hybrid-radio-ripple-duration, var(--hybrid-radio-local-ripple-duration)) ease-out`;
    }
  }

  /**
   * Render default radio button style
   */
  private renderOptionDefault() {
    return html`${this.options.map(
      (option: RadioButtonOption) => html`
        <div
          class="radio-container ${classMap({
            error: option.state === 'error',
            warning: option.state === 'warning',
          })}"
          data-theme="${this.currentTheme}"
        >
          <label class="radio">
            <div class="input-container">
              <input
                class="radio-input"
                type="radio"
                name="radioGroup"
                .value="${option.value}"
                @change="${(e: Event) => { this.addRippleEffect(e); this.handleSelectionChange(option); }}"
                ?checked="${this.isOptionSelected(option)}"
                ?disabled="${this.isOptionDisabled(option)}"
              />
            </div>
            <span>${option.label}</span>
          </label>
          ${option.state && option.message
            ? html`<div class="message-container">
                <hy-icon name="${option.state === 'error' ? 'exclamation-circle' : 'warning'}"></hy-icon>
                <span>${option.message}</span>
              </div>`
            : nothing}
        </div>
      `
    )}`;
  }

  /**
   * Render button style radio group
   */
  private renderOptionsWithButtons() {
    return html`<div class="type-button">
      ${this.options.map(
        (option: RadioButtonOption) => html`
          <nr-button
            class="${this.isOptionSelected(option) ? 'selected' : ''}"
            type="${this.isOptionSelected(option) ? ButtonType.Primary : ButtonType.Default}"
            .icon="${option.icon ? [option.icon] : []}"
            .disabled="${this.isOptionDisabled(option)}"
            @click="${() => this.handleSelectionChange(option)}"
          >
            ${option.label}
          </nr-button>
        `
      )}
    </div>`;
  }

  /**
   * Render slot-based radio group (for custom HTML content)
   */
  private renderOptionsWithSlots() {
    return html`${this.options.map(
      (option: RadioButtonOption) => html`
        <div
          class="radio-container slot-container ${classMap({
            error: option.state === 'error',
            warning: option.state === 'warning',
            selected: this.isOptionSelected(option)
          })}"
          data-theme="${this.currentTheme}"
          @click="${() => this.handleSelectionChange(option)}"
        >
          <label class="radio slot-radio">
            <input
              class="radio-input"
              type="radio"
              name="radioGroup"
              .value="${option.value}"
              @change="${(e: Event) => { this.addRippleEffect(e); this.handleSelectionChange(option); }}"
              ?checked="${this.isOptionSelected(option)}"
              ?disabled="${this.isOptionDisabled(option)}"
            />
            <div class="slot-content">
              <slot name="${option.value}"></slot>
            </div>
          </label>
          ${option.state && option.message
            ? html`<div class="message-container">
                <hy-icon name="${option.state === 'error' ? 'exclamation-circle' : 'warning'}"></hy-icon>
                <span>${option.message}</span>
              </div>`
            : nothing}
        </div>
      `
    )}`;
  }

  /**
   * Render button style with slots
   */
  private renderButtonsWithSlots() {
    return html`<div class="type-button">
      ${this.options.map(
        (option: RadioButtonOption) => html`
          <nr-button
            class="${this.isOptionSelected(option) ? 'selected' : ''}"
            type="${this.isOptionSelected(option) ? ButtonType.Primary : ButtonType.Default}"
            .disabled="${this.isOptionDisabled(option)}"
            @click="${() => this.handleSelectionChange(option)}"
          >
            <slot name="${option.value}" slot="default"></slot>
          </nr-button>
        `
      )}
    </div>`;
  }

  protected override render() {
    return html`${choose(this.type, [
      [RadioButtonType.Default, () => this.renderOptionDefault()],
      [RadioButtonType.Button, () => this.renderOptionsWithButtons()],
      [RadioButtonType.Slot, () => this.renderOptionsWithSlots()],
      ['button-slot', () => this.renderButtonsWithSlots()], // Special case for button with slots
    ])} `;
  }
}
