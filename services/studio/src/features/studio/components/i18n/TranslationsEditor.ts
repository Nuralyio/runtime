/**
 * @fileoverview TranslationsEditor Component
 * @module Studio/Components/i18n/TranslationsEditor
 *
 * Studio UI component for editing all translations of a component.
 * Dynamically renders TranslationsInput for each translatable property.
 */

import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { updateComponentTranslations } from '../../../runtime/redux/store/component/store';
import {
  $supportedLocales,
  $defaultLocale,
  $i18nEnabled
} from '../../../runtime/state/locale.store';
import { eventDispatcher } from '../../../runtime/utils/change-detection';
import Editor from '../../../runtime/state/editor';
import { getTranslatablePropertyInfo } from '../../utils/translatable-properties';
import './TranslationsInput';

/**
 * TranslationsEditor Component
 *
 * Renders translation inputs for all translatable properties of the selected component.
 */
@customElement('translations-editor')
export class TranslationsEditor extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .translations-editor {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .property-section {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .property-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--nuraly-color-text-secondary, #666);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .no-translations {
      padding: 16px;
      text-align: center;
      color: var(--nuraly-color-text-secondary, #888);
      font-size: 12px;
      background: var(--nuraly-color-background-secondary, #f5f5f5);
      border-radius: 6px;
    }

    .no-translations-icon {
      font-size: 24px;
      margin-bottom: 8px;
      display: block;
    }

    .i18n-disabled {
      padding: 12px;
      text-align: center;
      background: var(--nuraly-color-warning-light, #fff3e0);
      border-radius: 6px;
      font-size: 12px;
      color: var(--nuraly-color-warning-dark, #e65100);
    }

    .i18n-disabled a {
      color: inherit;
      text-decoration: underline;
      cursor: pointer;
    }
  `;

  /** Component UUID to edit translations for */
  @property({ type: String }) componentUuid: string | null = null;

  /** Selected component data */
  @state() private component: any = null;

  /** i18n enabled state */
  @state() private i18nEnabled = false;

  /** Supported locales */
  @state() private supportedLocales: string[] = [];

  /** Default locale */
  @state() private defaultLocale = 'en';

  /** Store unsubscribe functions */
  private unsubscribes: (() => void)[] = [];

  connectedCallback() {
    super.connectedCallback();

    // Get initial selected component from Editor
    this.updateSelectedComponent();

    // Listen for component selection changes
    const selectionHandler = () => {
      this.updateSelectedComponent();
    };
    eventDispatcher.on('component:refresh', selectionHandler);
    eventDispatcher.on('component:updated', selectionHandler);
    this.unsubscribes.push(() => {
      eventDispatcher.off('component:refresh', selectionHandler);
      eventDispatcher.off('component:updated', selectionHandler);
    });

    // Subscribe to i18n stores
    this.unsubscribes.push(
      $i18nEnabled.subscribe((enabled) => {
        this.i18nEnabled = enabled;
        this.requestUpdate();
      })
    );

    this.unsubscribes.push(
      $supportedLocales.subscribe((locales) => {
        this.supportedLocales = locales;
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

  /**
   * Update component from Editor.selectedComponents
   */
  private updateSelectedComponent() {
    const selectedComponents = Editor.selectedComponents || [];
    const first = Array.isArray(selectedComponents) ? selectedComponents[0] : selectedComponents;
    this.component = first || null;
    this.requestUpdate();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribes.forEach(fn => fn());
    this.unsubscribes = [];
  }

  render() {
    // Check if i18n is enabled
    if (!this.i18nEnabled) {
      return html`
        <div class="i18n-disabled">
          Multi-language support is not enabled for this app.
          <br/>
          Enable it in App Settings to add translations.
        </div>
      `;
    }

    // Check if only one locale (no translations needed)
    if (this.supportedLocales.length <= 1) {
      return html`
        <div class="no-translations">
          <span class="no-translations-icon">🌐</span>
          Add more languages in App Settings to enable translations.
        </div>
      `;
    }

    // Check if component is selected
    if (!this.component) {
      return html`
        <div class="no-translations">
          <span class="no-translations-icon">👆</span>
          Select a component to edit its translations.
        </div>
      `;
    }

    // Get translatable properties for this component type from config.json
    const translatableProps = getTranslatablePropertyInfo(this.component.type);

    if (translatableProps.length === 0) {
      return html`
        <div class="no-translations">
          <span class="no-translations-icon">📝</span>
          This component type does not have translatable properties.
        </div>
      `;
    }

    // Render translation inputs for each property
    return html`
      <div class="translations-editor">
        ${translatableProps.map(prop => this.renderPropertyTranslations(prop.name, prop.label))}
      </div>
    `;
  }

  /**
   * Render translation inputs for a single property
   */
  private renderPropertyTranslations(propertyName: string, label: string) {
    // Get current value from component input
    const inputValue = this.component?.input?.[propertyName];
    const defaultValue = inputValue?.value || '';

    // Get current translations for this property
    const translations = this.component?.translations?.[propertyName] || {};

    return html`
      <div class="property-section">
        <span class="property-label">${label}</span>
        <translations-input
          .propertyName=${propertyName}
          .defaultValue=${defaultValue}
          .translations=${translations}
          @translations-changed=${(e: CustomEvent) => this.handleTranslationsChanged(e)}
        ></translations-input>
      </div>
    `;
  }

  /**
   * Handle translations changed event from TranslationsInput
   */
  private handleTranslationsChanged(event: CustomEvent) {
    const { propertyName, translations } = event.detail;

    if (!this.component?.uuid) return;

    // Update component translations via store
    updateComponentTranslations(
      this.component.uuid,
      propertyName,
      translations
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'translations-editor': TranslationsEditor;
  }
}

export default TranslationsEditor;
