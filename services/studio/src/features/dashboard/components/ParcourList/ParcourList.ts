/**
 * Dashboard Parcour List Component
 * Shows parcours (user journeys/flows)
 */

import { html, LitElement, css } from 'lit';
import { customElement } from 'lit/decorators.js';

import '../../../runtime/components/ui/nuraly-ui/src/components/button';

@customElement('dashboard-parcour-list')
export class DashboardParcourList extends LitElement {
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
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
        </svg>
        <h3 class="empty-title">Parcour</h3>
        <p class="empty-text">Design and manage user journeys across your applications</p>
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
    'dashboard-parcour-list': DashboardParcourList;
  }
}
