/**
 * Shared utility functions for inline name editing in dashboard views.
 * Used by DashboardWorkflowView and DashboardWhiteboardView.
 */

/**
 * Sets text content, focuses the element, and selects all text.
 */
export function focusAndSelectAll(element: HTMLElement, text: string): void {
  element.textContent = text;
  element.focus();
  const range = document.createRange();
  range.selectNodeContents(element);
  const selection = globalThis.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

/**
 * Handles paste events in contenteditable elements, inserting plain text only.
 * Replaces deprecated document.execCommand with Selection/Range API.
 */
export function handlePlainTextPaste(e: ClipboardEvent): void {
  e.preventDefault();
  const text = e.clipboardData?.getData('text/plain') || '';
  const selection = globalThis.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    range.collapse(false);
  }
}

/**
 * Extracts trimmed text content from an input event target.
 */
export function getInputText(e: Event): string {
  const element = e.target as HTMLElement;
  return element.textContent?.trim() || '';
}

/**
 * Handles blur on an inline-editable name field.
 * Saves unless the user clicked a save/cancel action button.
 */
export function handleNameFieldBlur(e: FocusEvent, isEditing: boolean, saveFn: () => void): void {
  const relatedTarget = e.relatedTarget as HTMLElement;
  if (relatedTarget?.closest('.action-icon')) {
    return;
  }
  if (isEditing) {
    saveFn();
  }
}

/**
 * Handles keydown on an inline-editable name field.
 * Enter saves, Escape cancels.
 */
export function handleNameFieldKeydown(
  e: KeyboardEvent,
  isEditing: boolean,
  saveFn: () => void,
  cancelFn: () => void,
): void {
  if (!isEditing) return;

  if (e.key === 'Enter') {
    e.preventDefault();
    saveFn();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    cancelFn();
  }
}
