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
  RadioKeyboardMixin,
  RadioFocusMixin
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
  RadioFocusMixin(
    RadioDisplayMixin(
      RadioGroupMixin(
        NuralyUIBaseMixin(LitElement)
      )
    )
  )
) {
  static override styles = styles;

  override requiredComponents = ['hy-icon'];

  private boundKeyDownHandler = this.handleKeyDown.bind(this);
  private boundFocusInHandler = this.handleFocusIn.bind(this);
  private boundFocusOutHandler = this.handleFocusOut.bind(this);

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('keydown', this.boundKeyDownHandler);
    this.addEventListener('focusin', this.boundFocusInHandler);
    this.addEventListener('focusout', this.boundFocusOutHandler);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.boundKeyDownHandler);
    this.removeEventListener('focusin', this.boundFocusInHandler);
    this.removeEventListener('focusout', this.boundFocusOutHandler);
  }



  /**
   * Handle radio option change - override from RadioGroupMixin
   */
  override handleSelectionChange(option: RadioButtonOption): void {
    super.handleSelectionChange(option);
  }

  /**
   * Handle keyboard events - delegates to mixin and adds component-specific behavior
   */
  override handleKeyDown(event: KeyboardEvent): void {
    // Call the mixin implementation first
    super.handleKeyDown(event);
  }



  /**
   * Programmatically focus the radio group
   */
  override focus(): void {
    const selectedInput = this.shadowRoot?.querySelector('input[type="radio"]:checked') as HTMLInputElement;
    const firstInput = this.shadowRoot?.querySelector('input[type="radio"]') as HTMLInputElement;
    
    if (selectedInput) {
      selectedInput.focus();
    } else if (firstInput) {
      firstInput.focus();
    }
  }

  /**
   * Programmatically blur the radio group
   */
  override blur(): void {
    const focusedInput = this.shadowRoot?.querySelector('input[type="radio"]:focus') as HTMLInputElement;
    if (focusedInput) {
      focusedInput.blur();
    }
  }

  /**
   * Get the form data for this radio group
   */
  getFormData(): { [key: string]: string } {
    return this.name ? { [this.name]: this.value } : {};
  }

  /**
   * Validate the radio group (check if required value is selected)
   */
  validate(): boolean {
    if (this.required && !this.value) {
      return false;
    }
    return true;
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
    return html`
      <div 
        role="radiogroup" 
        aria-labelledby="radio-group-label"
        class="radio-group"
      >
        ${this.options.map(
          (option: RadioButtonOption, index: number) => html`
            <div
              class="${classMap({
                'radio-container': true,
                error: option.state === 'error',
                warning: option.state === 'warning',
                [option.className || '']: Boolean(option.className)
              })}"
              data-theme="${this.currentTheme}"
              style="${option.style || ''}"
              title="${option.title || ''}"
            >
              <label class="radio" id="${option.id || option.value}-label">
                <div class="input-container">
                  <input
                    class="radio-input"
                    type="radio"
                    role="radio"
                    name="radioGroup"
                    .value="${option.value}"
                    aria-labelledby="${option.value}-label"
                    aria-describedby="${option.state && option.message ? `${option.value}-message` : nothing}"
                    tabindex="${this.isOptionSelected(option) ? '0' : '-1'}"
                    @change="${(e: Event) => { this.addRippleEffect(e); this.handleSelectionChange(option); }}"
                    @focus="${() => this.setFocusedOption(index)}"
                    ?checked="${this.isOptionSelected(option)}"
                    ?disabled="${this.isOptionDisabled(option)}"
                  />
                </div>
                <span>${option.label}</span>
              </label>
              ${option.state && option.message
                ? html`<div class="message-container" id="${option.value}-message">
                    <hy-icon name="${option.state === 'error' ? 'exclamation-circle' : 'warning'}"></hy-icon>
                    <span>${option.message}</span>
                  </div>`
                : nothing}
            </div>
          `
        )}
      </div>
    `;
  }

  /**
   * Render button style radio group
   */
  private renderOptionsWithButtons() {
    return html`
      <div 
        class="type-button" 
        role="radiogroup" 
        aria-labelledby="radio-group-label"
        @keydown="${this.handleKeyDown}"
      >
        ${this.options.map(
          (option: RadioButtonOption, index: number) => html`
            <nr-button
              class="${this.isOptionSelected(option) ? 'selected' : ''}"
              type="${this.isOptionSelected(option) ? ButtonType.Primary : ButtonType.Default}"
              role="radio"
              aria-checked="${this.isOptionSelected(option)}"
              aria-describedby="${option.state && option.message ? `${option.value}-message` : nothing}"
              tabindex="${this.isOptionSelected(option) ? '0' : '-1'}"
              .icon="${option.icon ? [option.icon] : []}"
              .disabled="${this.isOptionDisabled(option)}"
              @click="${() => this.handleSelectionChange(option)}"
              @focus="${() => this.setFocusedOption(index)}"
            >
              ${option.label}
            </nr-button>
            ${option.state && option.message
              ? html`<div class="message-container" id="${option.value}-message">
                  <hy-icon name="${option.state === 'error' ? 'exclamation-circle' : 'warning'}"></hy-icon>
                  <span>${option.message}</span>
                </div>`
              : nothing}
          `
        )}
      </div>
    `;
  }

  /**
   * Render slot-based radio group (for custom HTML content)
   */
  private renderOptionsWithSlots() {
    return html`
      <div 
        role="radiogroup" 
        aria-labelledby="radio-group-label"
        class="radio-group slot-group"
      >
        ${this.options.map(
          (option: RadioButtonOption, index: number) => html`
            <div
              class="${classMap({
                'radio-container': true,
                'slot-container': true,
                error: option.state === 'error',
                warning: option.state === 'warning',
                selected: this.isOptionSelected(option),
                [option.className || '']: Boolean(option.className)
              })}"
              data-theme="${this.currentTheme}"
              style="${option.style || ''}"
              title="${option.title || ''}"
              @click="${() => this.handleSelectionChange(option)}"
            >
              <label class="radio slot-radio" id="${option.value}-label">
                <input
                  class="radio-input"
                  type="radio"
                  role="radio"
                  name="radioGroup"
                  .value="${option.value}"
                  aria-labelledby="${option.value}-label"
                  aria-describedby="${option.state && option.message ? `${option.value}-message` : nothing}"
                  tabindex="${this.isOptionSelected(option) ? '0' : '-1'}"
                  @change="${(e: Event) => { this.addRippleEffect(e); this.handleSelectionChange(option); }}"
                  @focus="${() => this.setFocusedOption(index)}"
                  ?checked="${this.isOptionSelected(option)}"
                  ?disabled="${this.isOptionDisabled(option)}"
                />
                <div class="slot-content">
                  <slot name="${option.value}"></slot>
                </div>
              </label>
              ${option.state && option.message
                ? html`<div class="message-container" id="${option.value}-message">
                    <hy-icon name="${option.state === 'error' ? 'exclamation-circle' : 'warning'}"></hy-icon>
                    <span>${option.message}</span>
                  </div>`
                : nothing}
            </div>
          `
        )}
      </div>
    `;
  }

  /**
   * Render button style with slots
   */
  private renderButtonsWithSlots() {
    return html`
      <div 
        class="type-button" 
        role="radiogroup" 
        aria-labelledby="radio-group-label"
        @keydown="${this.handleKeyDown}"
      >
        ${this.options.map(
          (option: RadioButtonOption, index: number) => html`
            <nr-button
              class="${this.isOptionSelected(option) ? 'selected' : ''}"
              type="${this.isOptionSelected(option) ? ButtonType.Primary : ButtonType.Default}"
              role="radio"
              aria-checked="${this.isOptionSelected(option)}"
              aria-describedby="${option.state && option.message ? `${option.value}-message` : nothing}"
              tabindex="${this.isOptionSelected(option) ? '0' : '-1'}"
              .disabled="${this.isOptionDisabled(option)}"
              @click="${() => this.handleSelectionChange(option)}"
              @focus="${() => this.setFocusedOption(index)}"
            >
              <slot name="${option.value}" slot="default"></slot>
            </nr-button>
            ${option.state && option.message
              ? html`<div class="message-container" id="${option.value}-message">
                  <hy-icon name="${option.state === 'error' ? 'exclamation-circle' : 'warning'}"></hy-icon>
                  <span>${option.message}</span>
                </div>`
              : nothing}
          `
        )}
      </div>
    `;
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
