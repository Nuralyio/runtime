import { LitElement, html, nothing, TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { revisionPanelStyles } from './RevisionPanel.style';
import { getVarValue } from '../../../../../redux/store/context';

// Import nuraly-ui components
import '../../../nuraly-ui/src/components/button/button.component';
import '../../../nuraly-ui/src/components/icon/icon.component';
import '../../../nuraly-ui/src/components/badge/badge.component';
import '../../../nuraly-ui/src/components/skeleton/skeleton.component';
import '../../../nuraly-ui/src/components/alert/alert.component';
import '../../../nuraly-ui/src/components/tabs/tabs.component';
import '../../../nuraly-ui/src/components/card/card.component';
import '../../../nuraly-ui/src/components/tag/tag.component';
import '../../../nuraly-ui/src/components/divider/divider.component';
import '../../../nuraly-ui/src/components/timeline/timeline.component';
import '../../../nuraly-ui/src/components/label/label.component';

export interface Revision {
  id: string;
  applicationId: string;
  revision: number;
  versionLabel?: string;
  description?: string;
  appVersion: number;
  createdBy: string;
  createdAt: string;
  isPublished?: boolean;
}

export interface ComponentVersion {
  id: string;
  componentId: string;
  applicationId: string;
  version: number;
  createdBy: string;
  createdAt: string;
  componentData?: any;
}

export interface PageVersion {
  id: string;
  pageId: string;
  applicationId: string;
  version: number;
  name: string;
  url: string;
  createdBy: string;
  createdAt: string;
}

export interface AppVersion {
  id: string;
  applicationId: string;
  version: number;
  name: string;
  createdBy: string;
  createdAt: string;
}

export interface PublishedVersion {
  id: string;
  applicationId: string;
  revision: number;
  publishedBy: string;
  publishedAt: string;
}

type ChangeItem = {
  type: 'component' | 'page' | 'app';
  id: string;
  entityId: string;
  version: number;
  name?: string;
  createdAt: string;
  createdBy: string;
};

/**
 * RevisionPanel Component
 *
 * A panel for managing application versions/revisions:
 * - View change history (components, pages, app changes)
 * - One-click publish current state
 * - View published version status
 */
@customElement('revision-panel')
export class RevisionPanel extends LitElement {
  static override styles = [revisionPanelStyles];

  @state() private loading = false;
  @state() private publishing = false;
  @state() private changes: ChangeItem[] = [];
  @state() private publishedVersion: PublishedVersion | null = null;
  @state() private activeTab = 0;
  @state() private message: { type: 'success' | 'error'; text: string } | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this.loadData();
  }

  private getAppId(): string | null {
    const app = getVarValue('global', 'currentEditingApplication') as any;
    return app?.uuid || null;
  }

  private getAppSubdomain(): string | null {
    const app = getVarValue('global', 'currentEditingApplication') as any;
    return app?.subdomain || null;
  }

  private async loadData(): Promise<void> {
    this.loading = true;
    try {
      // Load published version first, then changes (so we can filter by publish date)
      await this.loadPublishedVersion();
      await this.loadChanges();
    } finally {
      this.loading = false;
    }
  }

  private async loadChanges(): Promise<void> {
    const appId = this.getAppId();
    if (!appId) return;

    try {
      const response = await fetch(`/api/applications/${appId}/revisions/changes`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch changes');
      }

      const data = await response.json();

      // Get the publish timestamp to filter unpublished changes
      const publishedAt = this.publishedVersion?.publishedAt
        ? new Date(this.publishedVersion.publishedAt).getTime()
        : 0;

      // Combine all changes into a single sorted list
      const allChanges: ChangeItem[] = [];

      // Add component versions (only those after last publish)
      (data.componentVersions || []).forEach((cv: ComponentVersion) => {
        const createdTime = new Date(cv.createdAt).getTime();
        if (createdTime > publishedAt) {
          allChanges.push({
            type: 'component',
            id: cv.id,
            entityId: cv.componentId,
            version: cv.version,
            name: cv.componentData?.name || cv.componentData?.type || 'Component',
            createdAt: cv.createdAt,
            createdBy: cv.createdBy,
          });
        }
      });

      // Add page versions (only those after last publish)
      (data.pageVersions || []).forEach((pv: PageVersion) => {
        const createdTime = new Date(pv.createdAt).getTime();
        if (createdTime > publishedAt) {
          allChanges.push({
            type: 'page',
            id: pv.id,
            entityId: pv.pageId,
            version: pv.version,
            name: pv.name,
            createdAt: pv.createdAt,
            createdBy: pv.createdBy,
          });
        }
      });

      // Add app versions (only those after last publish)
      (data.appVersions || []).forEach((av: AppVersion) => {
        const createdTime = new Date(av.createdAt).getTime();
        if (createdTime > publishedAt) {
          allChanges.push({
            type: 'app',
            id: av.id,
            entityId: av.applicationId,
            version: av.version,
            name: av.name,
            createdAt: av.createdAt,
            createdBy: av.createdBy,
          });
        }
      });

      // Sort by createdAt descending
      allChanges.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      this.changes = allChanges;
    } catch (error) {
      console.error('Failed to fetch changes:', error);
      this.changes = [];
    }
  }

  private async loadPublishedVersion(): Promise<void> {
    const appId = this.getAppId();
    if (!appId) return;

    try {
      const response = await fetch(`/api/applications/${appId}/revisions/published`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch published version');
      }

      const data = await response.json();
      this.publishedVersion = data;
    } catch (error) {
      console.error('Failed to fetch published version:', error);
      this.publishedVersion = null;
    }
  }

  private async handlePublishNow(): Promise<void> {
    const appId = this.getAppId();
    if (!appId) return;

    this.publishing = true;
    this.message = null;

    try {
      const response = await fetch(`/api/applications/${appId}/revisions/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ description: 'Published from editor' }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to publish');
      }

      const data = await response.json();
      this.publishedVersion = data.published;
      this.message = { type: 'success', text: 'Published successfully!' };

      // Reload changes to update the unpublished count (should be 0 now)
      await this.loadChanges();

      // Clear message after 3 seconds
      setTimeout(() => (this.message = null), 3000);
    } catch (error: any) {
      this.message = { type: 'error', text: error.message || 'Failed to publish' };
    } finally {
      this.publishing = false;
    }
  }

  private handleViewPublished(): void {
    const appId = this.getAppId();
    const subdomain = this.getAppSubdomain();

    if (subdomain) {
      // Open via subdomain
      const baseUrl = window.location.origin.replace(/^(https?:\/\/)([^.]+)/, `$1${subdomain}`);
      window.open(baseUrl, '_blank');
    } else if (appId) {
      // Open via view route
      window.open(`/view/${appId}`, '_blank');
    }
  }

  private formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  private getChangeIcon(type: string): string {
    switch (type) {
      case 'component': return 'box';
      case 'page': return 'file';
      case 'app': return 'settings';
      default: return 'edit';
    }
  }

  private getChangeColor(type: string): string {
    switch (type) {
      case 'component': return 'blue';
      case 'page': return 'orange';
      case 'app': return 'green';
      default: return 'gray';
    }
  }

  private renderLoading() {
    return html`
      <div class="loading-container">
        <nr-skeleton width="100%" height="60px" style="margin-bottom: 12px;"></nr-skeleton>
        <nr-skeleton width="100%" height="60px" style="margin-bottom: 12px;"></nr-skeleton>
        <nr-skeleton width="100%" height="60px"></nr-skeleton>
      </div>
    `;
  }

  private renderEmptyChanges() {
    return html`
      <div class="empty-state">
        <nr-icon name="check-circle" size="xlarge" class="empty-icon"></nr-icon>
        <p>All changes published</p>
        <span>New changes will appear here as you edit</span>
      </div>
    `;
  }

  private renderChangesTab(): TemplateResult {
    if (this.loading) {
      return this.renderLoading();
    }

    if (this.changes.length === 0) {
      return this.renderEmptyChanges();
    }

    const timelineItems = this.changes.map(change => ({
      children: `${change.type}: ${change.name || change.entityId.slice(0, 8)}`,
      label: `v${change.version} · ${this.formatRelativeTime(change.createdAt)}`,
      color: this.getChangeColor(change.type),
      dot: this.getChangeIcon(change.type),
    }));

    return html`
      <div style="padding: 8px 8px 8px 12px;">
        <nr-timeline .items=${timelineItems}></nr-timeline>
      </div>
    `;
  }

  private renderPublishTab(): TemplateResult {
    const hasChanges = this.changes.length > 0;
    const isPublished = !!this.publishedVersion;

    return html`
      <div style="display: flex; flex-direction: column; gap: 12px; padding: 12px;">
        <nr-button
          type="primary"
          size="small"
          ?loading=${this.publishing}
          ?disabled=${this.publishing}
          @click=${this.handlePublishNow}
          iconLeft="upload-cloud"
          block
        >
          Publish
        </nr-button>

        ${hasChanges
          ? html`<nr-alert type="warning" size="small" show-icon icon="alert-circle">${this.changes.length} change${this.changes.length > 1 ? 's' : ''} pending</nr-alert>`
          : html`<nr-alert type="success" size="small" show-icon icon="check-circle">All changes published</nr-alert>`}

        <div style="display: flex; flex-direction: column; gap: 10px; padding: 10px; background: var(--bg-secondary, #f9fafb); border-radius: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <nr-label size="small">Status</nr-label>
            <nr-tag type=${isPublished ? 'success' : 'default'} size="small">
              ${isPublished ? 'Live' : 'Not published'}
            </nr-tag>
          </div>
          ${isPublished && this.publishedVersion
            ? html`
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <nr-label size="small">Version</nr-label>
                  <span style="font-size: 12px; font-weight: 500;">${this.publishedVersion.revision}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <nr-label size="small">Last published</nr-label>
                  <span style="font-size: 12px; font-weight: 500;">${this.formatRelativeTime(this.publishedVersion.publishedAt)}</span>
                </div>
              `
            : nothing}
        </div>

        ${isPublished
          ? html`
              <nr-button
                type="tertiary"
                size="small"
                @click=${this.handleViewPublished}
                iconLeft="external-link"
                block
              >
                View Published App
              </nr-button>
            `
          : nothing}
      </div>
    `;
  }

  private handleTabChange(e: CustomEvent) {
    this.activeTab = e.detail.index;
  }

  override render() {
    const tabs = [
      {
        label: `Changes${this.changes.length > 0 ? ` (${this.changes.length})` : ''}`,
        icon: 'edit-3',
        content: this.renderChangesTab()
      },
      {
        label: 'Publish',
        icon: 'send',
        content: this.renderPublishTab()
      }
    ];

    return html`
      <div class="revision-panel">
        <div class="panel-header">
          <h3 class="panel-title">Version History</h3>
          <nr-button
            type="text"
            size="small"
            ?disabled=${this.loading}
            @click=${() => this.loadData()}
            iconLeft="refresh-cw"
            title="Refresh"
          ></nr-button>
        </div>

        ${this.message
          ? html`
              <nr-alert
                type=${this.message.type}
                size="small"
                closable
                @close=${() => (this.message = null)}
              >
                ${this.message.text}
              </nr-alert>
            `
          : nothing}

        <nr-tabs
          .tabs=${tabs}
          .activeTab=${this.activeTab}
          size="small"
          align="stretch"
          @nr-tab-change=${this.handleTabChange}
        ></nr-tabs>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'revision-panel': RevisionPanel;
  }
}
