/**
 * Applications Grid Component
 * Displays a grid of application cards with search and filter
 */

import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import styles from './ApplicationsGrid.style';
import type { ApplicationWithStatus } from '../../services/dashboard.service';

// Import NuralyUI components
import '../../../runtime/components/ui/nuraly-ui/src/components/button';
import '../../../runtime/components/ui/nuraly-ui/src/components/input';
import '../../../runtime/components/ui/nuraly-ui/src/components/select';
import '../../../runtime/components/ui/nuraly-ui/src/components/tag';

type StatusFilter = 'all' | 'published' | 'draft';

@customElement('applications-grid')
export class ApplicationsGrid extends LitElement {
  static styles = styles;

  @property({ type: Array }) applications: ApplicationWithStatus[] = [];

  @state() private searchQuery = '';
  @state() private statusFilter: StatusFilter = 'all';

  private handleCreateApp() {
    window.location.href = '/app/studio?new=true';
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

  private get filteredApplications(): ApplicationWithStatus[] {
    return this.applications.filter(app => {
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

  private get publishedApplications(): ApplicationWithStatus[] {
    return this.filteredApplications.filter(app => app.isPublished);
  }

  private get draftApplications(): ApplicationWithStatus[] {
    return this.filteredApplications.filter(app => !app.isPublished);
  }

  private get statusOptions() {
    return [
      { value: 'all', label: 'All Status' },
      { value: 'published', label: 'Published' },
      { value: 'draft', label: 'Draft' }
    ];
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
        <nr-button type="primary" iconLeft="Plus" @click=${this.handleCreateApp}>
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

  private renderSection(title: string, apps: ApplicationWithStatus[], status: 'success' | 'warning' | 'default') {
    if (apps.length === 0) return '';

    return html`
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">${title}</h2>
          <nr-tag size="small" status=${status}>${apps.length}</nr-tag>
        </div>
        <div class="applications-grid">
          ${apps.map(app => html`
            <application-card .application=${app}></application-card>
          `)}
        </div>
      </div>
    `;
  }

  render() {
    const filtered = this.filteredApplications;
    const published = this.publishedApplications;
    const drafts = this.draftApplications;
    const hasApplications = this.applications.length > 0;
    const hasResults = filtered.length > 0;

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
          <nr-button type="primary" iconLeft="Plus" @click=${this.handleCreateApp}>
            New Application
          </nr-button>
        </div>
      ` : ''}

      ${!hasApplications
        ? this.renderEmptyState()
        : !hasResults
          ? this.renderNoResults()
          : html`
              <div class="sections-container">
                ${this.renderSection('Published', published, 'success')}
                ${this.renderSection('Drafts', drafts, 'warning')}
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
