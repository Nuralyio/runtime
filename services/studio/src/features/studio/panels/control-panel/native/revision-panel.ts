/**
 * Native Revision Panel
 *
 * Displays version history for the current application with options to:
 * - Save new versions
 * - Preview any version
 * - Publish any version
 * - Restore to any version
 */

import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { $currentApplication } from "@nuraly/runtime/redux/store";

interface Revision {
  revision: number;
  description?: string;
  createdAt: string;
  isPublished?: boolean;
  createdBy?: string;
}

@customElement("native-revision-panel")
export class NativeRevisionPanel extends LitElement {
  static override styles = css`
    :host {
      display: block;
      padding: 12px;
      height: 100%;
      overflow-y: auto;
    }

    .header {
      margin-bottom: 16px;
    }

    .revision-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .revision-item {
      padding: 12px;
      border-radius: 8px;
      background: var(--nuraly-color-surface-secondary, #f5f5f5);
      border: 1px solid var(--nuraly-color-border, #e0e0e0);
    }

    .revision-item.published {
      border-color: var(--nuraly-color-success, #22c55e);
      background: var(--nuraly-color-success-light, #f0fdf4);
    }

    .revision-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .revision-version {
      font-weight: 600;
      font-size: 14px;
    }

    .revision-date {
      font-size: 12px;
      color: var(--nuraly-color-text-secondary, #666);
    }

    .revision-description {
      font-size: 12px;
      color: var(--nuraly-color-text-secondary, #666);
      margin-bottom: 8px;
    }

    .revision-actions {
      display: flex;
      gap: 8px;
    }

    .empty-state {
      text-align: center;
      padding: 32px 16px;
      color: var(--nuraly-color-text-secondary, #666);
    }

    .loading {
      text-align: center;
      padding: 32px 16px;
    }

    .save-section {
      margin-bottom: 16px;
    }

    nr-button {
      --nuraly-button-min-width: auto;
    }
  `;

  @state()
  private revisions: Revision[] = [];

  @state()
  private isLoading = true;

  @state()
  private isSaving = false;

  override connectedCallback() {
    super.connectedCallback();
    this.fetchRevisions();
  }

  private async fetchRevisions() {
    const app = $currentApplication.get();
    if (!app?.uuid) {
      this.isLoading = false;
      return;
    }

    try {
      const response = await fetch(`/api/applications/${app.uuid}/revisions`, {
        headers: (window as any).__AUTH_HEADERS__ || {}
      });

      if (!response.ok) throw new Error("Failed to fetch revisions");

      const data = await response.json();
      this.revisions = data.revisions || [];
    } catch (error) {
      console.error("Failed to fetch revisions:", error);
      this.revisions = [];
    } finally {
      this.isLoading = false;
    }
  }

  private async saveVersion() {
    const app = $currentApplication.get();
    if (!app?.uuid) return;

    const description = prompt("Enter a description for this version (optional):");
    if (description === null) return; // User cancelled

    this.isSaving = true;

    try {
      const response = await fetch(`/api/applications/${app.uuid}/revisions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...((window as any).__AUTH_HEADERS__ || {})
        },
        body: JSON.stringify({ description })
      });

      if (!response.ok) throw new Error("Failed to create revision");

      await this.fetchRevisions();
    } catch (error) {
      console.error("Failed to save version:", error);
      alert("Failed to save version");
    } finally {
      this.isSaving = false;
    }
  }

  private previewRevision(revision: number) {
    const app = $currentApplication.get();
    if (!app?.uuid) return;

    window.open(`/app/view/${app.uuid}?revision=${revision}`, "_blank");
  }

  private async publishRevision(revision: number) {
    const app = $currentApplication.get();
    if (!app?.uuid) return;

    if (!confirm(`Are you sure you want to publish version ${revision}?`)) return;

    try {
      const response = await fetch(
        `/api/applications/${app.uuid}/revisions/${revision}/publish`,
        {
          method: "POST",
          headers: (window as any).__AUTH_HEADERS__ || {}
        }
      );

      if (!response.ok) throw new Error("Failed to publish");

      await this.fetchRevisions();
    } catch (error) {
      console.error("Failed to publish:", error);
      alert("Failed to publish version");
    }
  }

  private async restoreRevision(revision: number) {
    const app = $currentApplication.get();
    if (!app?.uuid) return;

    if (!confirm(`Are you sure you want to restore to version ${revision}? This will create a new version.`)) return;

    try {
      const response = await fetch(
        `/api/applications/${app.uuid}/revisions/${revision}/restore`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...((window as any).__AUTH_HEADERS__ || {})
          },
          body: JSON.stringify({})
        }
      );

      if (!response.ok) throw new Error("Failed to restore");

      alert("Restored successfully! Page will reload.");
      window.location.reload();
    } catch (error) {
      console.error("Failed to restore:", error);
      alert("Failed to restore version");
    }
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  private renderRevisionItem(revision: Revision) {
    return html`
      <div class="revision-item ${revision.isPublished ? 'published' : ''}">
        <div class="revision-header">
          <span class="revision-version">
            v${revision.revision}
            ${revision.isPublished ? html`<nr-tag size="small" variant="success">Published</nr-tag>` : ""}
          </span>
          <span class="revision-date">${this.formatDate(revision.createdAt)}</span>
        </div>
        <div class="revision-description">
          ${revision.description || "No description"}
        </div>
        <div class="revision-actions">
          <nr-button
            size="small"
            variant="secondary"
            @click=${() => this.previewRevision(revision.revision)}
          >
            <nr-icon name="eye" size="14"></nr-icon>
            Preview
          </nr-button>
          <nr-button
            size="small"
            variant=${revision.isPublished ? "secondary" : "primary"}
            ?disabled=${revision.isPublished}
            @click=${() => this.publishRevision(revision.revision)}
          >
            <nr-icon name="upload" size="14"></nr-icon>
            Publish
          </nr-button>
          <nr-button
            size="small"
            variant="secondary"
            @click=${() => this.restoreRevision(revision.revision)}
          >
            <nr-icon name="rotate-ccw" size="14"></nr-icon>
            Restore
          </nr-button>
        </div>
      </div>
    `;
  }

  override render() {
    return html`
      <div class="header">
        <nr-row align="middle" justify="space-between">
          <nr-col>
            <nr-label size="medium" weight="semibold">Version History</nr-label>
          </nr-col>
          <nr-col>
            <nr-button
              size="small"
              variant="primary"
              ?loading=${this.isSaving}
              @click=${this.saveVersion}
            >
              <nr-icon name="save" size="14"></nr-icon>
              Save Version
            </nr-button>
          </nr-col>
        </nr-row>
      </div>

      ${this.isLoading
        ? html`
            <div class="loading">
              <nr-spinner size="small"></nr-spinner>
              <nr-label size="small" variant="secondary">Loading versions...</nr-label>
            </div>
          `
        : this.revisions.length === 0
        ? html`
            <div class="empty-state">
              <nr-icon name="history" size="32" style="opacity: 0.5; margin-bottom: 8px;"></nr-icon>
              <nr-label size="small" variant="secondary">No versions saved yet</nr-label>
              <nr-label size="small" variant="secondary">Click "Save Version" to create your first snapshot</nr-label>
            </div>
          `
        : html`
            <div class="revision-list">
              ${this.revisions.map(revision => this.renderRevisionItem(revision))}
            </div>
          `}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "native-revision-panel": NativeRevisionPanel;
  }
}
