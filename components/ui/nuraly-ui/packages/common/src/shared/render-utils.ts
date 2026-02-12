/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult, nothing } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

/**
 * Options for rendering a clear button
 */
export interface ClearButtonOptions {
  /** Whether clear is allowed on this component */
  allowClear: boolean;
  /** Current value (empty value means no clear button shown) */
  value: any;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Whether the component is readonly */
  readonly?: boolean;
  /** Click handler for the clear action */
  onClear: (e: Event) => void;
  /** ARIA label for accessibility */
  ariaLabel?: string;
  /** Icon name to use (defaults to 'x') */
  iconName?: string;
  /** Icon size (defaults to 'small') */
  iconSize?: string;
  /** CSS class for the button */
  cssClass?: string;
}

/**
 * Options for rendering a label
 */
export interface LabelOptions {
  /** CSS class for the label element */
  cssClass?: string;
  /** Part attribute for shadow DOM styling */
  part?: string;
  /** Associated input element ID */
  forId?: string;
  /** CSS class for the required indicator */
  requiredClass?: string;
}

/**
 * Options for rendering a validation message
 */
export interface ValidationMessageOptions {
  /** CSS class for the message container */
  cssClass?: string;
  /** The current validation/status state */
  statusClass?: string;
  /** Element ID for aria-describedby */
  id?: string;
}

/**
 * Renders a clear button for form components.
 * Used by input, textarea, and select components.
 *
 * @param options - Configuration for the clear button
 * @returns TemplateResult or nothing if not applicable
 */
export function renderClearButton(options: ClearButtonOptions): TemplateResult | typeof nothing {
  const {
    allowClear,
    value,
    disabled = false,
    readonly: isReadonly = false,
    onClear,
    ariaLabel = 'Clear value',
    iconName = 'x',
    iconSize = 'small',
    cssClass = 'clear-button',
  } = options;

  if (!allowClear || !value || disabled || isReadonly) return nothing;

  return html`
    <button
      class="${cssClass}"
      type="button"
      @click=${onClear}
      aria-label="${ariaLabel}"
    >
      <nr-icon name="${iconName}" size="${iconSize}"></nr-icon>
    </button>
  `;
}

/**
 * Renders a label element for form components.
 * Used by textarea, colorpicker, and timepicker components.
 *
 * @param label - The label text (returns nothing if falsy)
 * @param required - Whether to show a required indicator
 * @param options - Additional rendering options
 * @returns TemplateResult or nothing if no label
 */
export function renderLabel(
  label: string | undefined,
  required?: boolean,
  options?: LabelOptions
): TemplateResult | typeof nothing {
  if (!label) return nothing;

  const cssClass = options?.cssClass || 'label';
  const part = options?.part || 'label';
  const requiredClass = options?.requiredClass || 'required-indicator';

  return html`
    <label
      class="${cssClass}"
      part="${part}"
      for="${ifDefined(options?.forId)}"
    >
      ${label}
      ${required ? html`<span class="${requiredClass}">*</span>` : nothing}
    </label>
  `;
}

/**
 * Renders a validation message for form components.
 * Used by input, textarea, and select components.
 *
 * @param message - The validation message (returns nothing if falsy)
 * @param options - Additional rendering options
 * @returns TemplateResult or nothing if no message
 */
export function renderValidationMessage(
  message: string | undefined,
  options?: ValidationMessageOptions
): TemplateResult | typeof nothing {
  if (!message) return nothing;

  const cssClass = options?.cssClass || 'validation-message';
  const statusClass = options?.statusClass || '';
  const id = options?.id || 'validation-message';

  return html`
    <div class="${cssClass} ${statusClass}" id="${id}" role="alert" aria-live="polite">
      ${message}
    </div>
  `;
}

/**
 * Renders a validation icon based on the validation state.
 * Used by input and textarea components.
 *
 * @param state - The validation state ('error', 'warning', 'success', etc.)
 * @param hasFeedback - Whether to show feedback (returns nothing if false)
 * @returns TemplateResult or nothing if no feedback
 */
export function renderValidationIcon(
  state: string | undefined,
  hasFeedback?: boolean,
): TemplateResult | typeof nothing {
  if (!hasFeedback || !state) return nothing;

  let iconName = '';
  let iconClass = '';

  switch (state) {
    case 'error':
      iconName = 'error';
      iconClass = 'validation-error';
      break;
    case 'warning':
      iconName = 'warning';
      iconClass = 'validation-warning';
      break;
    case 'success':
      iconName = 'check-circle';
      iconClass = 'validation-success';
      break;
    default:
      return nothing;
  }

  return html`
    <nr-icon
      class="validation-icon ${iconClass}"
      name="${iconName}"
      size="small"
    ></nr-icon>
  `;
}

/**
 * Renders helper text or validation messages.
 * Used by colorpicker and timepicker components.
 *
 * @param text - Helper text or validation message
 * @param options - Additional options
 * @returns TemplateResult or nothing if no text
 */
export function renderHelperText(
  text: string | undefined,
  options?: { cssClass?: string; isError?: boolean; part?: string }
): TemplateResult | typeof nothing {
  if (!text) return nothing;

  const cssClass = options?.cssClass || 'helper-text';
  const errorClass = options?.isError ? `${cssClass}--error` : '';

  return html`
    <div class="${cssClass} ${errorClass}" part="${ifDefined(options?.part)}">
      ${text}
    </div>
  `;
}
