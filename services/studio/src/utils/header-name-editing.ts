/**
 * Shared inline name editing for standalone page headers.
 * Used by StandaloneWorkflowPage and StandaloneWhiteboardPage.
 */
import { html, css, nothing, type TemplateResult } from 'lit';

/**
 * Host interface that standalone pages must satisfy.
 */
export interface NameEditableHost {
  isEditingName: boolean;
  editedName: string;
  readonly workflow: { name?: string } | null;
  readonly shadowRoot: ShadowRoot | null;
  readonly updateComplete: Promise<boolean>;
  saveNameToServer(name: string): Promise<void>;
}

/**
 * Starts inline editing of the header name.
 */
export function startEditingName(host: NameEditableHost): void {
  host.editedName = host.workflow?.name || '';
  host.isEditingName = true;
  host.updateComplete.then(() => {
    const input = host.shadowRoot?.querySelector('.name-input') as HTMLInputElement;
    if (input) {
      input.focus();
      input.select();
    }
  });
}

/**
 * Saves the edited name if changed, then resets editing state.
 */
export async function saveEditedName(host: NameEditableHost): Promise<void> {
  const trimmed = host.editedName.trim();
  host.isEditingName = false;
  if (!trimmed || trimmed === host.workflow?.name) return;
  await host.saveNameToServer(trimmed);
}

/**
 * Keydown handler: Enter saves, Escape cancels.
 */
export function handleNameKeydown(host: NameEditableHost, e: KeyboardEvent): void {
  if (e.key === 'Enter') {
    e.preventDefault();
    saveEditedName(host);
  } else if (e.key === 'Escape') {
    host.isEditingName = false;
  }
}

/**
 * Renders the editable name in the page header.
 */
export function renderEditableName(
  host: NameEditableHost,
  fallback: string,
): TemplateResult {
  if (host.isEditingName) {
    return html`<input
      class="name-input"
      .value=${host.editedName}
      @input=${(e: Event) => { host.editedName = (e.target as HTMLInputElement).value; }}
      @blur=${() => saveEditedName(host)}
      @keydown=${(e: KeyboardEvent) => handleNameKeydown(host, e)}
    />`;
  }
  return html`<h1 class="editable-name" @click=${() => startEditingName(host)}>${host.workflow?.name || fallback}</h1>`;
}

/**
 * Shared styles for the editable header name.
 */
export const editableNameStyles = css`
  .editable-name {
    font-weight: 600;
    font-size: 16px;
    color: var(--n-color-text, #111827);
    margin: 0;
    cursor: pointer;
    border-radius: 4px;
    padding: 2px 6px;
    margin: -2px -6px;
  }

  .editable-name:hover {
    background: var(--n-color-surface-hover, #f3f4f6);
  }

  .name-input {
    font-weight: 600;
    font-size: 16px;
    color: var(--n-color-text, #111827);
    border: 1px solid var(--n-color-primary, #3b82f6);
    border-radius: 4px;
    padding: 2px 6px;
    margin: -2px -6px;
    outline: none;
    background: var(--n-color-surface, #fff);
    font-family: inherit;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
`;
