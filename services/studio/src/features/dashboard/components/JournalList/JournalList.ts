/**
 * Dashboard Journal List Component
 * Shows journal entries for logging
 */

import { html, LitElement, css } from 'lit';
import { customElement } from 'lit/decorators.js';

import '../../../runtime/components/ui/nuraly-ui/src/components/button';

@customElement('dashboard-journal-list')
export class DashboardJournalList extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100%;
      overflow: auto;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .empty-icon {
      width: 48px;
      height: 48px;
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
      margin-bottom: 16px;
    }

    .empty-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--nuraly-color-text, #0f0f3c);
      margin: 0 0 4px 0;
    }

    .empty-text {
      font-size: 13px;
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
      margin: 0 0 16px 0;
    }

    .coming-soon {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: var(--nuraly-color-primary-bg, #f0f0f8);
      color: var(--nuraly-color-primary, #14144b);
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }
  `;

  render() {
    return html`
      <div class="empty-state">
        <svg class="empty-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <h3 class="empty-title">Journal</h3>
        <p class="empty-text">View and manage logs across your applications</p>
        <span class="coming-soon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          Coming Soon
        </span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dashboard-journal-list': DashboardJournalList;
  }
}
