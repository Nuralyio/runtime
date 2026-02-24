/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { ChatbotPlugin } from '../core/types.js';
import { ChatPluginBase } from './chat-plugin.js';

/**
 * Print job data interface
 */
export interface PrintJobData {
  jobId: string;
  documentName: string;
  printerName: string;
  status: 'queued' | 'printing' | 'completed' | 'paused' | 'error' | 'cancelled';
  pagesPrinted?: number;
  totalPages: number;
  copies?: number;
  userName?: string;
  submittedAt: string;
  completedAt?: string;
  priority?: 'low' | 'normal' | 'high';
  colorMode?: 'color' | 'grayscale';
  paperSize?: string;
  estimatedTime?: string;
  errorMessage?: string;
}

/**
 * Print Job Card Plugin - transforms print job status into visual cards
 * 
 * This plugin detects print job information in messages and renders them as styled status cards.
 * 
 * @example Basic usage
 * ```typescript
 * const printJobPlugin = new PrintJobCardPlugin();
 * controller.registerPlugin(printJobPlugin);
 * ```
 * 
 * @example JSON format in message
 * ```json
 * {
 *   "jobId": "PRT-2024-1234",
 *   "documentName": "Q4_Financial_Report.pdf",
 *   "printerName": "HP LaserJet Pro MFP M428",
 *   "status": "printing",
 *   "pagesPrinted": 15,
 *   "totalPages": 45,
 *   "copies": 3,
 *   "userName": "John Doe",
 *   "submittedAt": "2024-10-28T14:30:00Z",
 *   "priority": "high",
 *   "colorMode": "color",
 *   "paperSize": "A4",
 *   "estimatedTime": "5 min"
 * }
 * ```
 */
export class PrintJobCardPlugin extends ChatPluginBase implements ChatbotPlugin {
  readonly id = 'print-job-card';
  readonly name = 'Print Job Card Plugin';
  readonly version = '1.0.0';
  override readonly htmlTags = [
    { name: 'printjob', open: '[PRINTJOB]', close: '[/PRINTJOB]' }
  ];

  protected cssPrefix = 'nr-print-job-card';

  /**
   * Render a skeleton placeholder while the print job data is loading
   */
  renderHtmlBlockPlaceholder?(name: string): string {
    if (name.toLowerCase() !== 'printjob') return '';
    
    const placeholderId = `printjob-skeleton-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return `<div data-placeholder-id="${placeholderId}"><nr-skeleton 
        active 
        avatar
        paragraph='{"rows":3}'
        style="min-width: 350px; max-width: 500px; margin: 8px 0;"
      ></nr-skeleton></div>`;
  }

  override onInit(): void {
    console.log('[PrintJobCardPlugin] Initialized');
  }

  /**
   * Render a completed [PRINTJOB]...[/PRINTJOB] block
   */
  override renderHtmlBlock(name: string, content: string): string {
    if (name.toLowerCase() !== 'printjob') return '';
    try {
      const data = JSON.parse(content);
      return this.renderPrintJobCard(data as PrintJobData);
    } catch (e) {
      console.warn('[PrintJobCardPlugin] renderHtmlBlock parse error:', e);
      return '';
    }
  }

  /**
   * Render the complete print job card
   */
  protected renderPrintJobCard(data: PrintJobData): string {
    const statusIcon = this.getStatusIcon(data.status);
    const progress = data.pagesPrinted && data.totalPages 
      ? Math.round((data.pagesPrinted / data.totalPages) * 100)
      : 0;

    const styleTag = this.getOncePerConversationStyleTag(this.getStyles());
    
    return `
      ${styleTag}
      <div class="${this.cssPrefix}" data-nr-print-job-card="true">
        <div class="${this.cssPrefix}__header">
          <div class="${this.cssPrefix}__printer-icon">
            🖨️
          </div>
          <div class="${this.cssPrefix}__header-content">
            <div class="${this.cssPrefix}__title">${this.escapeHtml(data.documentName)}</div>
            <div class="${this.cssPrefix}__subtitle">${this.escapeHtml(data.printerName)}</div>
          </div>
          <div class="${this.cssPrefix}__job-id">#${this.escapeHtml(data.jobId)}</div>
        </div>

        <div class="${this.cssPrefix}__status-row">
          <span class="${this.cssPrefix}__status-badge ${this.cssPrefix}__status-badge--${data.status}">
            ${statusIcon} ${this.formatStatus(data.status)}
          </span>
          ${data.priority && data.priority !== 'normal' ? `
            <span class="${this.cssPrefix}__priority-badge ${this.cssPrefix}__priority-badge--${data.priority}">
              ${data.priority === 'high' ? '⚡' : '🔽'} ${this.capitalize(data.priority)} Priority
            </span>
          ` : ''}
        </div>

        ${data.status === 'printing' && data.pagesPrinted && data.totalPages ? `
          <div class="${this.cssPrefix}__progress">
            <div class="${this.cssPrefix}__progress-bar">
              <div class="${this.cssPrefix}__progress-fill" style="width: ${progress}%"></div>
            </div>
            <div class="${this.cssPrefix}__progress-text">
              ${data.pagesPrinted} / ${data.totalPages} pages (${progress}%)
            </div>
          </div>
        ` : ''}

        ${data.status === 'error' && data.errorMessage ? `
          <div class="${this.cssPrefix}__error-message">
            ⚠️ ${this.escapeHtml(data.errorMessage)}
          </div>
        ` : ''}

        <div class="${this.cssPrefix}__details">
          <div class="${this.cssPrefix}__detail-row">
            <span class="${this.cssPrefix}__detail-label">Pages:</span>
            <span class="${this.cssPrefix}__detail-value">${data.totalPages}</span>
          </div>
          ${data.copies && data.copies > 1 ? `
            <div class="${this.cssPrefix}__detail-row">
              <span class="${this.cssPrefix}__detail-label">Copies:</span>
              <span class="${this.cssPrefix}__detail-value">${data.copies}</span>
            </div>
          ` : ''}
          ${data.colorMode ? `
            <div class="${this.cssPrefix}__detail-row">
              <span class="${this.cssPrefix}__detail-label">Color Mode:</span>
              <span class="${this.cssPrefix}__detail-value">${this.capitalize(data.colorMode)}</span>
            </div>
          ` : ''}
          ${data.paperSize ? `
            <div class="${this.cssPrefix}__detail-row">
              <span class="${this.cssPrefix}__detail-label">Paper Size:</span>
              <span class="${this.cssPrefix}__detail-value">${data.paperSize}</span>
            </div>
          ` : ''}
          ${data.userName ? `
            <div class="${this.cssPrefix}__detail-row">
              <span class="${this.cssPrefix}__detail-label">User:</span>
              <span class="${this.cssPrefix}__detail-value">${this.escapeHtml(data.userName)}</span>
            </div>
          ` : ''}
          ${data.estimatedTime && data.status === 'printing' ? `
            <div class="${this.cssPrefix}__detail-row">
              <span class="${this.cssPrefix}__detail-label">Est. Time:</span>
              <span class="${this.cssPrefix}__detail-value">${data.estimatedTime}</span>
            </div>
          ` : ''}
        </div>

        <div class="${this.cssPrefix}__footer">
          <span class="${this.cssPrefix}__timestamp">
            📅 Submitted: ${this.formatTimestamp(data.submittedAt)}
          </span>
          ${data.completedAt ? `
            <span class="${this.cssPrefix}__timestamp">
              ✅ Completed: ${this.formatTimestamp(data.completedAt)}
            </span>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Get status color for styling
   */
  protected getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'queued': '#ffa726',
      'printing': '#42a5f5',
      'completed': '#66bb6a',
      'paused': '#ffb74d',
      'error': '#ef5350',
      'cancelled': '#78909c'
    };
    return colors[status] || '#999';
  }

  /**
   * Get status icon
   */
  protected getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'queued': '⏳',
      'printing': '🔄',
      'completed': '✅',
      'paused': '⏸️',
      'error': '❌',
      'cancelled': '🚫'
    };
    return icons[status] || '📄';
  }

  /**
   * Format status text
   */
  protected formatStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  /**
   * Capitalize first letter
   */
  protected capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /**
   * Format timestamp
   */
  protected formatTimestamp(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timestamp;
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  protected escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get styles for the print job card
   */
  protected getStyles(): string {
    return `
      .${this.cssPrefix} {
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        padding: 20px;
        margin: 12px 0;
        font-family: system-ui, -apple-system, sans-serif;
        max-width: 500px;
        border-left: 4px solid #42a5f5;
      }

      .${this.cssPrefix}__header {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 16px;
      }

      .${this.cssPrefix}__printer-icon {
        font-size: 32px;
        line-height: 1;
        flex-shrink: 0;
      }

      .${this.cssPrefix}__header-content {
        flex: 1;
        min-width: 0;
      }

      .${this.cssPrefix}__title {
        font-size: 16px;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 4px;
        word-break: break-word;
      }

      .${this.cssPrefix}__subtitle {
        font-size: 13px;
        color: #666;
      }

      .${this.cssPrefix}__job-id {
        font-size: 12px;
        color: #999;
        font-family: 'Monaco', 'Courier New', monospace;
        background: #f5f5f5;
        padding: 4px 8px;
        border-radius: 4px;
        flex-shrink: 0;
      }

      .${this.cssPrefix}__status-row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 16px;
      }

      .${this.cssPrefix}__status-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
      }

      .${this.cssPrefix}__status-badge--queued {
        background: #fff3e0;
        color: #e65100;
      }

      .${this.cssPrefix}__status-badge--printing {
        background: #e3f2fd;
        color: #0d47a1;
      }

      .${this.cssPrefix}__status-badge--completed {
        background: #e8f5e9;
        color: #1b5e20;
      }

      .${this.cssPrefix}__status-badge--paused {
        background: #fff3e0;
        color: #e65100;
      }

      .${this.cssPrefix}__status-badge--error {
        background: #ffebee;
        color: #b71c1c;
      }

      .${this.cssPrefix}__status-badge--cancelled {
        background: #f5f5f5;
        color: #616161;
      }

      .${this.cssPrefix}__priority-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
      }

      .${this.cssPrefix}__priority-badge--high {
        background: #fff3e0;
        color: #e65100;
      }

      .${this.cssPrefix}__priority-badge--low {
        background: #f5f5f5;
        color: #666;
      }

      .${this.cssPrefix}__progress {
        margin-bottom: 16px;
      }

      .${this.cssPrefix}__progress-bar {
        width: 100%;
        height: 8px;
        background: #e0e0e0;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 8px;
      }

      .${this.cssPrefix}__progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #42a5f5 0%, #1976d2 100%);
        transition: width 0.3s ease;
        border-radius: 4px;
      }

      .${this.cssPrefix}__progress-text {
        font-size: 13px;
        color: #666;
        text-align: center;
      }

      .${this.cssPrefix}__error-message {
        background: #ffebee;
        border-left: 3px solid #ef5350;
        padding: 12px;
        margin-bottom: 16px;
        border-radius: 4px;
        font-size: 13px;
        color: #b71c1c;
      }

      .${this.cssPrefix}__details {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-bottom: 16px;
        padding: 16px;
        background: #f9f9f9;
        border-radius: 8px;
      }

      .${this.cssPrefix}__detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }

      .${this.cssPrefix}__detail-label {
        font-size: 12px;
        color: #666;
      }

      .${this.cssPrefix}__detail-value {
        font-size: 13px;
        font-weight: 600;
        color: #1a1a1a;
      }

      .${this.cssPrefix}__footer {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding-top: 12px;
        border-top: 1px solid #e0e0e0;
      }

      .${this.cssPrefix}__timestamp {
        font-size: 11px;
        color: #999;
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .${this.cssPrefix} {
          background: #2a2a2a;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          border-left-color: #42a5f5;
        }

        .${this.cssPrefix}__title,
        .${this.cssPrefix}__detail-value {
          color: #ffffff;
        }

        .${this.cssPrefix}__subtitle,
        .${this.cssPrefix}__detail-label {
          color: #b0b0b0;
        }

        .${this.cssPrefix}__job-id {
          background: #3a3a3a;
          color: #b0b0b0;
        }

        .${this.cssPrefix}__details {
          background: #333;
        }

        .${this.cssPrefix}__progress-bar {
          background: #444;
        }

        .${this.cssPrefix}__footer {
          border-top-color: #444;
        }
      }

      /* Responsive design */
      @media (max-width: 480px) {
        .${this.cssPrefix} {
          padding: 16px;
        }

        .${this.cssPrefix}__details {
          grid-template-columns: 1fr;
        }

        .${this.cssPrefix}__header {
          flex-wrap: wrap;
        }

        .${this.cssPrefix}__job-id {
          order: -1;
          width: 100%;
        }
      }
    `;
  }
}
