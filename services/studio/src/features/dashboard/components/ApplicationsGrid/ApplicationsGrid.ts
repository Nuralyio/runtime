/**
 * Applications Grid Component
 * Displays pinned applications as cards, published apps as cards, and drafts in a table
 * Supports toggling between card and table view
 * Uses KV storage for user preferences via nanostores
 */

import { html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import styles from './ApplicationsGrid.style';
import { formatDate, type ApplicationWithStatus } from '../../services/dashboard.service';
import {
  $pinnedApplications,
  $applicationsViewMode,
  $preferencesLoading,
  initUserPreferences,
  togglePinnedApplication,
  setApplicationsViewMode,
  cleanupPinnedApplications,
} from '../../stores/user-preferences.store';
import type { IHeader } from '../../../runtime/components/ui/nuraly-ui/src/components/table/table.types';

// Import NuralyUI components
import '../../../runtime/components/ui/nuraly-ui/src/components/button';
import '../../../runtime/components/ui/nuraly-ui/src/components/input';
import '../../../runtime/components/ui/nuraly-ui/src/components/select';
import '../../../runtime/components/ui/nuraly-ui/src/components/tag';
import '../../../runtime/components/ui/nuraly-ui/src/components/card';
import '../../../runtime/components/ui/nuraly-ui/src/components/badge';
import '../../../runtime/components/ui/nuraly-ui/src/components/table';
import '../../../runtime/components/ui/nuraly-ui/src/components/icon';
import '../../../runtime/components/ui/nuraly-ui/src/components/radio-group';
import '../../../runtime/components/ui/nuraly-ui/src/components/dropdown';

type StatusFilter = 'all' | 'published' | 'draft';

interface ApplicationTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

const APPLICATION_TEMPLATES: ApplicationTemplate[] = [
  {
    id: 'form-builder',
    name: 'Form Builder',
    description: 'Build dynamic forms with validation and submission handling',
    icon: 'file-text',
    category: 'Input',
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Create an interactive dashboard with charts and metrics',
    icon: 'layout-dashboard',
    category: 'Analytics',
  },
  {
    id: 'crud-app',
    name: 'CRUD Application',
    description: 'Full create, read, update, delete operations template',
    icon: 'database',
    category: 'Data',
  },
  {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'Marketing landing page with hero and feature sections',
    icon: 'globe',
    category: 'Marketing',
  },
  {
    id: 'user-portal',
    name: 'User Portal',
    description: 'User account management with profile and settings',
    icon: 'users',
    category: 'Auth',
  },
  {
    id: 'wizard-flow',
    name: 'Multi-Step Wizard',
    description: 'Guide users through a multi-step process or onboarding',
    icon: 'git-branch',
    category: 'Flow',
  },
];
type ViewMode = 'cards' | 'table';

@customElement('applications-grid')
export class ApplicationsGrid extends LitElement {
  static styles = styles;

  @property({ type: Array }) applications: ApplicationWithStatus[] = [];

  @state() private searchQuery = '';
  @state() private statusFilter: StatusFilter = 'all';
  @state() private viewMode: ViewMode = 'cards';
  @state() private pinnedIds: Set<string> = new Set();
  @state() private preferencesLoading = true;

  // Create app dropdown states
  @state() private showCreateDropdown = false;
  @state() private showBlankForm = false;
  @state() private showTemplateModal = false;
  @state() private selectedTemplate: ApplicationTemplate | null = null;
  @state() private appName = '';
  @state() private isCreating = false;

  private unsubscribes: (() => void)[] = [];

  override connectedCallback() {
    super.connectedCallback();

    // Initialize preferences
    initUserPreferences();

    // Subscribe to stores
    this.unsubscribes.push(
      $pinnedApplications.subscribe(pinned => {
        this.pinnedIds = pinned;
        // Trigger re-render by updating applications with new isPinned values
        this.requestUpdate();
      })
    );

    this.unsubscribes.push(
      $applicationsViewMode.subscribe(mode => {
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

    // Clean up pinned IDs when applications change
    if (changedProperties.has('applications') && this.applications.length > 0) {
      const validAppIds = new Set(this.applications.map(a => a.uuid));
      cleanupPinnedApplications(validAppIds);
    }
  }

  private handleCreateApp() {
    window.location.href = '/app/studio/new';
  }

  private generateDefaultAppName(): string {
    const baseName = 'Untitled Application';
    const existingNames = new Set(this.applications.map(app => app.name));

    if (!existingNames.has(baseName)) {
      return baseName;
    }

    let counter = 1;
    while (existingNames.has(`${baseName} ${counter}`)) {
      counter++;
    }
    return `${baseName} ${counter}`;
  }

  private closeCreateDropdown() {
    this.showCreateDropdown = false;
    // Reset form state when closing
    this.showBlankForm = false;
    this.appName = '';
  }

  private handleShowBlankForm() {
    this.appName = this.generateDefaultAppName();
    this.showBlankForm = true;
  }

  private handleBackToOptions() {
    this.showBlankForm = false;
    this.appName = '';
  }

  private handleShowTemplateModal() {
    this.showCreateDropdown = false;
    this.showTemplateModal = true;
    this.selectedTemplate = null;
  }

  private handleCloseTemplateModal() {
    this.showTemplateModal = false;
    this.selectedTemplate = null;
  }

  private handleSelectTemplate(template: ApplicationTemplate) {
    this.selectedTemplate = template;
  }

  private handleAppNameInput(e: CustomEvent) {
    this.appName = (e.target as HTMLInputElement).value || '';
  }

  private async createApplication(name: string): Promise<{ uuid: string } | null> {
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create application: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to create application:', error);
      return null;
    }
  }

  private async handleCreateBlankApp() {
    if (!this.appName.trim() || this.isCreating) return;

    this.isCreating = true;
    try {
      const app = await this.createApplication(this.appName.trim());
      if (app?.uuid) {
        this.closeCreateDropdown();
        window.location.href = `/app/studio/${app.uuid}`;
      } else {
        console.error('Failed to create application: No UUID returned');
      }
    } catch (error) {
      console.error('Failed to create application:', error);
    } finally {
      this.isCreating = false;
    }
  }

  private async handleCreateFromTemplate() {
    if (!this.selectedTemplate || this.isCreating) return;

    this.isCreating = true;
    try {
      // Create app with template name
      const app = await this.createApplication(this.selectedTemplate.name);
      if (app?.uuid) {
        this.handleCloseTemplateModal();
        // TODO: Apply template to the app
        window.location.href = `/app/studio/${app.uuid}`;
      } else {
        console.error('Failed to create application from template: No UUID returned');
      }
    } catch (error) {
      console.error('Failed to create application from template:', error);
    } finally {
      this.isCreating = false;
    }
  }

  private handleSearchInput(e: CustomEvent) {
    this.searchQuery = (e.target as HTMLInputElement).value || '';
  }

  private handleStatusFilterChange(e: CustomEvent) {
    const value = e.detail?.value;
    if (value === 'all' || value === 'published' || value === 'draft') {
      this.statusFilter = value;
    }
  }

  private async handleViewModeChange(e: CustomEvent) {
    const value = e.detail?.value;
    if (value === 'cards' || value === 'table') {
      await setApplicationsViewMode(value);
    }
  }

  private get viewModeOptions() {
    return [
      { value: 'cards', label: '', icon: 'grid' },
      { value: 'table', label: '', icon: 'list' }
    ];
  }

  private get applicationsWithPinnedStatus(): ApplicationWithStatus[] {
    return this.applications.map(app => ({
      ...app,
      isPinned: this.pinnedIds.has(app.uuid)
    }));
  }

  private get filteredApplications(): ApplicationWithStatus[] {
    return this.applicationsWithPinnedStatus.filter(app => {
      // Search filter
      const matchesSearch = !this.searchQuery ||
        app.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (app.description?.toLowerCase().includes(this.searchQuery.toLowerCase()));

      // Status filter
      const matchesStatus = this.statusFilter === 'all' ||
        (this.statusFilter === 'published' && app.isPublished) ||
        (this.statusFilter === 'draft' && !app.isPublished);

      return matchesSearch && matchesStatus;
    });
  }

  private get pinnedApplications(): ApplicationWithStatus[] {
    return this.filteredApplications.filter(app => app.isPinned);
  }

  private get publishedUnpinnedApplications(): ApplicationWithStatus[] {
    return this.filteredApplications.filter(app => app.isPublished && !app.isPinned);
  }

  private get draftApplications(): ApplicationWithStatus[] {
    return this.filteredApplications.filter(app => !app.isPublished && !app.isPinned);
  }

  private get statusOptions() {
    return [
      { value: 'all', label: 'All Status' },
      { value: 'published', label: 'Published' },
      { value: 'draft', label: 'Draft' }
    ];
  }

  private getTableHeaders(): IHeader[] {
    return [
      {
        name: '',
        key: 'isPinned',
        width: 40,
        render: (_value: boolean, row: ApplicationWithStatus) => html`
          <nr-icon
            name="star"
            class="pin-icon ${row.isPinned ? 'pinned' : ''}"
            title=${row.isPinned ? 'Unpin application' : 'Pin application'}
            @click=${(e: Event) => this.handlePin(e, row)}
          ></nr-icon>
        `,
      },
      {
        name: 'Name',
        key: 'name',
        render: (value: string) => html`<span class="app-name">${value}</span>`,
      },
      {
        name: 'Status',
        key: 'isPublished',
        render: (value: boolean) => html`
          <span class="status-badge ${value ? 'published' : 'draft'}">
            <span class="status-dot"></span>
            ${value ? 'Published' : 'Draft'}
          </span>
        `,
      },
      {
        name: 'Last Updated',
        key: 'updatedAt',
        render: (value: string) => html`<span class="date-text">${formatDate(value)}</span>`,
      },
      {
        name: 'Actions',
        key: 'actions',
        width: 150,
        render: (_value: any, row: ApplicationWithStatus) => html`
          <div class="actions-cell">
            <nr-button
              type="primary"
              size="small"
              iconLeft="Pencil"
              title="Edit application"
              @click=${(e: Event) => this.handleEdit(e, row)}
            >Edit</nr-button>
            ${row.isPublished ? html`
              <nr-button
                type="default"
                size="small"
                iconLeft="Eye"
                title="Preview application"
                @click=${(e: Event) => this.handlePreview(e, row)}
              >Preview</nr-button>
            ` : nothing}
          </div>
        `,
      },
    ];
  }

  private handleRowClick(app: ApplicationWithStatus) {
    window.location.href = `/app/studio/${app.uuid}`;
  }

  private handleEdit(e: Event, app: ApplicationWithStatus) {
    e.stopPropagation();
    window.location.href = `/app/studio/${app.uuid}`;
  }

  private handlePreview(e: Event, app: ApplicationWithStatus) {
    e.stopPropagation();
    if (app.isPublished) {
      window.open(`/app/view/${app.uuid}`, '_blank');
    }
  }

  private async handlePin(e: Event, app: ApplicationWithStatus) {
    e.stopPropagation();
    await togglePinnedApplication(app.uuid);
  }

  private renderCreateOptionsMenu() {
    return html`
      <div class="create-options-menu">
        <div class="create-option" @click=${this.handleShowTemplateModal}>
          <div class="create-option-icon">
            <nr-icon name="layout-template"></nr-icon>
          </div>
          <div class="create-option-content">
            <span class="create-option-title">From Template</span>
            <span class="create-option-description">Start with a pre-built template</span>
          </div>
        </div>
        <div class="create-option" @click=${this.handleShowBlankForm}>
          <div class="create-option-icon">
            <nr-icon name="file-plus"></nr-icon>
          </div>
          <div class="create-option-content">
            <span class="create-option-title">Blank Application</span>
            <span class="create-option-description">Start from scratch</span>
          </div>
        </div>
      </div>
    `;
  }

  private renderBlankForm() {
    return html`
      <div class="create-app-form">
        <button class="dropdown-back-button" @click=${this.handleBackToOptions}>
          <nr-icon name="arrow-left"></nr-icon>
          Back
        </button>
        <div class="dropdown-form-header">New Application</div>
        <div class="form-field">
          <label class="form-label">Name</label>
          <nr-input
            type="text"
            placeholder="My Application"
            size="small"
            .value=${this.appName}
            @nr-input=${this.handleAppNameInput}
          ></nr-input>
        </div>
        <div class="dropdown-form-actions">
          <nr-button
            type="primary"
            size="small"
            ?disabled=${!this.appName.trim() || this.isCreating}
            ?loading=${this.isCreating}
            @click=${this.handleCreateBlankApp}
          >
            Create
          </nr-button>
        </div>
      </div>
    `;
  }

  private renderTemplateModal() {
    if (!this.showTemplateModal) return nothing;

    return html`
      <div class="template-modal-overlay" @click=${this.handleCloseTemplateModal}>
        <div class="template-modal" @click=${(e: Event) => e.stopPropagation()}>
          <div class="template-modal-header">
            <h2 class="template-modal-title">Choose a Template</h2>
            <button class="template-modal-close" @click=${this.handleCloseTemplateModal}>
              <nr-icon name="x"></nr-icon>
            </button>
          </div>
          <div class="template-modal-body">
            <div class="template-grid">
              ${APPLICATION_TEMPLATES.map(
                template => html`
                  <div
                    class="template-card ${this.selectedTemplate?.id === template.id ? 'selected' : ''}"
                    @click=${() => this.handleSelectTemplate(template)}
                  >
                    <div class="template-card-icon">
                      <nr-icon name=${template.icon}></nr-icon>
                    </div>
                    <h3 class="template-card-name">${template.name}</h3>
                    <p class="template-card-description">${template.description}</p>
                    <span class="template-card-category">${template.category}</span>
                  </div>
                `
              )}
            </div>
          </div>
          <div class="template-modal-footer">
            <nr-button type="default" size="small" @click=${this.handleCloseTemplateModal}>
              Cancel
            </nr-button>
            <nr-button
              type="primary"
              size="small"
              ?disabled=${!this.selectedTemplate || this.isCreating}
              ?loading=${this.isCreating}
              @click=${this.handleCreateFromTemplate}
            >
              Use Template
            </nr-button>
          </div>
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
        <nr-button slot="trigger" type="primary" size="small" iconLeft="Plus">
          New Application
        </nr-button>
        <div slot="content">
          ${this.showBlankForm ? this.renderBlankForm() : this.renderCreateOptionsMenu()}
        </div>
      </nr-dropdown>
    `;
  }

  private renderEmptyState() {
    return html`
      <div class="empty-state">
        <svg class="empty-state-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 class="empty-state-title">No applications yet</h3>
        <p class="empty-state-description">
          Create your first application to get started building amazing experiences.
        </p>
        <nr-button type="primary" size="small" iconLeft="Plus" @click=${this.handleCreateApp}>
          Create Application
        </nr-button>
      </div>
    `;
  }

  private renderNoResults() {
    return html`
      <div class="empty-state">
        <svg class="empty-state-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 class="empty-state-title">No applications found</h3>
        <p class="empty-state-description">
          Try adjusting your search or filter to find what you're looking for.
        </p>
      </div>
    `;
  }

  private renderApplicationCard(app: ApplicationWithStatus, showUnpinButton = false) {
    return html`
      <nr-card @click=${() => this.handleRowClick(app)}>
        <div slot="content">
          <div class="card-header">
            <h3 class="card-name" title=${app.name}>${app.name}</h3>
            <div class="card-header-actions">
              ${showUnpinButton ? html`
                <nr-icon
                  name="star"
                  class="unpin-icon"
                  title="Unpin application"
                  @click=${(e: Event) => this.handlePin(e, app)}
                ></nr-icon>
              ` : html`
                <nr-icon
                  name="star"
                  class="pin-icon"
                  title="Pin application"
                  @click=${(e: Event) => this.handlePin(e, app)}
                ></nr-icon>
              `}
              <nr-badge
                status=${app.isPublished ? 'success' : 'warning'}
                text=${app.isPublished ? 'Published' : 'Draft'}
              ></nr-badge>
            </div>
          </div>

          <p class="card-description">
            ${app.description || 'No description provided'}
          </p>

          <div class="card-footer">
            <div class="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>${formatDate(app.updatedAt)}</span>
            </div>

            <div class="card-actions">
              <nr-button type="primary" size="small" iconLeft="Pencil" @click=${(e: Event) => this.handleEdit(e, app)}>
                Edit
              </nr-button>
              ${app.isPublished ? html`
                <nr-button type="default" size="small" iconLeft="Eye" @click=${(e: Event) => this.handlePreview(e, app)}>
                  Preview
                </nr-button>
              ` : nothing}
            </div>
          </div>
        </div>
      </nr-card>
    `;
  }

  private renderCardsGrid(apps: ApplicationWithStatus[], showUnpinButton = false) {
    if (apps.length === 0) return nothing;

    return html`
      <div class="${showUnpinButton ? 'pinned-grid' : 'applications-grid'}">
        ${apps.map(app => this.renderApplicationCard(app, showUnpinButton))}
      </div>
    `;
  }

  private renderApplicationsTable(apps: ApplicationWithStatus[]) {
    if (apps.length === 0) return nothing;

    return html`
      <div class="table-container">
        <nr-table
          .headers=${this.getTableHeaders()}
          .rows=${apps}
          size="small"
          emptyText="No applications found"
          clickable
          @nr-row-click=${(e: CustomEvent) => this.handleRowClick(e.detail.row)}
        ></nr-table>
      </div>
    `;
  }

  private renderSection(
    title: string,
    apps: ApplicationWithStatus[],
    status: 'success' | 'warning' | 'default',
    asCards = false,
    showUnpinButton = false
  ) {
    if (apps.length === 0) return nothing;

    return html`
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">${title}</h2>
          <nr-tag size="small" status=${status}>${apps.length}</nr-tag>
        </div>
        ${asCards ? this.renderCardsGrid(apps, showUnpinButton) : this.renderApplicationsTable(apps)}
      </div>
    `;
  }

  render() {
    const filtered = this.filteredApplications;
    const pinned = this.pinnedApplications;
    const publishedUnpinned = this.publishedUnpinnedApplications;
    const drafts = this.draftApplications;
    const hasApplications = this.applications.length > 0;
    const hasResults = filtered.length > 0;

    // Determine if we show as cards or table based on view mode
    const showAsCards = this.viewMode === 'cards';

    return html`
      ${hasApplications ? html`
        <div class="grid-header">
          <div class="search-filter-row">
            <nr-input
              type="text"
              placeholder="Search applications..."
              size="small"
              .value=${this.searchQuery}
              @nr-input=${this.handleSearchInput}
              iconLeft="Search"
              clearable
              class="search-input"
            ></nr-input>
            <nr-select
              placeholder="Filter by status"
              size="small"
              .value=${this.statusFilter}
              .options=${this.statusOptions}
              @nr-change=${this.handleStatusFilterChange}
              class="status-filter"
            ></nr-select>
          </div>
          <div class="header-actions">
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
        </div>
      ` : nothing}

      ${this.renderTemplateModal()}

      ${!hasApplications
        ? this.renderEmptyState()
        : !hasResults
          ? this.renderNoResults()
          : html`
              <div class="sections-container">
                ${this.renderSection('Pinned', pinned, 'success', true, true)}
                ${this.renderSection('Published', publishedUnpinned, 'success', showAsCards, false)}
                ${this.renderSection('Drafts', drafts, 'warning', showAsCards, false)}
              </div>
            `
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'applications-grid': ApplicationsGrid;
  }
}
