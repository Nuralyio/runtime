/**
 * Dashboard Services Status Component
 * Shows status of services using existing v1 API endpoints
 */

import { html, LitElement, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '../../../runtime/components/ui/nuraly-ui/src/components/button';

interface ServiceConfig {
  id: string;
  name: string;
  description: string;
  endpoint: string;
}

interface ServiceStatus extends ServiceConfig {
  status: 'operational' | 'degraded' | 'down' | 'checking';
}

// Services with health endpoints
const SERVICE_CONFIG: ServiceConfig[] = [
  { id: 'api', name: 'API', description: 'Core Backend', endpoint: '/api/applications' },
  { id: 'functions', name: 'Functions', description: 'Serverless Runtime', endpoint: '/api/v1/functions/health' },
  { id: 'workflows', name: 'Workflows', description: 'Workflow Engine', endpoint: '/api/v1/workflows/health' },
  { id: 'kv', name: 'KV Store', description: 'Key-Value Storage', endpoint: '/api/v1/kv/health' },
  { id: 'conduit', name: 'Conduit', description: 'Database Connector', endpoint: '/api/v1/db/health' },
  { id: 'journal', name: 'Journal', description: 'Audit Logs', endpoint: '/api/v1/logs/health' },
  { id: 'textlens', name: 'TextLens', description: 'OCR Service', endpoint: '/api/v1/ocr/health' },
  { id: 'parcour', name: 'Parcour', description: 'Web Crawler', endpoint: '/api/v1/crawler/health' },
];

@customElement('dashboard-services-status')
export class DashboardServicesStatus extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
    }

    .services-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .overall-status {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
    }

    .overall-status.operational {
      background: var(--nuraly-color-success-light, #dcfce7);
      color: var(--nuraly-color-success, #16a34a);
    }

    .overall-status.degraded {
      background: var(--nuraly-color-warning-light, #fef9c3);
      color: var(--nuraly-color-warning, #ca8a04);
    }

    .overall-status.down {
      background: var(--nuraly-color-danger-light, #fee2e2);
      color: var(--nuraly-color-danger, #dc2626);
    }

    .overall-status.checking {
      background: var(--nuraly-color-background, #f8fafc);
      color: var(--nuraly-color-text-secondary, #5c5c7a);
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
    }

    .status-dot.checking {
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 12px;
    }

    .service-card {
      background: var(--nuraly-color-surface, #ffffff);
      border: 1px solid var(--nuraly-color-border, #e8e8f0);
      border-radius: 8px;
      padding: 14px;
    }

    .service-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .service-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .service-icon {
      width: 32px;
      height: 32px;
      background: var(--nuraly-color-background, #f8fafc);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--nuraly-color-text-secondary, #5c5c7a);
    }

    .service-icon svg {
      width: 16px;
      height: 16px;
    }

    .service-details h3 {
      font-size: 13px;
      font-weight: 500;
      color: var(--nuraly-color-text, #0f0f3c);
      margin: 0;
    }

    .service-details span {
      font-size: 11px;
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
    }

    .service-status {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .service-status.operational {
      color: var(--nuraly-color-success, #16a34a);
      background: var(--nuraly-color-success-light, #dcfce7);
    }

    .service-status.degraded {
      color: var(--nuraly-color-warning, #ca8a04);
      background: var(--nuraly-color-warning-light, #fef9c3);
    }

    .service-status.down {
      color: var(--nuraly-color-danger, #dc2626);
      background: var(--nuraly-color-danger-light, #fee2e2);
    }

    .service-status.checking {
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
      background: var(--nuraly-color-background, #f8fafc);
    }

    .last-updated {
      font-size: 11px;
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
      margin-top: 16px;
      text-align: center;
    }

    .section-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--nuraly-color-text-tertiary, #8c8ca8);
      margin: 20px 0 12px 0;
    }

    .section-title:first-of-type {
      margin-top: 0;
    }
  `;

  @state() private services: ServiceStatus[] = SERVICE_CONFIG.map(s => ({
    ...s,
    status: 'checking' as const
  }));

  @state() private lastChecked: Date | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.checkAllServices();
  }

  private async checkAllServices() {
    const checks = this.services.map(async (service) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(service.endpoint, {
          method: 'GET',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Any HTTP response (even 4xx) means gateway can reach the service
        // 5xx = service error
        if (response.status >= 500) {
          return { ...service, status: 'degraded' as const };
        }
        return { ...service, status: 'operational' as const };
      } catch {
        // Network error or timeout = service down
        return { ...service, status: 'down' as const };
      }
    });

    this.services = await Promise.all(checks);
    this.lastChecked = new Date();
  }

  private handleRefresh() {
    this.services = this.services.map(s => ({ ...s, status: 'checking' as const }));
    this.checkAllServices();
  }

  private getOverallStatus(): 'operational' | 'degraded' | 'down' | 'checking' {
    if (this.services.some(s => s.status === 'checking')) return 'checking';
    if (this.services.some(s => s.status === 'down')) return 'down';
    if (this.services.some(s => s.status === 'degraded')) return 'degraded';
    return 'operational';
  }

  private getStatusLabel(status: string): string {
    switch (status) {
      case 'operational': return 'Up';
      case 'degraded': return 'Slow';
      case 'down': return 'Down';
      case 'checking': return '...';
      default: return '?';
    }
  }

  private getOverallLabel(): string {
    const overall = this.getOverallStatus();
    switch (overall) {
      case 'operational': return 'All Systems Operational';
      case 'degraded': return 'Some Systems Degraded';
      case 'down': return 'System Outage';
      case 'checking': return 'Checking...';
      default: return 'Unknown';
    }
  }

  private getServiceIcon(id: string) {
    const icons: Record<string, ReturnType<typeof html>> = {
      api: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6M9 13h6M9 17h4"/></svg>`,
      functions: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>`,
      workflows: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a6 6 0 006 6h3"/></svg>`,
      kv: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
      conduit: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
      journal: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>`,
      textlens: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8V4h4M4 16v4h4M16 4h4v4M16 20h4v-4"/><rect x="7" y="7" width="10" height="10" rx="1"/></svg>`,
      parcour: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>`,
    };
    return icons[id] || html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`;
  }

  private getCoreServices() {
    return this.services.filter(s => ['api', 'functions', 'workflows'].includes(s.id));
  }

  private getDataServices() {
    return this.services.filter(s => ['kv', 'conduit', 'journal'].includes(s.id));
  }

  private getWorkerServices() {
    return this.services.filter(s => ['textlens', 'parcour'].includes(s.id));
  }

  private renderServiceCard(service: ServiceStatus) {
    return html`
      <div class="service-card">
        <div class="service-header">
          <div class="service-info">
            <div class="service-icon">${this.getServiceIcon(service.id)}</div>
            <div class="service-details">
              <h3>${service.name}</h3>
              <span>${service.description}</span>
            </div>
          </div>
          <div class="service-status ${service.status}">
            <span class="status-dot ${service.status === 'checking' ? 'checking' : ''}"></span>
            ${this.getStatusLabel(service.status)}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const overall = this.getOverallStatus();

    return html`
      <div class="services-header">
        <div class="overall-status ${overall}">
          <span class="status-dot ${overall === 'checking' ? 'checking' : ''}"></span>
          ${this.getOverallLabel()}
        </div>
        <nr-button type="default" size="small" iconLeft="RefreshCw" @click=${this.handleRefresh}>
          Refresh
        </nr-button>
      </div>

      <div class="section-title">Core Services</div>
      <div class="services-grid">
        ${this.getCoreServices().map(s => this.renderServiceCard(s))}
      </div>

      <div class="section-title">Data Services</div>
      <div class="services-grid">
        ${this.getDataServices().map(s => this.renderServiceCard(s))}
      </div>

      <div class="section-title">Worker Services</div>
      <div class="services-grid">
        ${this.getWorkerServices().map(s => this.renderServiceCard(s))}
      </div>

      ${this.lastChecked ? html`
        <p class="last-updated">Last checked: ${this.lastChecked.toLocaleTimeString()}</p>
      ` : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dashboard-services-status': DashboardServicesStatus;
  }
}
