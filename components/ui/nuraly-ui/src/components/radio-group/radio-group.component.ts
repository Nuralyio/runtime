/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { choose } from 'lit/directives/choose.js';
import { classMap } from 'lit/directives/class-map.js';

// Import dependencies
import '../icon/icon.component.js';
import '../button/button.component.js';
import '../radio/radio.component.js';

import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import {
  RadioGroupController,
  RadioKeyboardController,
  RadioFocusController,
  RadioValidationController,
  RadioRippleController
} from './controllers/index.js';
import { styles } from './radio-group.style.js';
import { RadioButtonType, RadioButtonOption } from './radio-group.types.js';
import { ButtonType } from '../button/button.types.js';

/**
 * A radio button group component using Reactive Controllers architecture.
 * 
 * Supports multiple display modes:
 * - Default: Traditional radio buttons with labels
 * - Button: Button-style radio group
 * - Slot: Custom HTML content with radio selection
 * 
 * Features:
 * - Theme-aware styling with light/dark mode support
 * - Keyboard navigation (arrow keys, space, enter)
 * - Accessibility compliance
 * - Form validation and integration
 * - Ripple effects on interaction
 * - Modular controller-based architecture
 * 
 * @example
 * ```html
 * <nr-radio-group
 *   .options='[
 *     { value: "option1", label: "Option 1" },
 *     { value: "option2", label: "Option 2" }
 *   ]'
 *   default-value="option1"
 *   direction="horizontal">
 * </nr-radio-group>
 * ```
 * 
 * @fires nr-change - Dispatched when the selected option changes
 */
@customElement('nr-radio-group')
export class NrRadioGroupElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = styles;

  override requiredComponents = ['nr-icon', 'nr-radio'];

  // Properties
  @property({ type: Array }) options: RadioButtonOption[] = [];
  @property({ type: String, attribute: 'default-value' }) defaultValue: string = '';
  @property({ type: String }) value: string = '';
  @property({ type: String }) name: string = 'radioGroup';
  @property({ type: String }) direction: 'horizontal' | 'vertical' = 'vertical';
  @property({ type: String }) type: RadioButtonType = RadioButtonType.Default;
  @property({ type: Boolean }) required: boolean = false;
  @property({ type: Boolean }) disabled: boolean = false;
  @property({ type: String }) size: 'small' | 'medium' | 'large' = 'medium';
  @property({ type: String }) position: 'left' | 'right' = 'left';

  // Reactive Controllers - PROPERLY implemented now
  private groupController = new RadioGroupController(this);
  // @ts-ignore - Controller handles events through listeners, doesn't need direct reference
  private keyboardController = new RadioKeyboardController(this, this.groupController);
  // Additional controllers for full functionality
  private focusController = new RadioFocusController(this);
  private validationController = new RadioValidationController(this);
  private rippleController = new RadioRippleController(this);

  /**
   * Get the currently selected option - DELEGATES to controller
   */
  get selectedOption(): RadioButtonOption | undefined {
    return this.groupController.getSelectedOption();
  }

  /**
   * Check if an option is selected - DELEGATES to controller
   */
  isOptionSelected(option: RadioButtonOption): boolean {
    return this.groupController.isOptionSelected(option);
  }

  /**
   * Check if an option is disabled - DELEGATES to controller
   */
  isOptionDisabled(option: RadioButtonOption): boolean {
    return this.groupController.isOptionDisabled(option);
  }

  /**
   * Handle option selection change - DELEGATES to controller
   */
  handleSelectionChange(option: RadioButtonOption): void {
    this.groupController.selectOption(option);
  }

  /**
   * Set focused option by index - DELEGATES to controller
   */
  setFocusedOption(index: number): void {
    this.focusController.setFocusedOption(index);
  }

  /**
   * Handle keyboard events - DELEGATES to controller
   */
  handleKeyDown(_event: KeyboardEvent): void {
    // Controller handles keyboard navigation automatically via event listeners
    // This method exists for template compatibility but delegates to controller
  }

  /**
   * Add ripple effect on radio input click - DELEGATES to controller
   */
  addRippleEffect(event: Event): void {
    this.rippleController.addRippleEffect(event);
  }

  /**
   * Validate the radio group - DELEGATES to controller
   */
  validate(): boolean {
    return this.validationController.validate();
  }

  /**
   * Get validation message - DELEGATES to controller
   */
  get validationMessage(): string {
    return this.validationController.validationMessage;
  }

  /**
   * Check if the radio group is valid - DELEGATES to controller
   */
  get isValid(): boolean {
    return this.validationController.isValid;
  }

  /**
   * Get form data for form submission - DELEGATES to controller
   */
  getFormData(): { [key: string]: string } {
    return this.validationController.getFormData();
  }

  /**
   * Reset the radio group - DELEGATES to controller
   */
  reset(): void {
    this.validationController.reset();
  }

  /**
   * FormData integration for native form submission - DELEGATES to controller
   */
  get formData(): FormData | null {
    return this.validationController.getFormDataObject();
  }

  /**
   * Check form validity (required for HTML5 form validation)
   */
  checkValidity(): boolean {
    return this.validate();
  }

  /**
   * Report form validity (required for HTML5 form validation) - DELEGATES to controller
   */
  reportValidity(): boolean {
    return this.validationController.reportValidity();
  }

  /**
   * Programmatically focus the radio group - DELEGATES to controller
   */
  override focus(): void {
    this.focusController.focus();
  }

  /**
   * Programmatically blur the radio group - DELEGATES to controller
   */
  override blur(): void {
    this.focusController.blur();
  }

  /**
   * Render default radio button style using nr-radio component
   */
  private renderOptionDefault() {
    return html`
      <div 
        role="radiogroup" 
        aria-labelledby="radio-group-label"
        class="radio-group ${this.direction}"
      >
        ${this.options.map(
          (option: RadioButtonOption, index: number) => html`
            <div
              class="${classMap({
                'radio-wrapper': true,
                error: option.state === 'error',
                warning: option.state === 'warning',
                [option.className || '']: Boolean(option.className)
              })}"
              data-theme="${this.currentTheme}"
              style="${option.style || ''}"
              title="${option.title || ''}"
            >
              <nr-radio
                id="${option.id || option.value}"
                name="${this.name}"
                value="${option.value}"
                size="${this.size}"
                ?checked="${this.isOptionSelected(option)}"
                ?disabled="${this.isOptionDisabled(option) || this.disabled}"
                ?required="${this.required}"
                tabindex="${this.isOptionSelected(option) ? '0' : '-1'}"
                @change="${(e: Event) => { 
                  this.addRippleEffect(e); 
                  this.handleSelectionChange(option); 
                }}"
                @focus="${() => this.setFocusedOption(index)}"
              >
                ${option.label}
              </nr-radio>
              ${option.state && option.message
                ? html`<div class="message-container" id="${option.value}-message">
                    <nr-icon name="${option.state === 'error' ? 'exclamation-circle' : 'warning'}"></nr-icon>
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
                  <nr-icon name="${option.state === 'error' ? 'exclamation-circle' : 'warning'}"></nr-icon>
                  <span>${option.message}</span>
                </div>`
              : nothing}
          `
        )}
      </div>
    `;
  }

  /**
   * Render slot-based radio group (for custom HTML content) using nr-radio
   */
  private renderOptionsWithSlots() {
    return html`
      <div 
        role="radiogroup" 
        aria-labelledby="radio-group-label"
        class="radio-group slot-group ${this.direction}"
      >
        ${this.options.map(
          (option: RadioButtonOption, index: number) => html`
            <div
              class="${classMap({
                'radio-wrapper': true,
                'slot-container': true,
                error: option.state === 'error',
                warning: option.state === 'warning',
                selected: this.isOptionSelected(option),
                [option.className || '']: Boolean(option.className)
              })}"
              data-theme="${this.currentTheme}"
              style="${option.style || ''}"
              title="${option.title || ''}"
            >
              <div class="slot-wrapper" @click="${() => this.handleSelectionChange(option)}">
                <nr-radio
                  id="${option.id || option.value}"
                  name="${this.name}"
                  value="${option.value}"
                  size="${this.size}"
                  ?checked="${this.isOptionSelected(option)}"
                  ?disabled="${this.isOptionDisabled(option) || this.disabled}"
                  ?required="${this.required}"
                  tabindex="${this.isOptionSelected(option) ? '0' : '-1'}"
                  @change="${(e: Event) => { 
                    this.addRippleEffect(e); 
                    this.handleSelectionChange(option); 
                  }}"
                  @focus="${() => this.setFocusedOption(index)}"
                >
                </nr-radio>
                <div class="slot-content">
                  <slot name="${option.value}"></slot>
                </div>
              </div>
              ${option.state && option.message
                ? html`<div class="message-container" id="${option.value}-message">
                    <nr-icon name="${option.state === 'error' ? 'exclamation-circle' : 'warning'}"></nr-icon>
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
                  <nr-icon name="${option.state === 'error' ? 'exclamation-circle' : 'warning'}"></nr-icon>
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
