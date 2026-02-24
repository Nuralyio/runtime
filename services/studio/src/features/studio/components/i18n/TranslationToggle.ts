/**
 * Translation Toggle Component
 *
 * A simple button that toggles the translation collapse visibility.
 * Similar to the code handler icon but for i18n translations.
 */

import { html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { BaseElementBlock } from '../../../runtime/components/ui/components/base/BaseElement';
import { ExecuteInstance } from '../../../runtime/state/runtime-context';
import { $i18nEnabled, $supportedLocales } from '../../../runtime/state/locale.store';

@customElement('translation-toggle')
export class TranslationToggle extends BaseElementBlock {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  @state() private i18nEnabled = false;
  @state() private localesCount = 0;

  private unsubscribes: (() => void)[] = [];

  override connectedCallback() {
    super.connectedCallback();

    this.i18nEnabled = $i18nEnabled.get();
    this.localesCount = $supportedLocales.get().length;

    this.unsubscribes.push(
      $i18nEnabled.subscribe((enabled) => {
        this.i18nEnabled = enabled;
        this.requestUpdate();
      })
    );

    this.unsubscribes.push(
      $supportedLocales.subscribe((locales) => {
        this.localesCount = locales.length;
        this.requestUpdate();
      })
    );
  }

  override disconnectedCallback() {
    this.unsubscribes.forEach(fn => fn());
    this.unsubscribes = [];
    super.disconnectedCallback();
  }

  private get propertyName(): string {
    return this.component?.attributes?.['property-name'] || '';
  }

  private get isVisible(): boolean {
    const propName = this.propertyName;
    if (!propName) return false;
    return ExecuteInstance?.Vars?.[`i18n_${propName}_visible`] === true;
  }

  private handleClick = () => {
    const propName = this.propertyName;
    if (!propName) return;

    if (this.i18nEnabled && this.localesCount > 1) {
      const currentVisible = ExecuteInstance?.Vars?.[`i18n_${propName}_visible`] || false;
      if (ExecuteInstance?.VarsProxy) {
        ExecuteInstance.VarsProxy[`i18n_${propName}_visible`] = !currentVisible;
      }
      this.requestUpdate();
    }
  };

  override renderComponent() {
    const canUseI18n = this.i18nEnabled && this.localesCount > 1;
    const isActive = this.isVisible;

    return html`
      <nr-button
        size="small"
        .iconLeft=${"globe"}
        .disabled=${!canUseI18n}
        .type=${isActive ? 'primary' : 'text'}
        title=${canUseI18n
          ? (isActive ? 'Hide translations' : 'Show translations')
          : 'Enable i18n in Application Settings'}
        style=${styleMap({
          "--nuraly-button-padding-small": "0px",
          "--nuraly-button-min-width": "24px",
          opacity: canUseI18n ? "1" : "0.5"
        })}
        @click=${this.handleClick}
      ></nr-button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'translation-toggle': TranslationToggle;
  }
}
