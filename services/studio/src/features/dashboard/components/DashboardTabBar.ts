/**
 * Dashboard Tab Bar Component
 * Renders the horizontal tab bar for dashboard navigation
 */

import { html, LitElement, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { DashboardTab } from '../stores/dashboard-tabs.store';

// Import NuralyUI components
import '../../runtime/components/ui/nuraly-ui/src/components/button';

@customElement('dashboard-tab-bar')
export class DashboardTabBar extends LitElement {
  static styles = css`
    :host {
      display: block;
      background: var(--nuraly-color-surface, #ffffff);
      border-bottom: 1px solid var(--nuraly-color-border, #e8e8f0);
    }

    .tab-bar {
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 2px;
      overflow-x: auto;
      scrollbar-width: none;
    }

    .tab-bar::-webkit-scrollbar {
      display: none;
    }

    .tab {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      font-size: 13px;
      font-weight: 500;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      transition: all 150ms ease;
      white-space: nowrap;
      position: relative;
    }

    .tab:hover {
      color: var(--nuraly-color-text, #0f0f3c);
      background: var(--nuraly-color-background-hover, #f1f5f9);
    }

    .tab.active {
      color: var(--nuraly-color-primary, #14144b);
      border-bottom-color: var(--nuraly-color-primary, #14144b);
    }

    .tab-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
    }

    .tab-icon svg {
      width: 16px;
      height: 16px;
    }

    .tab-label {
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tab-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      margin-left: 4px;
      border-radius: 4px;
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
      transition: all 150ms ease;
    }

    .tab-close:hover {
      color: var(--nuraly-color-danger, #dc2626);
      background: var(--nuraly-color-danger-light, #fee2e2);
    }

    .tab-close svg {
      width: 12px;
      height: 12px;
    }

    .tab-app-name {
      font-size: 11px;
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
      margin-left: 4px;
    }
  `;

  @property({ type: Array }) tabs: DashboardTab[] = [];
  @property({ type: String }) activeTabId: string = 'overview';

  private getIcon(type: DashboardTab['type']) {
    switch (type) {
      case 'overview':
        return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>`;
      case 'app':
        return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M3 9h18"/>
          <path d="M9 21V9"/>
        </svg>`;
      case 'workflow':
        return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="6" cy="6" r="3"/>
          <circle cx="18" cy="18" r="3"/>
          <path d="M6 9v6c0 1.1.9 2 2 2h4"/>
          <path d="M18 9v-2c0-1.1-.9-2-2-2h-4"/>
        </svg>`;
      case 'database':
        return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <ellipse cx="12" cy="5" rx="9" ry="3"/>
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
        </svg>`;
      case 'kv':
        return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 5H3"/>
          <path d="M21 12H3"/>
          <path d="M21 19H3"/>
          <circle cx="7" cy="5" r="1" fill="currentColor"/>
          <circle cx="7" cy="12" r="1" fill="currentColor"/>
          <circle cx="7" cy="19" r="1" fill="currentColor"/>
        </svg>`;
      default:
        return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
        </svg>`;
    }
  }

  private handleTabClick(tabId: string) {
    this.dispatchEvent(new CustomEvent('tab-click', {
      detail: { tabId },
      bubbles: true,
      composed: true
    }));
  }

  private handleTabClose(e: Event, tabId: string) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('tab-close', {
      detail: { tabId },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="tab-bar">
        ${this.tabs.map(tab => html`
          <button
            class="tab ${tab.id === this.activeTabId ? 'active' : ''}"
            @click=${() => this.handleTabClick(tab.id)}
          >
            <span class="tab-icon">${this.getIcon(tab.type)}</span>
            <span class="tab-label">${tab.label}</span>
            ${tab.appName ? html`<span class="tab-app-name">(${tab.appName})</span>` : ''}
            ${tab.type !== 'overview' ? html`
              <span
                class="tab-close"
                @click=${(e: Event) => this.handleTabClose(e, tab.id)}
                title="Close tab"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </span>
            ` : ''}
          </button>
        `)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dashboard-tab-bar': DashboardTabBar;
  }
}
