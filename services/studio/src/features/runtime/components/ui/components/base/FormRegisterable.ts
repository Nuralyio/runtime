/**
 * @file FormRegisterable.ts
 * @description Mixin for input blocks that need to register with parent forms.
 * This enables form field discovery across Shadow DOM boundaries.
 */

import { LitElement } from "lit";

export interface FormRegisterableElement extends LitElement {
  inputHandlersValue?: any;
  inputRef?: { value: HTMLElement | null };
}

/**
 * Dispatches a field registration event to the parent form-block.
 * Uses composed: true to cross Shadow DOM boundaries.
 */
export function registerWithParentForm(
  element: FormRegisterableElement,
  nrElement: HTMLElement | null
): void {
  const name = element.inputHandlersValue?.name;

  if (!name || !nrElement) {
    return;
  }

  element.dispatchEvent(new CustomEvent('nr-field-register', {
    bubbles: true,
    composed: true,
    detail: {
      element: nrElement,
      name: name,
      blockElement: element
    }
  }));
}

/**
 * Dispatches a field unregistration event to the parent form-block.
 */
export function unregisterFromParentForm(
  element: FormRegisterableElement
): void {
  const name = element.inputHandlersValue?.name;

  if (!name) {
    return;
  }

  element.dispatchEvent(new CustomEvent('nr-field-unregister', {
    bubbles: true,
    composed: true,
    detail: {
      name: name,
      blockElement: element
    }
  }));
}

/**
 * Dispatches a field value change event to the parent form-block.
 */
export function notifyFieldValueChange(
  element: FormRegisterableElement,
  value: any
): void {
  const name = element.inputHandlersValue?.name;

  if (!name) {
    return;
  }

  element.dispatchEvent(new CustomEvent('nr-field-value-change', {
    bubbles: true,
    composed: true,
    detail: {
      name: name,
      value: value,
      blockElement: element
    }
  }));
}
