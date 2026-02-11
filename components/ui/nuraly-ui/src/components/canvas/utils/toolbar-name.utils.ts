/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Shared toolbar name editing utilities.
 * Used by both workflow-canvas and whiteboard-canvas to avoid code duplication.
 */

import type { Workflow } from '../workflow-canvas.types.js';

/**
 * Canvas component interface for toolbar name editing.
 * Both workflow-canvas and whiteboard-canvas satisfy this interface.
 */
export interface CanvasNameEditable {
  readonly: boolean;
  isEditingName: boolean;
  editedName: string;
  workflow: Workflow;
  shadowRoot: ShadowRoot | null;
  updateComplete: Promise<boolean>;
  dispatchEvent(event: Event): boolean;
}

/**
 * Toolbar name callback set for spreading into ToolbarTemplateData.
 */
export interface ToolbarNameCallbacks {
  onStartEditName: () => void;
  onNameInput: (e: Event) => void;
  onNameBlur: (e: FocusEvent) => void;
  onNameKeydown: (e: KeyboardEvent) => void;
  onNamePaste: (e: ClipboardEvent) => void;
  onSaveName: () => void;
  onCancelEditName: () => void;
}

/**
 * Creates toolbar name editing callbacks bound to a canvas component.
 * Usage: `const nameCallbacks = createToolbarNameCallbacks(this);`
 */
export function createToolbarNameCallbacks(canvas: CanvasNameEditable): ToolbarNameCallbacks {
  function cancel() {
    canvas.isEditingName = false;
    canvas.editedName = '';
  }

  function save() {
    const trimmed = canvas.editedName.trim();
    if (!trimmed || trimmed === canvas.workflow.name) {
      cancel();
      return;
    }
    canvas.workflow = { ...canvas.workflow, name: trimmed };
    canvas.isEditingName = false;
    canvas.editedName = '';
    canvas.dispatchEvent(new CustomEvent('name-changed', {
      detail: { name: trimmed },
      bubbles: true,
      composed: true,
    }));
  }

  return {
    onStartEditName() {
      if (canvas.readonly) return;
      canvas.editedName = canvas.workflow.name || '';
      canvas.isEditingName = true;
      canvas.updateComplete.then(() => {
        const el = canvas.shadowRoot?.querySelector('.toolbar-name.editing') as HTMLElement;
        if (el) {
          el.textContent = canvas.editedName;
          el.focus();
          const range = document.createRange();
          range.selectNodeContents(el);
          const sel = globalThis.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      });
    },

    onNameInput(e: Event) {
      canvas.editedName = (e.target as HTMLElement).textContent?.trim() || '';
    },

    onNameBlur(e: FocusEvent) {
      const related = e.relatedTarget as HTMLElement;
      if (related?.closest('.toolbar-name-action')) return;
      if (canvas.isEditingName) save();
    },

    onNameKeydown(e: KeyboardEvent) {
      if (!canvas.isEditingName) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        save();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancel();
      }
    },

    onNamePaste(e: ClipboardEvent) {
      e.preventDefault();
      const text = e.clipboardData?.getData('text/plain') || '';
      const sel = globalThis.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        range.collapse(false);
      }
    },

    onSaveName: save,
    onCancelEditName: cancel,
  };
}
