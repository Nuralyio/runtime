/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { ChatbotPlugin } from '../core/types.js';
import { ChatPluginBase } from './chat-plugin.js';

/**
 * A single selectable option within a selection choice card.
 */
export interface SelectionChoiceOption {
  /** Display text */
  label: string;
  /** Value sent as message on click */
  value: string;
  /** Optional subtitle */
  description?: string;
  /** Optional icon name (for nr-icon) */
  icon?: string;
  /** Greyed out, non-clickable */
  disabled?: boolean;
}

/**
 * Data structure for a selection choice card.
 */
export interface SelectionChoiceData {
  /** Optional type marker */
  type?: 'selection';
  /** Optional heading above the cards */
  title?: string;
  /** The selectable options */
  options: SelectionChoiceOption[];
  /** Grid columns (default 1) */
  columns?: 1 | 2 | 3;
}

/**
 * Selection Card Plugin — renders clickable option cards inside bot messages.
 *
 * When the user clicks a card, the option's value is sent as a user message
 * (like quick replies in messaging apps).
 *
 * @example Basic usage
 * ```typescript
 * const selectionPlugin = new SelectionCardPlugin();
 * controller.registerPlugin(selectionPlugin);
 * ```
 *
 * @example JSON format in message
 * ```json
 * {
 *   "type": "selection",
 *   "title": "What would you like to do?",
 *   "options": [
 *     { "label": "Check Order", "value": "check_order" },
 *     { "label": "Contact Support", "value": "contact_support" }
 *   ],
 *   "columns": 2
 * }
 * ```
 *
 * @example Markup format in message
 * ```
 * [SELECTION]{ "title": "Pick one", "options": [...] }[/SELECTION]
 * ```
 */
export class SelectionCardPlugin extends ChatPluginBase implements ChatbotPlugin {
  readonly id = 'selection-card';
  readonly name = 'Selection Card Plugin';
  readonly version = '1.0.0';
  override readonly htmlTags = [
    { name: 'selection', open: '[SELECTION]', close: '[/SELECTION]' }
  ];

  /**
   * CSS class prefix for styling
   */
  protected cssPrefix = 'nr-selection-card';

  /**
   * Render a skeleton placeholder while the selection data is streaming
   */
  renderHtmlBlockPlaceholder?(name: string): string {
    if (name.toLowerCase() !== 'selection') return '';

    const placeholderId = `selection-skeleton-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return `<div data-placeholder-id="${placeholderId}"><nr-skeleton
        active
        style="min-width: 300px; max-width: 500px; height: 80px; margin: 16px 0;"
      ></nr-skeleton></div>`;
  }

  override onInit(): void {
    console.log('[SelectionCardPlugin] Initialized');
  }

  /**
   * Process received messages and convert selection data to cards
   */
  override async afterReceive(text: string): Promise<string> {
    // Try to parse as JSON first (for structured selection data)
    try {
      const data = JSON.parse(text);
      if (data.type === 'selection' || this.isSelectionData(data)) {
        return this.renderSelectionCard(data as SelectionChoiceData);
      }
    } catch {
      // Not JSON, continue with text processing
    }

    // Look for selection data markers in text
    const selectionPattern = /\[SELECTION\]([\s\S]*?)\[\/SELECTION\]/g;
    let transformed = text;

    let match;
    while ((match = selectionPattern.exec(text)) !== null) {
      try {
        const selectionData = JSON.parse(match[1]);
        const card = this.renderSelectionCard(selectionData);
        transformed = transformed.replace(match[0], card);
      } catch (e) {
        console.warn('[SelectionCardPlugin] Failed to parse selection data:', e);
      }
    }

    return transformed;
  }

  /**
   * Render a completed [SELECTION]...[/SELECTION] block when tokenized by the Provider/Service
   */
  override renderHtmlBlock(name: string, content: string): string {
    if (name.toLowerCase() !== 'selection') return '';
    try {
      const data = JSON.parse(content);
      return this.renderSelectionCard(data as SelectionChoiceData);
    } catch (e) {
      console.warn('[SelectionCardPlugin] renderHtmlBlock parse error:', e);
      return '';
    }
  }

  /**
   * Check if data object contains selection information
   */
  protected isSelectionData(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      Array.isArray(data.options) &&
      data.options.length > 0 &&
      data.options[0].label &&
      data.options[0].value
    );
  }

  /**
   * Render selection choice card HTML.
   * Override this method to customize the card appearance.
   */
  protected renderSelectionCard(data: SelectionChoiceData): string {
    const { title, options, columns = 1 } = data;

    const styleTag = this.getOncePerConversationStyleTag(this.getStyles());

    const optionsHtml = options.map(option => {
      const disabledAttr = option.disabled ? 'aria-disabled="true"' : '';
      const disabledClass = option.disabled ? `${this.cssPrefix}__option--disabled` : '';
      const tabIndex = option.disabled ? '-1' : '0';
      const dataAttr = option.disabled ? '' : `data-selection-value="${this.escapeHtml(option.value)}"`;

      return `
        <div class="${this.cssPrefix}__option ${disabledClass}"
             ${dataAttr}
             role="button"
             tabindex="${tabIndex}"
             ${disabledAttr}>
          ${option.icon ? `<nr-icon class="${this.cssPrefix}__option-icon" name="${this.escapeHtml(option.icon)}" size="small"></nr-icon>` : ''}
          <div class="${this.cssPrefix}__option-content">
            <span class="${this.cssPrefix}__option-label">${this.escapeHtml(option.label)}</span>
            ${option.description ? `<span class="${this.cssPrefix}__option-description">${this.escapeHtml(option.description)}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');

    return `
      ${styleTag}
      <div class="${this.cssPrefix}" data-nr-selection-card="true">
        ${title ? `<div class="${this.cssPrefix}__title">${this.escapeHtml(title)}</div>` : ''}
        <div class="${this.cssPrefix}__grid ${this.cssPrefix}__grid--cols-${columns}">
          ${optionsHtml}
        </div>
      </div>
    `;
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
   * Default styles for the selection card.
   * Override this method to provide custom styles.
   */
  protected getStyles(): string {
    return `
      .${this.cssPrefix} {
        margin: 12px 0;
        max-width: 500px;
        font-family: system-ui, -apple-system, sans-serif;
      }

      .${this.cssPrefix}__title {
        font-size: 14px;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 10px;
      }

      .${this.cssPrefix}__grid {
        display: grid;
        gap: 8px;
      }

      .${this.cssPrefix}__grid--cols-1 {
        grid-template-columns: 1fr;
      }

      .${this.cssPrefix}__grid--cols-2 {
        grid-template-columns: 1fr 1fr;
      }

      .${this.cssPrefix}__grid--cols-3 {
        grid-template-columns: 1fr 1fr 1fr;
      }

      .${this.cssPrefix}__option {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        background: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.15s ease;
        user-select: none;
        -webkit-user-select: none;
      }

      .${this.cssPrefix}__option:hover {
        border-color: #4f8cff;
        background: #f0f6ff;
        box-shadow: 0 1px 4px rgba(79, 140, 255, 0.12);
      }

      .${this.cssPrefix}__option:focus-visible {
        outline: 2px solid #4f8cff;
        outline-offset: 2px;
      }

      .${this.cssPrefix}__option:active:not([aria-disabled="true"]) {
        transform: scale(0.98);
        background: #dfeaff;
      }

      .${this.cssPrefix}__option--disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      .${this.cssPrefix}__option-icon {
        flex-shrink: 0;
        color: #555;
      }

      .${this.cssPrefix}__option-content {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }

      .${this.cssPrefix}__option-label {
        font-size: 14px;
        font-weight: 500;
        color: #1a1a1a;
        line-height: 1.3;
      }

      .${this.cssPrefix}__option-description {
        font-size: 12px;
        color: #666;
        line-height: 1.3;
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .${this.cssPrefix}__title {
          color: #ffffff;
        }

        .${this.cssPrefix}__option {
          background: #2a2a2a;
          border-color: #444;
        }

        .${this.cssPrefix}__option:hover {
          border-color: #5a9aff;
          background: #1e2d44;
          box-shadow: 0 1px 4px rgba(90, 154, 255, 0.15);
        }

        .${this.cssPrefix}__option:active:not([aria-disabled="true"]) {
          background: #1a2638;
        }

        .${this.cssPrefix}__option-icon {
          color: #aaa;
        }

        .${this.cssPrefix}__option-label {
          color: #ffffff;
        }

        .${this.cssPrefix}__option-description {
          color: #999;
        }
      }

      /* Responsive: force single column on mobile */
      @media (max-width: 480px) {
        .${this.cssPrefix}__grid--cols-2,
        .${this.cssPrefix}__grid--cols-3 {
          grid-template-columns: 1fr;
        }
      }
    `;
  }
}
