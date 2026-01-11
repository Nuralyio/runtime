/**
 * @fileoverview PropertyTranslationCollapse Component
 * @module Studio/Components/i18n/PropertyTranslationCollapse
 *
 * Inline translation collapse for property inputs in the right panel.
 * Shows below text inputs when i18n is enabled and component has translatable properties.
 * Uses Nuraly UI components (nr-collapse, nr-input, nr-tag).
 * Extends BaseElementCore to use lowcode input handler system for display control.
 */

import { html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseElementCore } from '../../../runtime/components/ui/components/base/BaseElement';
import { updateComponentTranslations } from '../../../runtime/redux/store/component/store';
import { updateComponentHandler } from '../../../runtime/redux/handlers/components/update-component.handler';
import {
  $supportedLocales,
  $defaultLocale,
  $i18nEnabled,
  getLocaleName,
  getLocaleFlag,
  isRTL
} from '../../../runtime/state/locale.store';
import { eventDispatcher } from '../../../runtime/utils/change-detection';
import { ExecuteInstance } from '../../../runtime/state/runtime-context';
import type { CollapseSection } from '../../../runtime/components/ui/nuraly-ui/src/components/collapse/collapse.type';

/**
 * PropertyTranslationCollapse Component
 *
 * Displays an inline collapsible translation section for a single property.
 * Used in property editor to add translations directly below text inputs.
 * Uses Nuraly UI components for consistent styling.
 * Extends BaseElementCore for lowcode input.display handler support.
 */
@customElement('property-translation-collapse')
export class PropertyTranslationCollapse extends BaseElementCore {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
      margin-top: 4px;
    }

    nr-collapse {
      --nr-collapse-content-padding: 0;
      --nuraly-spacing-collapse-small-padding: 6px 8px;
      --nuraly-spacing-collapse-content-padding: 0;
    }
  `;

  /** Whether the collapse is expanded */
  @state() private expanded = false;

  /** Selected component for translations */
  @state() private selectedComponent: any = null;

  /** i18n enabled state */
  @state() private i18nEnabled = false;

  /** Supported locales */
  @state() private locales: string[] = [];

  /** Default locale */
  @state() private defaultLocale = 'en';

  /** Store unsubscribe functions */
  private unsubscribes: (() => void)[] = [];

  override connectedCallback() {
    super.connectedCallback();

    // Get initial values
    this.locales = [...$supportedLocales.get()];
    this.defaultLocale = $defaultLocale.get();
    this.i18nEnabled = $i18nEnabled.get();
    this.updateSelectedComponent();

    // Subscribe to store changes
    this.unsubscribes.push(
      $supportedLocales.subscribe((locales) => {
        this.locales = [...locales];
        this.requestUpdate();
      })
    );

    this.unsubscribes.push(
      $defaultLocale.subscribe((locale) => {
        this.defaultLocale = locale;
        this.requestUpdate();
      })
    );

    this.unsubscribes.push(
      $i18nEnabled.subscribe((enabled) => {
        this.i18nEnabled = enabled;
        this.requestUpdate();
      })
    );

    // Listen for component selection changes
    const updateHandler = () => {
      this.updateSelectedComponent();
    };
    eventDispatcher.on('component:refresh', updateHandler);
    eventDispatcher.on('component:updated', updateHandler);
    eventDispatcher.on('Vars:selectedComponents', updateHandler);

    this.unsubscribes.push(() => {
      eventDispatcher.off('component:refresh', updateHandler);
      eventDispatcher.off('component:updated', updateHandler);
      eventDispatcher.off('Vars:selectedComponents', updateHandler);
    });
  }

  override disconnectedCallback() {
    this.unsubscribes.forEach(fn => fn());
    this.unsubscribes = [];
    super.disconnectedCallback();
  }

  private updateSelectedComponent() {
    // Use ExecuteInstance.Vars.selectedComponents - contains full component objects
    const selectedComponents = ExecuteInstance?.Vars?.selectedComponents || [];

    // Get the first selected component
    let first = Array.isArray(selectedComponents) ? selectedComponents[0] : selectedComponents;

    // Handle nested array case
    if (Array.isArray(first)) {
      first = first[0];
    }

    this.selectedComponent = first || null;
    this.requestUpdate();
  }

  /** Get property name from component attributes */
  private get propertyName(): string {
    return this.component?.attributes?.['property-name'] || '';
  }

  /**
   * Override renderComponent from BaseElementCore
   * BaseElementCore.render() checks shouldDisplay which uses resolvedInputs.display
   * The input.display handler returns $i18n_${propName}_visible === true
   */
  override renderComponent() {
    // Don't render if i18n not enabled or only 1 locale
    if (!this.i18nEnabled || this.locales.length <= 1) {
      return nothing;
    }

    // Don't render if no component selected
    if (!this.selectedComponent) {
      return nothing;
    }

    // Get property name
    const propName = this.propertyName;
    if (!propName) {
      return nothing;
    }

    // Get other locales (excluding default)
    const otherLocales = this.locales.filter(l => l !== this.defaultLocale);
    if (otherLocales.length === 0) {
      return nothing;
    }

    // Get current translations for this property
    const translations = this.selectedComponent?.translations?.[propName] || {};

    // Get default value
    const inputValue = this.selectedComponent?.input?.[propName];
    const defaultValue = inputValue?.value || '';

    // Calculate status
    const translatedCount = otherLocales.filter(locale =>
      translations[locale] !== undefined && translations[locale] !== ''
    ).length;

    const isComplete = translatedCount === otherLocales.length;
    const isPartial = translatedCount > 0 && !isComplete;

    // Status badge inline styles based on completion status
    const statusBadgeStyle = isComplete
      ? 'background: #e8f5e9; color: #2e7d32;'
      : isPartial
        ? 'background: #fff3e0; color: #e65100;'
        : 'background: #ffebee; color: #c62828;';

    // Build collapse sections with content
    const sections = [{
      header: '🌐 Translations',
      headerRight: html`<span style="font-size: 10px; padding: 2px 8px; border-radius: 10px; font-weight: 500; ${statusBadgeStyle}">${translatedCount}/${otherLocales.length}</span>`,
      content: html`
        <div style="padding: 0;">
          <!-- Default locale (read-only) -->
          <div style="display: flex; align-items: center; gap: 8px; padding: 8px; border-bottom: 1px solid #f0f0f0;">
            <nr-tag color="blue" size="small" style="min-width: 50px; text-transform: uppercase;">
              ${getLocaleFlag(this.defaultLocale)} ${this.defaultLocale}
            </nr-tag>
            <nr-label size="small" style="flex: 1; padding: 4px 8px; background: #f9f9f9; border-radius: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title=${defaultValue || '(empty)'}>
              ${defaultValue || '(empty)'}
            </nr-label>
            <nr-label size="small" style="color: #999;">Default</nr-label>
          </div>

          <!-- Other locales -->
          ${otherLocales.map(locale => this.renderLocaleRow(locale, translations[locale] || '', propName))}
        </div>
      `,
      open: this.expanded
    }] as CollapseSection[];

    return html`
      <nr-collapse
        .sections=${sections}
        size="small"
        @section-toggle=${this.handleSectionToggle}
      ></nr-collapse>
    `;
  }

  private renderLocaleRow(locale: string, value: string, propName: string) {
    const localeIsRTL = isRTL(locale);
    const hasValue = value !== '';

    return html`
      <div style="display: flex; align-items: center; gap: 8px; padding: 8px; border-bottom: 1px solid #f0f0f0;">
        <nr-tag size="small" color=${localeIsRTL ? 'orange' : 'cyan'} style="min-width: 50px; text-transform: uppercase;">
          ${getLocaleFlag(locale)} ${locale}
        </nr-tag>
        <nr-input
          size="small"
          variant="outlined"
          .value=${value}
          placeholder="${getLocaleName(locale)}..."
          debounce="500"
          style="flex: 1; ${localeIsRTL ? 'direction: rtl; text-align: right;' : ''}"
          @nr-input=${(e: CustomEvent) => this.handleTranslationChange(locale, propName, e)}
        ></nr-input>
        <nr-label size="small" style="color: ${hasValue ? '#4caf50' : '#ff9800'}; width: 20px; text-align: center;">
          ${hasValue ? '✓' : '○'}
        </nr-label>
      </div>
    `;
  }

  private handleSectionToggle(e: CustomEvent) {
    this.expanded = e.detail.isOpen;
  }

  private handleTranslationChange(locale: string, propName: string, e: CustomEvent) {
    // nr-input dispatches value in e.detail.value
    const value = (e.detail?.value || '').trim();

    if (!this.selectedComponent?.uuid) {
      return;
    }

    // Get current translations
    const currentTranslations = this.selectedComponent?.translations?.[propName] || {};

    // Update translations
    const newTranslations = { ...currentTranslations };
    if (value) {
      newTranslations[locale] = value;
    } else {
      delete newTranslations[locale];
    }

    // Update component translations via store
    updateComponentTranslations(
      this.selectedComponent.uuid,
      propName,
      newTranslations
    );

    // Save to backend
    const updatedComponent = {
      ...this.selectedComponent,
      translations: {
        ...this.selectedComponent.translations,
        [propName]: newTranslations
      }
    };
    // Remove translations key if empty
    if (Object.keys(newTranslations).length === 0) {
      delete updatedComponent.translations[propName];
    }
    if (Object.keys(updatedComponent.translations || {}).length === 0) {
      delete updatedComponent.translations;
    }
    updateComponentHandler(updatedComponent, this.selectedComponent.application_id);

    // Update local state to reflect changes immediately
    this.selectedComponent = updatedComponent;
    this.requestUpdate();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'property-translation-collapse': PropertyTranslationCollapse;
  }
}

export default PropertyTranslationCollapse;
