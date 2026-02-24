/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult, nothing } from 'lit';
import { INPUT_TYPE, INPUT_STATE } from '../input.types.js';

/**
 * Rendering utilities for input component icons and elements
 */
export class InputRenderUtils {

  /**
   * Renders prefix slot content
   */
  static renderPrefix(): TemplateResult {
    return html`
      <div class="input-prefix">
        <slot name="prefix"></slot>
      </div>
    `;
  }

  /**
   * Renders suffix slot content  
   */
  static renderSuffix(): TemplateResult {
    return html`
      <div class="input-suffix">
        <slot name="suffix"></slot>
      </div>
    `;
  }

  /**
   * Renders addon before slot content (outside input borders)
   * Only renders if hasAddonBefore is true
   */
  static renderAddonBefore(hasAddonBefore: boolean, onSlotChange: (e: Event) => void): TemplateResult | typeof nothing {
    if (!hasAddonBefore) return nothing;
    
    return html`
      <div class="input-addon-before">
        <slot name="addon-before" @slotchange=${onSlotChange}></slot>
      </div>
    `;
  }

  /**
   * Renders addon after slot content (outside input borders)  
   * Only renders if hasAddonAfter is true
   */
  static renderAddonAfter(hasAddonAfter: boolean, onSlotChange: (e: Event) => void): TemplateResult | typeof nothing {
    if (!hasAddonAfter) return nothing;
    
    return html`
      <div class="input-addon-after">
        <slot name="addon-after" @slotchange=${onSlotChange}></slot>
      </div>
    `;
  }

  /**
   * Renders the copy icon when withCopy is enabled
   */
  static renderCopyIcon(
    withCopy: boolean,
    disabled: boolean,
    readonly: boolean,
    onCopy: () => void,
    onKeydown: (e: KeyboardEvent) => void
  ): TemplateResult | typeof nothing {
    if (!withCopy) return nothing;
    
    return html`<nr-icon
      name="copy"
      type="regular"
      id="copy-icon"
      role="button"
      aria-label="Copy input value"
      tabindex="0"
      @click=${!disabled && !readonly ? onCopy : nothing}
      @keydown=${onKeydown}
    ></nr-icon>`;
  }

  /**
   * Renders the clear icon when allowClear is enabled and there's content
   */
  static renderClearIcon(
    allowClear: boolean,
    value: string,
    disabled: boolean,
    readonly: boolean,
    onClear: () => void,
    onKeydown: (e: KeyboardEvent) => void
  ): TemplateResult | typeof nothing {
    if (!allowClear || !value || disabled || readonly) return nothing;
    
    return html`<nr-icon
      name="times-circle"
      type="regular"
      id="clear-icon"
      role="button"
      aria-label="Clear input value"
      tabindex="0"
      @click=${onClear}
      @keydown=${onKeydown}
    ></nr-icon>`;
  }

  /**
   * Renders state-based icons (warning, error)
   */
  static renderStateIcon(state: string): TemplateResult | typeof nothing {
    switch (state) {
      case INPUT_STATE.Warning:
        return html`<nr-icon name="warning" id="warning-icon"></nr-icon>`;
      case INPUT_STATE.Error:
        return html`<nr-icon name="exclamation-circle" id="error-icon"></nr-icon>`;
      default:
        return nothing;
    }
  }

  /**
   * Renders the calendar icon for calendar input type
   */
  static renderCalendarIcon(
    state: string,
    type: string
  ): TemplateResult | typeof nothing {
    if (state !== INPUT_STATE.Default || type !== INPUT_TYPE.CALENDAR) {
      return nothing;
    }
    
    return html`<nr-icon name="calendar" type="regular" id="calendar-icon"></nr-icon>`;
  }

  /**
   * Renders password toggle icon
   */
  static renderPasswordIcon(
    type: string,
    inputType: string,
    disabled: boolean,
    readonly: boolean,
    onToggle: () => void,
    onKeydown: (e: KeyboardEvent) => void
  ): TemplateResult | typeof nothing {
    if (type !== INPUT_TYPE.PASSWORD) return nothing;
    
    if (inputType === INPUT_TYPE.TEXT) {
      return html`<nr-icon
        name="eye-slash"
        type="regular"
        id="password-icon"
        role="button"
        aria-label="Hide password"
        tabindex="0"
        @click=${!disabled && !readonly ? onToggle : nothing}
        @keydown=${onKeydown}
      ></nr-icon>`;
    } else {
      return html`<nr-icon
        name="eye"
        type="regular"
        id="password-icon"
        role="button"
        aria-label="Show password"
        tabindex="0"
        @click=${!disabled && !readonly ? onToggle : nothing}
        @keydown=${onKeydown}
      ></nr-icon>`;
    }
  }

  /**
   * Renders number input increment/decrement icons
   */
  static renderNumberIcons(
    type: string,
    state: string,
    disabled: boolean,
    readonly: boolean,
    onIncrement: () => void,
    onDecrement: () => void,
    onKeydown: (e: KeyboardEvent) => void
  ): TemplateResult | typeof nothing {
    if (type !== INPUT_TYPE.NUMBER) return nothing;
    
    return html`
      <div id="number-icons">
        ${state !== INPUT_STATE.Default ? html`<span id="icons-separator">|</span>` : nothing}
        <nr-icon 
          name="minus" 
          aria-label="Decrease value"
          role="button"
          tabindex="0"
          @click=${!disabled && !readonly ? onDecrement : nothing}
          @keydown=${onKeydown}
        ></nr-icon>
        <span id="icons-separator">|</span>
        <nr-icon 
          name="plus" 
          aria-label="Increase value"
          role="button"
          tabindex="0"
          @click=${!disabled && !readonly ? onIncrement : nothing}
          @keydown=${onKeydown}
        ></nr-icon>
      </div>
    `;
  }
}
