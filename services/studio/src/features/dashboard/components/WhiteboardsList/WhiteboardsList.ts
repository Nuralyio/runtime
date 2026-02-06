/**
 * Whiteboards List Component
 * Displays a list of whiteboards across all applications
 * Supports creating new whiteboards and toggling between card and table view
 * Uses KV storage for user preferences via nanostores
 */

import { html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import styles from './WhiteboardsList.style';
import { formatDate, type WhiteboardWithAppName, type ApplicationWithStatus } from '../../services/dashboard.service';
import {
  $pinnedWhiteboards,
  $whiteboardsViewMode,
  $preferencesLoading,
  initUserPreferences,
  togglePinnedWhiteboard,
  setWhiteboardsViewMode,
  cleanupPinnedWhiteboards,
} from '../../stores/user-preferences.store';
import { getWhiteboardService } from '../../../../services/lazy-loader';
import type { IHeader } from '../../../runtime/components/ui/nuraly-ui/src/components/table/table.types';

// Import NuralyUI components
import '../../../runtime/components/ui/nuraly-ui/src/components/button';
import '../../../runtime/components/ui/nuraly-ui/src/components/badge';
import '../../../runtime/components/ui/nuraly-ui/src/components/table';
import '../../../runtime/components/ui/nuraly-ui/src/components/dropdown';
import '../../../runtime/components/ui/nuraly-ui/src/components/input';
import '../../../runtime/components/ui/nuraly-ui/src/components/select';
import '../../../runtime/components/ui/nuraly-ui/src/components/tag';
import '../../../runtime/components/ui/nuraly-ui/src/components/card';
import '../../../runtime/components/ui/nuraly-ui/src/components/icon';
import '../../../runtime/components/ui/nuraly-ui/src/components/radio-group';

type ViewMode = 'cards' | 'table';

@customElement('whiteboards-list')
export class WhiteboardsList extends LitElement {
  static styles = styles;

  @property({ type: Array }) whiteboards: WhiteboardWithAppName[] = [];
  @property({ type: Array }) applications: ApplicationWithStatus[] = [];

  @state() private showCreateDropdown = false;
  @state() private isCreating = false;
  @state() private whiteboardName = '';
  @state() private viewMode: ViewMode = 'cards';
  @state() private pinnedIds: Set<string> = new Set();
  @state() private preferencesLoading = true;

  private unsubscribes: (() => void)[] = [];

  override connectedCallback() {
    super.connectedCallback();

    initUserPreferences();

    this.unsubscribes.push(
      $pinnedWhiteboards.subscribe(pinned => {
        this.pinnedIds = pinned;
        this.requestUpdate();
      })
    );

    this.unsubscribes.push(
      $whiteboardsViewMode.subscribe(mode => {
        this.viewMode = mode;
      })
    );

    this.unsubscribes.push(
      $preferencesLoading.subscribe(loading => {
        this.preferencesLoading = loading;
      })
    );
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribes.forEach(unsub => unsub());
    this.unsubscribes = [];
  }

  override updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has('whiteboards') && this.whiteboards.length > 0) {
      const validIds = new Set(this.whiteboards.map(w => w.id));
      cleanupPinnedWhiteboards(validIds);
    }
  }

  private get whiteboardsWithPinnedStatus(): WhiteboardWithAppName[] {
    return this.whiteboards.map(w => ({
      ...w,
      isPinned: this.pinnedIds.has(w.id)
    }));
  }

  private get pinnedWhiteboards(): WhiteboardWithAppName[] {
    return this.whiteboardsWithPinnedStatus.filter(w => w.isPinned);
  }

  private get unpinnedWhiteboards(): WhiteboardWithAppName[] {
    return this.whiteboardsWithPinnedStatus.filter(w => !w.isPinned);
  }

  private get viewModeOptions() {
    return [
      { value: 'cards', label: '', icon: 'grid' },
      { value: 'table', label: '', icon: 'list' }
    ];
  }

  private async handleViewModeChange(e: CustomEvent) {
    const value = e.detail?.value;
    if (value === 'cards' || value === 'table') {
      await setWhiteboardsViewMode(value);
    }
  }

  private getTableHeaders(): IHeader[] {
    return [
      {
        name: '',
        key: 'isPinned',
        width: 40,
        render: (_value: boolean, row: WhiteboardWithAppName) => html`
          <nr-icon
            name="star"
            class="pin-icon ${row.isPinned ? 'pinned' : ''}"
            title=${row.isPinned ? 'Unpin whiteboard' : 'Pin whiteboard'}
            @click=${(e: Event) => this.handlePin(e, row)}
          ></nr-icon>
        `,
      },
      {
        name: 'Name',
        key: 'name',
        render: (value: string) => html`<span class="whiteboard-name">${value}</span>`,
      },
      {
        name: 'Application',
        key: 'applicationName',
        render: (value: string) => html`<span class="whiteboard-app">${value || 'Unknown'}</span>`,
      },
      {
        name: 'Elements',
        key: 'elementsCount',
        width: 80,
        render: (value: number) => html`<span class="elements-count">${value}</span>`,
      },
      {
        name: 'Last Updated',
        key: 'updatedAt',
        render: (value: string) => html`<span class="date-text">${formatDate(value)}</span>`,
      },
      {
        name: 'Actions',
        key: 'actions',
        width: 120,
        render: (_value: any, row: WhiteboardWithAppName) => html`
          <div class="actions-cell">
            <nr-button
              type="primary"
              size="small"
              iconLeft="ExternalLink"
              title="Open whiteboard"
              @click=${(e: Event) => this.handleOpen(e, row)}
            >Open</nr-button>
          </div>
        `,
      },
    ];
  }

  private handleRowClick(whiteboard: WhiteboardWithAppName) {
    window.location.href = `/dashboard/whiteboard/${whiteboard.id}`;
  }

  private handleOpen(e: Event, whiteboard: WhiteboardWithAppName) {
    e.stopPropagation();
    window.location.href = `/dashboard/whiteboard/edit/${whiteboard.id}`;
  }

  private async handlePin(e: Event, whiteboard: WhiteboardWithAppName) {
    e.stopPropagation();
    await togglePinnedWhiteboard(whiteboard.id);
  }

  private closeCreateDropdown() {
    this.showCreateDropdown = false;
    this.whiteboardName = '';
  }

  private handleNameInput(e: CustomEvent) {
    this.whiteboardName = e.detail?.value || (e.target as HTMLInputElement)?.value || '';
  }

  private async handleCreateWhiteboard() {
    const name = this.whiteboardName.trim();
    if (!name) return;

    const select = this.shadowRoot?.querySelector('.create-whiteboard-form nr-select') as any;
    const applicationId = select?.value || '';

    this.isCreating = true;
    try {
      const whiteboardService = await getWhiteboardService();
      const whiteboard = await whiteboardService.createWhiteboard(name, applicationId);

      this.closeCreateDropdown();

      this.dispatchEvent(new CustomEvent('refresh', {
        bubbles: true,
        composed: true
      }));

      window.location.href = `/dashboard/whiteboard/${whiteboard.id}`;
    } catch (error) {
      console.error('Failed to create whiteboard:', error);
    } finally {
      this.isCreating = false;
    }
  }

  private getAppOptions() {
    return this.applications.map(app => ({
      value: app.uuid,
      label: app.name
    }));
  }

  private renderEmptyState() {
    return html`
      <div class="empty-state">
        <svg class="empty-state-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        <h3 class="empty-state-title">No whiteboards yet</h3>
        <p class="empty-state-description">
          Create whiteboards to collaborate visually with your team.
        </p>
        <div style="margin-top: 16px;">
          ${this.renderCreateButton()}
        </div>
      </div>
    `;
  }

  private renderCreateForm() {
    return html`
      <div class="create-whiteboard-form">
        <div class="dropdown-form-header">New Whiteboard</div>
        <div class="form-field">
          <label class="form-label">Name</label>
          <nr-input
            placeholder="Enter whiteboard name"
            size="small"
            .value=${this.whiteboardName}
            @nr-input=${this.handleNameInput}
          ></nr-input>
        </div>
        <div class="form-field">
          <label class="form-label">Application <span class="optional-label">(optional)</span></label>
          <nr-select
            placeholder="Select application"
            size="small"
            .options=${this.getAppOptions()}
          ></nr-select>
        </div>
        <div class="dropdown-form-actions">
          <nr-button type="default" size="small" @click=${this.closeCreateDropdown}>Cancel</nr-button>
          <nr-button
            type="primary"
            size="small"
            ?disabled=${!this.whiteboardName.trim() || this.isCreating}
            @click=${this.handleCreateWhiteboard}
          >${this.isCreating ? 'Creating...' : 'Create'}</nr-button>
        </div>
      </div>
    `;
  }

  private renderCreateButton() {
    return html`
      <nr-dropdown
        trigger="click"
        placement="bottom-end"
        ?open=${this.showCreateDropdown}
        @nr-dropdown-open=${() => this.showCreateDropdown = true}
        @nr-dropdown-close=${this.closeCreateDropdown}
        close-on-outside-click
        close-on-escape
        min-width="280px"
        allow-overflow
      >
        <nr-button
          slot="trigger"
          type="primary"
          size="small"
          iconLeft="Plus"
        >Create Whiteboard</nr-button>
        <div slot="content">
          ${this.renderCreateForm()}
        </div>
      </nr-dropdown>
    `;
  }

  private renderWhiteboardCard(whiteboard: WhiteboardWithAppName, showUnpinButton = false) {
    return html`
      <nr-card @click=${() => this.handleRowClick(whiteboard)}>
        <div slot="content">
          <div class="card-header">
            <h3 class="card-name" title=${whiteboard.name}>${whiteboard.name}</h3>
            ${showUnpinButton ? html`
              <nr-icon
                name="star"
                class="unpin-icon"
                title="Unpin whiteboard"
                @click=${(e: Event) => this.handlePin(e, whiteboard)}
              ></nr-icon>
            ` : html`
              <nr-icon
                name="star"
                class="pin-icon"
                title="Pin whiteboard"
                @click=${(e: Event) => this.handlePin(e, whiteboard)}
              ></nr-icon>
            `}
          </div>

          <div class="card-meta">
            <span class="whiteboard-app">${whiteboard.applicationName || 'Unknown'}</span>
            <span class="elements-count">${whiteboard.elementsCount} elements</span>
          </div>

          <div class="card-footer">
            <div class="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>${formatDate(whiteboard.updatedAt)}</span>
            </div>

            <div class="card-actions">
              <nr-button type="primary" size="small" iconLeft="ExternalLink" @click=${(e: Event) => this.handleOpen(e, whiteboard)}>
                Open
              </nr-button>
            </div>
          </div>
        </div>
      </nr-card>
    `;
  }

  private renderCardsGrid(whiteboards: WhiteboardWithAppName[], showUnpinButton = false) {
    if (whiteboards.length === 0) return nothing;

    return html`
      <div class="pinned-grid">
        ${whiteboards.map(wb => this.renderWhiteboardCard(wb, showUnpinButton))}
      </div>
    `;
  }

  private renderWhiteboardsTable(whiteboards: WhiteboardWithAppName[]) {
    if (whiteboards.length === 0) return nothing;

    return html`
      <div class="table-container">
        <nr-table
          .headers=${this.getTableHeaders()}
          .rows=${whiteboards}
          size="small"
          emptyText="No whiteboards found"
          clickable
          @nr-row-click=${(e: CustomEvent) => this.handleRowClick(e.detail.row)}
        ></nr-table>
      </div>
    `;
  }

  private renderSection(title: string, whiteboards: WhiteboardWithAppName[], status: 'success' | 'warning' | 'default', asCards = false, showUnpinButton = false) {
    if (whiteboards.length === 0) return nothing;

    return html`
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">${title}</h2>
          <nr-tag size="small" status=${status}>${whiteboards.length}</nr-tag>
        </div>
        ${asCards ? this.renderCardsGrid(whiteboards, showUnpinButton) : this.renderWhiteboardsTable(whiteboards)}
      </div>
    `;
  }

  render() {
    const pinned = this.pinnedWhiteboards;
    const unpinned = this.unpinnedWhiteboards;
    const hasPinned = pinned.length > 0;
    const showAsCards = this.viewMode === 'cards';

    return html`
      ${this.whiteboards.length === 0
        ? this.renderEmptyState()
        : html`
            <div class="list-header">
              <nr-radio-group
                type="button"
                size="small"
                direction="horizontal"
                auto-width
                .options=${this.viewModeOptions}
                .value=${this.viewMode}
                @nr-change=${this.handleViewModeChange}
              ></nr-radio-group>
              ${this.renderCreateButton()}
            </div>
            <div class="sections-container">
              ${hasPinned ? html`
                ${this.renderSection('Pinned', pinned, 'success', true, true)}
                ${this.renderSection('Whiteboards', unpinned, 'default', showAsCards, false)}
              ` : html`
                ${showAsCards ? this.renderCardsGrid(this.whiteboardsWithPinnedStatus, false) : this.renderWhiteboardsTable(this.whiteboardsWithPinnedStatus)}
              `}
            </div>
          `
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'whiteboards-list': WhiteboardsList;
  }
}
