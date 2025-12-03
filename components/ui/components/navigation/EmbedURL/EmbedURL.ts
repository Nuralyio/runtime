import { css, html, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { ref } from "lit/directives/ref.js";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { executeHandler } from '../../../../../state/runtime-context.ts';
import { getNestedAttribute } from '../../../../../utils/object.utils.ts';
import { debounce } from '../../../../../utils/time.ts';

@customElement("embed-url-block")
export class EmbedUrlBlock extends BaseElementBlock {
  static styles = [css`
    iframe {
      width: 100%;
      height: 100%;
      border: none;
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

  handleUrlChange = debounce((url: string) => {
    if (this.component?.event?.valueChange) {
      executeHandler(
        this.component,
        getNestedAttribute(this.component, `event.valueChange`),
        { value: url }
      );
    }
    this.resetFocusAfterInactivity();
  }, 0);

  onFocus = () => {
    this._isUserFocused = true;
    if (this.component?.event?.focus) {
      executeHandler(this.component, getNestedAttribute(this.component, `event.focus`));
    }
  };

  onBlur = () => {
    this._isUserFocused = false;
    if (this.component?.event?.blur) {
      executeHandler(this.component, getNestedAttribute(this.component, `event.blur`));
    }
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
    const url = this.currentUrl || this.inputHandlersValue?.url || "";

    return html`
      <div
      ${ref(this.inputRef)}
        tabindex="0"
        @focus=${this.onFocus}
        @blur=${this.onBlur}
        style=${styleMap(this.getStyles())}
      >
        ${url
          ? html`<iframe ${ref(this.iframeRef)} src=${url}></iframe>`
          : html`<div style="text-align:center; color:gray;">No URL provided</div>`}
      </div>
    `;
  }
}