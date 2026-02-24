/**
 * Shared inline name editing for standalone page headers.
 * Reuses the same contenteditable + nr-icon pattern as the dashboard detail pages.
 */
import { html, css, type TemplateResult } from 'lit';
import {
  focusAndSelectAll,
  handlePlainTextPaste,
  getInputText,
  handleNameFieldBlur,
  handleNameFieldKeydown,
} from '../features/dashboard/utils/inline-edit.utils';

export interface NameEditableHost {
  isEditingName: boolean;
  editedName: string;
  readonly workflow: { name?: string } | null;
  readonly shadowRoot: ShadowRoot | null;
  readonly updateComplete: Promise<boolean>;
  saveNameToServer(name: string): Promise<void>;
}

function startEditing(host: NameEditableHost): void {
  host.editedName = host.workflow?.name || '';
  host.isEditingName = true;
  host.updateComplete.then(() => {
    const el = host.shadowRoot?.querySelector('.header-name.editing') as HTMLElement;
    if (el) focusAndSelectAll(el, host.editedName);
  });
}

function cancelEditing(host: NameEditableHost): void {
  host.isEditingName = false;
  host.editedName = '';
}

async function saveEditing(host: NameEditableHost): Promise<void> {
  const trimmed = host.editedName.trim();
  if (!trimmed || trimmed === host.workflow?.name) {
    cancelEditing(host);
    return;
  }
  host.isEditingName = false;
  host.editedName = '';
  await host.saveNameToServer(trimmed);
}

export function renderEditableName(
  host: NameEditableHost,
  fallback: string,
): TemplateResult {
  if (host.isEditingName) {
    return html`
      <div class="header-name-container">
        <span
          class="header-name editing"
          contenteditable="true"
          @blur=${(e: FocusEvent) => handleNameFieldBlur(e, host.isEditingName, () => saveEditing(host))}
          @keydown=${(e: KeyboardEvent) => handleNameFieldKeydown(e, host.isEditingName, () => saveEditing(host), () => cancelEditing(host))}
          @input=${(e: Event) => { host.editedName = getInputText(e); }}
          @paste=${handlePlainTextPaste}
        ></span>
        <nr-icon name="check" class="action-icon save" title="Save" @click=${() => saveEditing(host)}></nr-icon>
        <nr-icon name="x" class="action-icon cancel" title="Cancel" @click=${() => cancelEditing(host)}></nr-icon>
      </div>
    `;
  }
  return html`
    <div class="header-name-container">
      <h1 class="header-name" @click=${() => startEditing(host)}>${host.workflow?.name || fallback}</h1>
      <nr-icon name="pencil" class="edit-icon" title="Edit name" @click=${() => startEditing(host)}></nr-icon>
    </div>
  `;
}

export const editableNameStyles = css`
  .header-name-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--nuraly-color-text, #0f0f3c);
    margin: 0;
    outline: none;
    border-radius: 4px;
    padding: 2px 6px;
    margin: -2px -6px;
    transition: background 150ms ease;
    min-width: 50px;
    display: inline-block;
  }

  .header-name.editing {
    background: var(--nuraly-color-background-hover, #f1f5f9);
    box-shadow: 0 0 0 2px var(--nuraly-color-primary, #14144b);
  }

  h1.header-name:hover {
    background: var(--nuraly-color-background-hover, #f1f5f9);
    cursor: text;
  }

  .header-name-container:hover .edit-icon {
    opacity: 1;
  }

  .edit-icon {
    opacity: 0;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 150ms ease;
    --nuraly-icon-size: 14px;
    --nuraly-icon-color: var(--nuraly-color-text-tertiary, #8c8ca8);
  }

  .edit-icon:hover {
    background: var(--nuraly-color-background-hover, #f1f5f9);
    --nuraly-icon-color: var(--nuraly-color-text, #0f0f3c);
  }

  .action-icon {
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 150ms ease;
    --nuraly-icon-size: 16px;
  }

  .action-icon.save {
    --nuraly-icon-color: var(--nuraly-color-success, #22c55e);
  }

  .action-icon.save:hover {
    background: var(--nuraly-color-success-light, #dcfce7);
  }

  .action-icon.cancel {
    --nuraly-icon-color: var(--nuraly-color-text-tertiary, #8c8ca8);
  }

  .action-icon.cancel:hover {
    background: var(--nuraly-color-background-hover, #f1f5f9);
    --nuraly-icon-color: var(--nuraly-color-text, #0f0f3c);
  }
`;
