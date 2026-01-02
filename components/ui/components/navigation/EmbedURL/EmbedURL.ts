import { css, html, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { ref } from "lit/directives/ref.js";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';

@customElement("embed-url-block")
export class EmbedUrlBlock extends BaseElementBlock {
  static styles = [css`
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    .embed-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #64748b;
      min-height: 200px;
      border-radius: 8px;
      border: 2px dashed #cbd5e1;
      gap: 12px;
    }
    .embed-placeholder nr-icon {
      --nuraly-icon-size: 48px;
    }
  `];

  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  @state()
  currentUrl = "";

  @state()
  private _isUserFocused = false;

  private _focusResetTimeout: NodeJS.Timeout | null = null;

  iframeRef = ref();

  unsubscribe: () => void;

  constructor() {
    super();
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    this.registerCallback("url", (url) => {
      if (!this._isUserFocused && this.currentUrl !== url) {
        this.currentUrl = url ?? "";
      }
    });
  }

  private handleIframeLoad(e: Event) {
    this.executeEvent('onLoad', e, {
      url: this.currentUrl || this.resolvedInputs?.url || ""
    });
  }

  private handleIframeError(e: Event) {
    this.executeEvent('onError', e, {
      url: this.currentUrl || this.resolvedInputs?.url || "",
      error: 'Failed to load iframe content'
    });
  }

  onFocus = (e: FocusEvent) => {
    this._isUserFocused = true;
    this.executeEvent('onFocus', e);
  };

  onBlur = (e: FocusEvent) => {
    this._isUserFocused = false;
    this.executeEvent('onBlur', e);
  };

  private resetFocusAfterInactivity() {
    if (this._focusResetTimeout) clearTimeout(this._focusResetTimeout);
    this._focusResetTimeout = setTimeout(() => {
      this._isUserFocused = false;
    }, 3000);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribe) this.unsubscribe();
    if (this._focusResetTimeout) clearTimeout(this._focusResetTimeout);
  }

  override renderComponent() {
    const embedStyles = this.getStyles() || {};
    const embedStyleHandlers = this.component?.style_handlers ? Object.fromEntries(
      Object.entries(this.component?.style_handlers).filter(([key, value]) => value)) : {};

    const url = this.currentUrl || this.resolvedInputs?.url || "";

    // Show placeholder when no URL
    if (!url) {
      return html`
        <div
          ${ref(this.inputRef)}
          class="embed-placeholder"
          style=${styleMap({
            ...this.getStyles(),
            width: embedStyleHandlers?.width || embedStyles?.width || '100%',
            height: embedStyleHandlers?.height || embedStyles?.height || '200px',
          })}
          @click=${(e: MouseEvent) => this.executeEvent('onClick', e)}
        >
          <nr-icon name="globe"></nr-icon>
          <nr-label>No URL provided</nr-label>
        </div>
      `;
    }

    return html`
      <div
        ${ref(this.inputRef)}
        tabindex="0"
        @focus=${this.onFocus}
        @blur=${this.onBlur}
        @click=${(e: MouseEvent) => this.executeEvent('onClick', e)}
        style=${styleMap(this.getStyles())}
      >
        <iframe
          ${ref(this.iframeRef)}
          src=${url}
          @load=${(e: Event) => this.handleIframeLoad(e)}
          @error=${(e: Event) => this.handleIframeError(e)}
        ></iframe>
      </div>
    `;
  }
}
