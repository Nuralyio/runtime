/**
 * @fileoverview Reusable Custom Handlers for Component Properties
 * @module Studio/Core/Handlers/CustomHandlers
 *
 * @description
 * Custom handler implementations for common complex patterns found across
 * multiple component configurations. These handlers replace inline JavaScript
 * strings with typed, reusable classes.
 */

import { ComputedValueHandler } from './value-handlers';
import type { HandlerContext, RadioOption } from './types';

/**
 * Creates a radio value handler that respects handler-disabled state.
 *
 * @description
 * Many radio properties need to show options as disabled when the property
 * has a handler (code icon) active. This factory creates handlers for this
 * common pattern.
 *
 * @example
 * ```typescript
 * const sizeHandler = createDisabledAwareRadioHandler('size', [
 *   { value: 'small', label: 'Small' },
 *   { value: 'medium', label: 'Medium' },
 *   { value: 'large', label: 'Large' },
 * ], 'medium', 'default');
 * ```
 */
export function createDisabledAwareRadioHandler(
  propertyName: string,
  options: Array<{ value: string; label?: string; icon?: string }>,
  defaultValue: string,
  radioType: 'button' | 'default' = 'default'
): ComputedValueHandler<[RadioOption[], string, string]> {
  return new ComputedValueHandler((ctx: HandlerContext) => {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    let currentValue = defaultValue;
    let isDisabled = false;

    const inputValue = selectedComponent?.input?.[propertyName] as { type?: string; value?: string } | undefined;
    if (inputValue?.type === 'handler' && inputValue?.value) {
      isDisabled = true;
    } else {
      currentValue = inputValue?.value || defaultValue;
    }

    const disabledOptions: RadioOption[] = options.map(opt => ({
      ...opt,
      disabled: isDisabled,
    }));

    return [disabledOptions, currentValue, radioType];
  });
}

/**
 * Creates a radio value handler for icon-based options.
 *
 * @description
 * Similar to createDisabledAwareRadioHandler but specifically for
 * options that use icons instead of labels.
 */
export function createIconRadioHandler(
  propertyName: string,
  options: Array<{ value: string; icon: string }>,
  defaultValue: string
): ComputedValueHandler<[RadioOption[], string, string]> {
  return createDisabledAwareRadioHandler(propertyName, options, defaultValue, 'button');
}

/**
 * Type radio handler - text/password/email/number with icons.
 */
export const typeRadioOptions = [
  { value: 'text', icon: 'font' },
  { value: 'password', icon: 'lock' },
  { value: 'email', icon: 'envelope' },
  { value: 'number', icon: 'hashtag' },
];

/**
 * Size radio options - small/medium/large.
 */
export const sizeRadioOptions = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

/**
 * Status/State radio options with icons.
 */
export const statusRadioOptions = [
  { value: 'default', icon: 'font-awesome' },
  { value: 'warning', icon: 'triangle-exclamation' },
  { value: 'error', icon: 'circle-exclamation' },
];

/**
 * State radio options with success.
 */
export const stateRadioOptions = [
  { value: 'default', icon: 'font-awesome' },
  { value: 'warning', icon: 'triangle-exclamation' },
  { value: 'error', icon: 'circle-exclamation' },
  { value: 'success', icon: 'circle-check' },
];

/**
 * Variant radio options for inputs.
 */
export const inputVariantOptions = [
  { value: 'outlined', label: 'Outlined' },
  { value: 'filled', label: 'Filled' },
  { value: 'underlined', label: 'Underlined' },
  { value: 'borderless', label: 'Borderless' },
];

/**
 * Textarea variant options.
 */
export const textareaVariantOptions = [
  { value: 'outlined', label: 'Outlined' },
  { value: 'filled', label: 'Filled' },
  { value: 'underlined', label: 'Underlined' },
];

/**
 * Resize radio options for textarea.
 */
export const resizeRadioOptions = [
  { value: 'none', label: 'None' },
  { value: 'vertical', label: 'Vertical' },
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'both', label: 'Both' },
];

/**
 * Button type options.
 */
export const buttonTypeOptions = [
  { value: 'primary', label: 'Primary' },
  { value: 'default', label: 'Default' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'text', label: 'Text' },
  { value: 'link', label: 'Link' },
];

/**
 * Button shape options.
 */
export const buttonShapeOptions = [
  { value: 'default', label: 'Default' },
  { value: 'round', label: 'Round' },
  { value: 'circle', label: 'Circle' },
];
