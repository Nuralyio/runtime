/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing, TemplateResult } from 'lit';
import { INPUT_TYPE, INPUT_STATE } from '../input.types.js';

/**
 * Rendering utilities for input component icons and elements
 */
export class InputRenderUtils {

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
    
    return html`<hy-icon
      name="copy"
      type="regular"
      id="copy-icon"
      role="button"
      aria-label="Copy input value"
      tabindex="0"
      @click=${!disabled && !readonly ? onCopy : nothing}
      @keydown=${onKeydown}
    ></hy-icon>`;
  }

  /**
   * Renders state-based icons (warning, error)
   */
  static renderStateIcon(state: string): TemplateResult | typeof nothing {
    switch (state) {
      case INPUT_STATE.Warning:
        return html`<hy-icon name="warning" id="warning-icon"></hy-icon>`;
      case INPUT_STATE.Error:
        return html`<hy-icon name="exclamation-circle" id="error-icon"></hy-icon>`;
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
    
    return html`<hy-icon name="calendar" type="regular" id="calendar-icon"></hy-icon>`;
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
      return html`<hy-icon
        name="eye-slash"
        type="regular"
        id="password-icon"
        role="button"
        aria-label="Hide password"
        tabindex="0"
        @click=${!disabled && !readonly ? onToggle : nothing}
        @keydown=${onKeydown}
      ></hy-icon>`;
    } else {
      return html`<hy-icon
        name="eye"
        type="regular"
        id="password-icon"
        role="button"
        aria-label="Show password"
        tabindex="0"
        @click=${!disabled && !readonly ? onToggle : nothing}
        @keydown=${onKeydown}
      ></hy-icon>`;
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
        <hy-icon 
          name="minus" 
          aria-label="Decrease value"
          role="button"
          tabindex="0"
          @click=${!disabled && !readonly ? onDecrement : nothing}
          @keydown=${onKeydown}
        ></hy-icon>
        <span id="icons-separator">|</span>
        <hy-icon 
          name="plus" 
          aria-label="Increase value"
          role="button"
          tabindex="0"
          @click=${!disabled && !readonly ? onIncrement : nothing}
          @keydown=${onKeydown}
        ></hy-icon>
      </div>
    `;
  }
}
