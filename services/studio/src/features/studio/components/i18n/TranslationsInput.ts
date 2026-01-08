/**
 * @fileoverview TranslationsInput Component
 * @module Studio/Components/i18n/TranslationsInput
 *
 * Studio UI component for editing translations of a single property.
 * Displays the default value (read-only) and editable inputs for other locales.
 *
 * @example
 * ```html
 * <translations-input
 *   .propertyName=${'value'}
 *   .defaultValue=${'Hello World'}
 *   .translations=${{ fr: 'Bonjour le monde', ar: 'مرحبا بالعالم' }}
 *   @translations-changed=${handleChange}
 * ></translations-input>
 * ```
 */

import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  $supportedLocales,
  $defaultLocale,
  getLocaleName,
  getLocaleFlag,
  isRTL
} from '../../../runtime/state/locale.store';

/**
 * Event detail for translations-changed event
 */
export interface TranslationsChangedEventDetail {
  propertyName: string;
  translations: Record<string, string>;
}

/**
 * TranslationsInput Component
 *
 * Displays translation inputs for a single property.
 * Shows the default value (read-only reference) and editable inputs for other locales.
 *
 * @fires translations-changed - When translations are updated
 */
@customElement('translations-input')
export class TranslationsInput extends LitElement {
  static styles = css`
    :host {
      display: block;
      margin-top: 8px;
    }

    .translations-container {
      border: 1px solid var(--nr-border-color, #e0e0e0);
      border-radius: 4px;
      overflow: hidden;
      font-family: var(--nr-font-family, system-ui, sans-serif);
    }

    .translations-header {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      background: var(--nr-bg-subtle, #f5f5f5);
      border-bottom: 1px solid var(--nr-border-color, #e0e0e0);
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      user-select: none;
    }

    .translations-header:hover {
      background: var(--nr-bg-hover, #eeeeee);
    }

    .header-icon {
      font-size: 14px;
    }

    .header-title {
      flex: 1;
    }

    .status-summary {
      font-size: 11px;
      color: var(--nr-text-secondary, #888);
      padding: 2px 6px;
      background: var(--nr-bg-muted, #e8e8e8);
      border-radius: 10px;
    }

    .status-summary.complete {
      background: var(--nr-success-light, #e8f5e9);
      color: var(--nr-success, #4caf50);
    }

    .status-summary.partial {
      background: var(--nr-warning-light, #fff3e0);
      color: var(--nr-warning, #ff9800);
    }

    .expand-icon {
      font-size: 10px;
      transition: transform 0.2s;
    }

    .expand-icon.expanded {
      transform: rotate(180deg);
    }

    .translations-body {
      display: none;
    }

    .translations-body.expanded {
      display: block;
    }

    .translation-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-bottom: 1px solid var(--nr-border-color-light, #f0f0f0);
    }

    .translation-row:last-child {
      border-bottom: none;
    }

    .locale-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 36px;
      padding: 2px 6px;
      background: var(--nr-badge-bg, #e8e8e8);
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .locale-badge.default {
      background: var(--nr-primary-light, #e3f2fd);
      color: var(--nr-primary, #1976d2);
    }

    .locale-badge.rtl {
      background: var(--nr-warning-light, #fff3e0);
      color: var(--nr-warning, #f57c00);
    }

    .locale-flag {
      margin-right: 4px;
    }

    .translation-input {
      flex: 1;
      padding: 6px 10px;
      border: 1px solid var(--nr-border-color, #e0e0e0);
      border-radius: 4px;
      font-size: 13px;
      font-family: inherit;
      background: white;
    }

    .translation-input:focus {
      outline: none;
      border-color: var(--nr-primary, #1976d2);
      box-shadow: 0 0 0 2px var(--nr-primary-light, #e3f2fd);
    }

    .translation-input.rtl {
      direction: rtl;
      text-align: right;
    }

    .translation-input::placeholder {
      color: var(--nr-text-tertiary, #aaa);
    }

    .default-value {
      flex: 1;
      padding: 6px 10px;
      background: var(--nr-bg-subtle, #f9f9f9);
      border: 1px solid transparent;
      border-radius: 4px;
      font-size: 13px;
      color: var(--nr-text-secondary, #666);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .default-tag {
      font-size: 10px;
      color: var(--nr-text-tertiary, #999);
      padding: 2px 6px;
      background: var(--nr-bg-muted, #f0f0f0);
      border-radius: 4px;
    }

    .status-icon {
      font-size: 14px;
      width: 20px;
      text-align: center;
    }

    .status-icon.complete {
      color: var(--nr-success, #4caf50);
    }

    .status-icon.missing {
      color: var(--nr-warning, #ff9800);
    }

    .actions {
      display: flex;
      gap: 8px;
      padding: 8px 12px;
      background: var(--nr-bg-subtle, #f9f9f9);
      border-top: 1px solid var(--nr-border-color-light, #f0f0f0);
    }

    .action-btn {
      padding: 4px 10px;
      border: 1px solid var(--nr-border-color, #e0e0e0);
      border-radius: 4px;
      background: white;
      font-size: 11px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: background 0.2s;
    }

    .action-btn:hover {
      background: var(--nr-bg-hover, #f5f5f5);
    }

    .action-btn:active {
      background: var(--nr-bg-active, #e8e8e8);
    }

    .no-locales {
      padding: 12px;
      text-align: center;
      color: var(--nr-text-secondary, #888);
      font-size: 12px;
    }
  `;

  /** Property name being translated */
  @property({ type: String }) propertyName = '';

  /** Default/original value (from default locale) */
  @property({ type: String }) defaultValue = '';

  /** Current translations { locale: value } */
  @property({ type: Object }) translations: Record<string, string> = {};

  /** Whether the panel is expanded */
  @state() private expanded = false;

  /** Supported locales from app config */
  @state() private locales: string[] = [];

  /** Default locale from app config */
  @state() private defaultLocale = 'en';

  /** Store unsubscribe functions */
  private unsubscribes: (() => void)[] = [];

  connectedCallback() {
    super.connectedCallback();

    // Get initial values
    this.locales = $supportedLocales.get();
    this.defaultLocale = $defaultLocale.get();

    // Subscribe to store changes
    this.unsubscribes.push(
      $supportedLocales.subscribe((locales) => {
        this.locales = locales;
        this.requestUpdate();
      })
    );

    this.unsubscribes.push(
      $defaultLocale.subscribe((locale) => {
        this.defaultLocale = locale;
        this.requestUpdate();
      })
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribes.forEach(fn => fn());
    this.unsubscribes = [];
  }

  render() {
    // Get locales other than default
    const otherLocales = this.locales.filter(l => l !== this.defaultLocale);

    // Don't render if no other locales configured
    if (otherLocales.length === 0) {
      return nothing;
    }

    // Calculate translation status
    const translatedCount = otherLocales.filter(locale =>
      this.translations[locale] !== undefined && this.translations[locale] !== ''
    ).length;

    const isComplete = translatedCount === otherLocales.length;
    const isPartial = translatedCount > 0 && !isComplete;

    return html`
      <div class="translations-container">
        <!-- Header (clickable to expand/collapse) -->
        <div
          class="translations-header"
          @click=${this.toggleExpanded}
        >
          <span class="header-icon">🌐</span>
          <span class="header-title">Translations</span>
          <span class="status-summary ${isComplete ? 'complete' : isPartial ? 'partial' : ''}">
            ${translatedCount}/${otherLocales.length}
          </span>
          <span class="expand-icon ${this.expanded ? 'expanded' : ''}">▼</span>
        </div>

        <!-- Body (expandable) -->
        <div class="translations-body ${this.expanded ? 'expanded' : ''}">
          <!-- Default locale (read-only reference) -->
          <div class="translation-row">
            <span class="locale-badge default">
              <span class="locale-flag">${getLocaleFlag(this.defaultLocale)}</span>
              ${this.defaultLocale}
            </span>
            <div class="default-value" title=${this.defaultValue || '(empty)'}>
              ${this.defaultValue || '(empty)'}
            </div>
            <span class="default-tag">Default</span>
          </div>

          <!-- Other locales (editable) -->
          ${otherLocales.map(locale => this.renderTranslationRow(locale))}

          <!-- Actions -->
          <div class="actions">
            <button class="action-btn" @click=${this.copyToAll} title="Copy default value to all languages">
              <span>📋</span> Copy to all
            </button>
            <button class="action-btn" @click=${this.clearAll} title="Clear all translations">
              <span>🗑️</span> Clear
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render a single translation row for a locale
   */
  private renderTranslationRow(locale: string) {
    const localeIsRTL = isRTL(locale);
    const value = this.translations[locale] || '';
    const hasValue = value !== '';

    return html`
      <div class="translation-row">
        <span class="locale-badge ${localeIsRTL ? 'rtl' : ''}">
          <span class="locale-flag">${getLocaleFlag(locale)}</span>
          ${locale}
        </span>
        <input
          type="text"
          class="translation-input ${localeIsRTL ? 'rtl' : ''}"
          .value=${value}
          placeholder="Enter ${getLocaleName(locale)} translation..."
          @input=${(e: InputEvent) => this.handleInput(locale, e)}
          @change=${(e: Event) => this.handleChange(locale, e)}
        />
        <span class="status-icon ${hasValue ? 'complete' : 'missing'}">
          ${hasValue ? '✓' : '⚠'}
        </span>
      </div>
    `;
  }

  /**
   * Toggle expanded state
   */
  private toggleExpanded() {
    this.expanded = !this.expanded;
  }

  /**
   * Handle input event (real-time updates)
   */
  private handleInput(locale: string, e: InputEvent) {
    const input = e.target as HTMLInputElement;
    this.updateTranslation(locale, input.value);
  }

  /**
   * Handle change event (on blur/enter)
   */
  private handleChange(locale: string, e: Event) {
    const input = e.target as HTMLInputElement;
    this.updateTranslation(locale, input.value);
  }

  /**
   * Update a single translation
   */
  private updateTranslation(locale: string, value: string) {
    const newTranslations = { ...this.translations };

    if (value && value.trim() !== '') {
      newTranslations[locale] = value;
    } else {
      delete newTranslations[locale];
    }

    this.emitTranslationsChanged(newTranslations);
  }

  /**
   * Copy default value to all other locales
   */
  private copyToAll() {
    const otherLocales = this.locales.filter(l => l !== this.defaultLocale);
    const newTranslations: Record<string, string> = {};

    otherLocales.forEach(locale => {
      newTranslations[locale] = this.defaultValue;
    });

    this.emitTranslationsChanged(newTranslations);
  }

  /**
   * Clear all translations
   */
  private clearAll() {
    this.emitTranslationsChanged({});
  }

  /**
   * Emit translations-changed event
   */
  private emitTranslationsChanged(translations: Record<string, string>) {
    this.dispatchEvent(new CustomEvent<TranslationsChangedEventDetail>('translations-changed', {
      detail: {
        propertyName: this.propertyName,
        translations
      },
      bubbles: true,
      composed: true
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'translations-input': TranslationsInput;
  }
}

export default TranslationsInput;
