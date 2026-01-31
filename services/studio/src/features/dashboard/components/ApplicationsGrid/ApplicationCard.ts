/**
 * Application Card Component
 * Displays a single application using nr-card with status badge
 */

import { html, LitElement, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { formatDate, type ApplicationWithStatus } from '../../services/dashboard.service';

// Import NuralyUI components
import '../../../runtime/components/ui/nuraly-ui/src/components/card';
import '../../../runtime/components/ui/nuraly-ui/src/components/badge';
import '../../../runtime/components/ui/nuraly-ui/src/components/button';

@customElement('application-card')
export class ApplicationCard extends LitElement {
  static styles = css`
    :host {
      display: block;
      /* Dashboard card CSS variables - aligned with Nuraly design system */
      --nuraly-dashboard-card-padding: 14px;
      --nuraly-dashboard-card-radius: 8px;
      --nuraly-dashboard-card-border: var(--nuraly-color-border, #e8e8f0);
      --nuraly-dashboard-card-shadow-hover: 0 2px 8px rgba(0, 0, 0, 0.08);
      --nuraly-dashboard-card-name-color: var(--nuraly-color-text, #0f0f3c);
      --nuraly-dashboard-card-desc-color: var(--nuraly-color-text-secondary, #5c5c7a);
      --nuraly-dashboard-card-meta-color: var(--nuraly-color-text-tertiary, #8c8ca8);
      --nuraly-dashboard-card-footer-border: var(--nuraly-color-border-subtle, #f0f0f0);
      --nuraly-dashboard-transition: 150ms ease;
    }

    nr-card {
      cursor: pointer;
      transition: box-shadow var(--nuraly-dashboard-transition);
      --nuraly-card-padding: var(--nuraly-dashboard-card-padding);
      --nuraly-card-border-radius: var(--nuraly-dashboard-card-radius);
      --nuraly-card-border-color: var(--nuraly-dashboard-card-border);
    }

    nr-card:hover {
      box-shadow: var(--nuraly-dashboard-card-shadow-hover);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 10px;
    }

    .app-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--nuraly-dashboard-card-name-color);
      margin: 0;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .app-description {
      font-size: 12px;
      color: var(--nuraly-dashboard-card-desc-color);
      margin: 10px 0 14px 0;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 36px;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 10px;
      border-top: 1px solid var(--nuraly-dashboard-card-footer-border);
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      color: var(--nuraly-dashboard-card-meta-color);
    }

    .meta-item svg {
      width: 12px;
      height: 12px;
    }

    .card-actions {
      display: flex;
      gap: 6px;
      opacity: 0;
      transition: opacity var(--nuraly-dashboard-transition);
    }

    nr-card:hover .card-actions {
      opacity: 1;
    }
  `;

  @property({ type: Object }) application!: ApplicationWithStatus;

  private openInStudio(e: Event) {
    e.stopPropagation();
    window.location.href = `/app/studio/${this.application.uuid}`;
  }

  private handlePreview(e: Event) {
    e.stopPropagation();
    if (this.application.isPublished) {
      window.open(`/app/view/${this.application.uuid}`, '_blank');
    }
  }

  private handleCardClick() {
    this.openInStudio(new Event('click'));
  }

  render() {
    const { name, description, isPublished, updatedAt } = this.application;

    return html`
      <nr-card @click=${this.handleCardClick}>
        <div slot="content">
          <div class="card-header">
            <h3 class="app-name" title=${name}>${name}</h3>
            <nr-badge
              status=${isPublished ? 'success' : 'warning'}
              text=${isPublished ? 'Published' : 'Draft'}
            ></nr-badge>
          </div>

          <p class="app-description">
            ${description || 'No description provided'}
          </p>

          <div class="card-footer">
            <div class="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>${formatDate(updatedAt)}</span>
            </div>

            <div class="card-actions">
              <nr-button type="primary" size="small" iconLeft="SquarePen" @click=${this.openInStudio}>
                Edit
              </nr-button>
              ${isPublished ? html`
                <nr-button type="default" size="small" iconLeft="ExternalLink" @click=${this.handlePreview}>
                  Preview
                </nr-button>
              ` : ''}
            </div>
          </div>
        </div>
      </nr-card>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'application-card': ApplicationCard;
  }
}
