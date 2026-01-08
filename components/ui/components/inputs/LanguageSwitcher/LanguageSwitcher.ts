/**
 * @fileoverview LanguageSwitcher Component
 * @module Runtime/Components/Inputs/LanguageSwitcher
 *
 * Runtime component that allows end-users to switch the application language.
 * Supports dropdown and button variants.
 *
 * @example
 * ```html
 * <language-switcher-block
 *   .component=${component}
 *   .isViewMode=${true}
 * ></language-switcher-block>
 * ```
 *
 * @input variant - 'dropdown' | 'buttons' | 'flags' (default: 'dropdown')
 * @input showLabel - Whether to show language names (default: true)
 * @input showFlag - Whether to show flag emojis (default: true)
 * @input size - 'small' | 'medium' | 'large' (default: 'medium')
 *
 * @event onLocaleChange - Fired when locale changes
 *   detail: { locale: string, previous: string, isRTL: boolean }
 */

import { css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { BaseElementBlock } from "../../base/BaseElement";
import {
  $locale,
  $supportedLocales,
  $i18nEnabled,
  setLocale,
  getLocaleName,
  getLocaleFlag,
  isRTL
} from "../../../../../state/locale.store";

@customElement("language-switcher-block")
export class LanguageSwitcherBlock extends BaseElementBlock {
  static styles = [
    css`
      :host {
        display: inline-block;
      }

      .switcher-dropdown {
        padding: 6px 12px;
        border: 1px solid var(--nr-border-color, #d9d9d9);
        border-radius: 6px;
        background: var(--nr-bg-container, #ffffff);
        font-size: 14px;
        font-family: inherit;
        cursor: pointer;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
        min-width: 120px;
      }

      .switcher-dropdown:hover {
        border-color: var(--nr-primary, #1677ff);
      }

      .switcher-dropdown:focus {
        border-color: var(--nr-primary, #1677ff);
        box-shadow: 0 0 0 2px var(--nr-primary-light, rgba(22, 119, 255, 0.1));
      }

      .switcher-dropdown.small {
        padding: 4px 8px;
        font-size: 12px;
        min-width: 100px;
      }

      .switcher-dropdown.large {
        padding: 8px 16px;
        font-size: 16px;
        min-width: 150px;
      }

      .switcher-buttons {
        display: inline-flex;
        gap: 4px;
        flex-wrap: wrap;
      }

      .locale-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 6px 12px;
        border: 1px solid var(--nr-border-color, #d9d9d9);
        border-radius: 6px;
        background: var(--nr-bg-container, #ffffff);
        font-size: 14px;
        font-family: inherit;
        cursor: pointer;
        transition: all 0.2s;
        outline: none;
      }

      .locale-btn:hover {
        border-color: var(--nr-primary, #1677ff);
        color: var(--nr-primary, #1677ff);
      }

      .locale-btn.active {
        background: var(--nr-primary, #1677ff);
        color: #ffffff;
        border-color: var(--nr-primary, #1677ff);
      }

      .locale-btn.small {
        padding: 4px 8px;
        font-size: 12px;
      }

      .locale-btn.large {
        padding: 8px 16px;
        font-size: 16px;
      }

      .flag-btn {
        padding: 6px 10px;
        min-width: auto;
      }

      .flag-btn.small {
        padding: 4px 6px;
        font-size: 14px;
      }

      .flag-btn.large {
        padding: 8px 12px;
        font-size: 20px;
      }

      .flag {
        font-size: 1.2em;
        line-height: 1;
      }

      .hidden {
        display: none;
      }
    `,
  ];

  /** Current active locale */
  @state() private currentLocale = 'en';

  /** Available locales */
  @state() private availableLocales: string[] = [];

  /** Whether i18n is enabled */
  @state() private i18nEnabled = false;

  /** Store unsubscribe functions */
  private unsubscribes: (() => void)[] = [];

  override connectedCallback() {
    super.connectedCallback();

    // Get initial values
    this.currentLocale = $locale.get();
    this.availableLocales = $supportedLocales.get();
    this.i18nEnabled = $i18nEnabled.get();

    // Subscribe to store changes
    this.unsubscribes.push(
      $locale.subscribe((locale) => {
        this.currentLocale = locale;
        this.requestUpdate();
      })
    );

    this.unsubscribes.push(
      $supportedLocales.subscribe((locales) => {
        this.availableLocales = locales;
        this.requestUpdate();
      })
    );

    this.unsubscribes.push(
      $i18nEnabled.subscribe((enabled) => {
        this.i18nEnabled = enabled;
        this.requestUpdate();
      })
    );
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribes.forEach(fn => fn());
    this.unsubscribes = [];
  }

  renderComponent() {
    // Don't render if i18n is not enabled (only one locale)
    if (!this.i18nEnabled || this.availableLocales.length <= 1) {
      return nothing;
    }

    const variant = this.resolvedInputs.variant || 'dropdown';
    const showLabel = this.resolvedInputs.showLabel !== false;
    const showFlag = this.resolvedInputs.showFlag !== false;
    const size = this.resolvedInputs.size || 'medium';

    switch (variant) {
      case 'buttons':
        return this.renderButtons(showLabel, showFlag, size);
      case 'flags':
        return this.renderFlags(size);
      default:
        return this.renderDropdown(showLabel, showFlag, size);
    }
  }

  /**
   * Render dropdown variant
   */
  private renderDropdown(showLabel: boolean, showFlag: boolean, size: string) {
    return html`
      <select
        class="switcher-dropdown ${size}"
        .value=${this.currentLocale}
        @change=${this.handleDropdownChange}
        style=${styleMap(this.getStyles())}
      >
        ${this.availableLocales.map(locale => html`
          <option value=${locale} ?selected=${locale === this.currentLocale}>
            ${showFlag ? getLocaleFlag(locale) + ' ' : ''}${showLabel ? getLocaleName(locale) : locale.toUpperCase()}
          </option>
        `)}
      </select>
    `;
  }

  /**
   * Render buttons variant
   */
  private renderButtons(showLabel: boolean, showFlag: boolean, size: string) {
    return html`
      <div class="switcher-buttons" style=${styleMap(this.getStyles())}>
        ${this.availableLocales.map(locale => html`
          <button
            class="locale-btn ${size} ${locale === this.currentLocale ? 'active' : ''}"
            @click=${() => this.switchLocale(locale)}
            title=${getLocaleName(locale)}
          >
            ${showFlag ? html`<span class="flag">${getLocaleFlag(locale)}</span>` : ''}
            ${showLabel ? getLocaleName(locale) : locale.toUpperCase()}
          </button>
        `)}
      </div>
    `;
  }

  /**
   * Render flags-only variant
   */
  private renderFlags(size: string) {
    return html`
      <div class="switcher-buttons" style=${styleMap(this.getStyles())}>
        ${this.availableLocales.map(locale => html`
          <button
            class="locale-btn flag-btn ${size} ${locale === this.currentLocale ? 'active' : ''}"
            @click=${() => this.switchLocale(locale)}
            title=${getLocaleName(locale)}
            aria-label=${getLocaleName(locale)}
          >
            <span class="flag">${getLocaleFlag(locale)}</span>
          </button>
        `)}
      </div>
    `;
  }

  /**
   * Handle dropdown change event
   */
  private handleDropdownChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    this.switchLocale(select.value);
  }

  /**
   * Switch to a new locale
   */
  private switchLocale(locale: string) {
    const previous = this.currentLocale;

    // Only proceed if locale is different
    if (locale === previous) return;

    // Set the new locale
    if (setLocale(locale)) {
      // Fire event for handlers
      this.executeEvent('onLocaleChange', null, {
        locale,
        previous,
        isRTL: isRTL(locale)
      });
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'language-switcher-block': LanguageSwitcherBlock;
  }
}

export default LanguageSwitcherBlock;
