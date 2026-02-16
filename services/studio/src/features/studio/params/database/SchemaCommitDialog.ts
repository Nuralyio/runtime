import { html, LitElement, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { SchemaChange } from './schema-diff';
import '../../../runtime/components/ui/nuraly-ui/src/components/modal/modal.component';

@customElement('schema-commit-dialog')
export class SchemaCommitDialog extends LitElement {
  static override styles = css`
    :host {
      display: contents;
    }

    .commit-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
      min-width: 500px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--n-color-text, #111827);
      margin-bottom: 4px;
    }

    .changes-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 8px;
      background: var(--n-color-surface-secondary, #f9fafb);
      border-radius: 6px;
      border: 1px solid var(--n-color-border, #e5e7eb);
      max-height: 180px;
      overflow-y: auto;
    }

    .change-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-family: monospace;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .change-item.create, .change-item.add {
      color: #16a34a;
      background: #f0fdf4;
    }

    .change-item.drop {
      color: #dc2626;
      background: #fef2f2;
    }

    .change-item.alter {
      color: #d97706;
      background: #fffbeb;
    }

    .change-prefix {
      font-weight: 700;
      min-width: 16px;
    }

    .ddl-block {
      background: #1e1e2e;
      color: #cdd6f4;
      font-family: 'Fira Code', 'Cascadia Code', monospace;
      font-size: 12px;
      line-height: 1.6;
      padding: 12px 16px;
      border-radius: 6px;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 250px;
      overflow-y: auto;
    }

    .footer-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding-top: 8px;
      border-top: 1px solid var(--n-color-border, #e5e7eb);
    }

    .btn {
      padding: 8px 20px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }

    .btn-cancel {
      background: var(--n-color-surface, #fff);
      color: var(--n-color-text, #111827);
      border: 1px solid var(--n-color-border, #e5e7eb);
    }

    .btn-cancel:hover {
      background: var(--n-color-surface-hover, #f9fafb);
    }

    .btn-apply {
      background: var(--n-color-primary, #3b82f6);
      color: white;
    }

    .btn-apply:hover {
      background: var(--n-color-primary-dark, #2563eb);
    }

    .btn-apply:disabled {
      background: var(--n-color-disabled, #9ca3af);
      cursor: not-allowed;
    }

    .result-success {
      padding: 10px 12px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 6px;
      color: #16a34a;
      font-size: 13px;
    }

    .result-error {
      padding: 10px 12px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 6px;
      color: #dc2626;
      font-size: 13px;
      word-break: break-word;
    }
  `;

  @property({ type: Boolean }) open = false;
  @property({ type: Array }) changes: SchemaChange[] = [];
  @property({ type: String }) ddlScript = '';

  @state() private applying = false;
  @state() private result: { success: boolean; error?: string; statementsExecuted?: number; executionTimeMs?: number } | null = null;

  private getChangeClass(type: string): string {
    if (type.startsWith('CREATE') || type.startsWith('ADD')) return 'add';
    if (type.startsWith('DROP')) return 'drop';
    return 'alter';
  }

  private getChangePrefix(type: string): string {
    if (type.startsWith('CREATE') || type.startsWith('ADD')) return '+';
    if (type.startsWith('DROP')) return '-';
    return '~';
  }

  private getChangeLabel(change: SchemaChange): string {
    switch (change.type) {
      case 'CREATE_TABLE':
        return `CREATE TABLE ${change.table}`;
      case 'DROP_TABLE':
        return `DROP TABLE ${change.table}`;
      case 'ADD_COLUMN':
        return `ADD COLUMN ${change.table}.${change.column} (${change.details?.type || 'text'})`;
      case 'DROP_COLUMN':
        return `DROP COLUMN ${change.table}.${change.column}`;
      case 'ALTER_COLUMN':
        return `ALTER COLUMN ${change.table}.${change.column}`;
      case 'ADD_PRIMARY_KEY':
        return `ADD PRIMARY KEY ${change.table} (${change.details?.column})`;
      case 'DROP_PRIMARY_KEY':
        return `DROP PRIMARY KEY ${change.table}`;
      case 'ADD_FOREIGN_KEY':
        return `ADD FOREIGN KEY ${change.table}.${change.details?.sourceColumn} -> ${change.details?.targetTable}.${change.details?.targetColumn}`;
      case 'DROP_FOREIGN_KEY':
        return `DROP FOREIGN KEY ${change.table}.${change.details?.sourceColumn} -> ${change.details?.targetTable}.${change.details?.targetColumn}`;
      default:
        return change.type;
    }
  }

  private handleApply() {
    this.applying = true;
    this.result = null;
    this.dispatchEvent(new CustomEvent('apply-ddl', { bubbles: true, composed: true }));
  }

  private handleCancel() {
    this.result = null;
    this.dispatchEvent(new CustomEvent('cancel-ddl', { bubbles: true, composed: true }));
  }

  public setResult(result: { success: boolean; error?: string; statementsExecuted?: number; executionTimeMs?: number }) {
    this.applying = false;
    this.result = result;
  }

  public resetState() {
    this.applying = false;
    this.result = null;
  }

  override render() {
    if (!this.open) return nothing;

    return html`
      <nr-modal
        ?open=${this.open}
        .modalTitle=${'Commit Schema Changes'}
        .size=${'large'}
        ?closable=${!this.applying}
        ?showCloseButton=${!this.applying}
        @modal-close=${this.handleCancel}
      >
        <div class="commit-content">
          <div>
            <div class="section-title">Changes (${this.changes.length} operations)</div>
            <div class="changes-list">
              ${this.changes.map(change => html`
                <div class="change-item ${this.getChangeClass(change.type)}">
                  <span class="change-prefix">${this.getChangePrefix(change.type)}</span>
                  <span>${this.getChangeLabel(change)}</span>
                </div>
              `)}
            </div>
          </div>

          <div>
            <div class="section-title">Generated DDL</div>
            <div class="ddl-block">${this.ddlScript}</div>
          </div>

          ${this.result ? html`
            ${this.result.success ? html`
              <div class="result-success">
                Successfully executed ${this.result.statementsExecuted} statement(s)
                ${this.result.executionTimeMs ? ` in ${this.result.executionTimeMs}ms` : ''}
              </div>
            ` : html`
              <div class="result-error">${this.result.error || 'DDL execution failed'}</div>
            `}
          ` : nothing}

          <div class="footer-actions">
            <button class="btn btn-cancel" @click=${this.handleCancel} ?disabled=${this.applying}>
              ${this.result?.success ? 'Close' : 'Cancel'}
            </button>
            ${!this.result?.success ? html`
              <button class="btn btn-apply" @click=${this.handleApply} ?disabled=${this.applying}>
                ${this.applying ? 'Applying...' : 'Apply Changes'}
              </button>
            ` : nothing}
          </div>
        </div>
      </nr-modal>
    `;
  }
}
