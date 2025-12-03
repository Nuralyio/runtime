import { css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import "@nuralyui/input";
import { ref } from "lit/directives/ref.js";

@customElement("text-input-block")
export class TextInputBlock extends BaseElementBlock {
  static styles = [css``];

  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  @state()
  currentValue = "";

  @state()
  private _isUserFocused = false;

  private _focusResetTimeout: NodeJS.Timeout | null = null;
  private _inputElement: HTMLInputElement | null = null;

  unsubscribe: () => void;

  constructor() {
    super();
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    this.registerCallback("value", (value) => {
      if (!this._isUserFocused && this.currentValue !== value) {
        this.currentValue = value ?? "";
      }
    });

    // Récupération de l'élément input
    this._inputElement = this.renderRoot.querySelector("nr-input");
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribe) this.unsubscribe();
    if (this._focusResetTimeout) clearTimeout(this._focusResetTimeout);
  }

  private resetFocusAfterInactivity() {
    if (this._focusResetTimeout) {
      clearTimeout(this._focusResetTimeout);
    }
    this._focusResetTimeout = setTimeout(() => {
      this._isUserFocused = false;
    }, 3000);
  }

  override renderComponent() {
   const inputStyles = this.getStyles();
   const componentStyles = this.component?.style || {};
   const size = (componentStyles?.size as 'small' | 'medium' | 'large') || 'medium';

    return html`
        <nr-input
        ${ref(this.inputRef)}
          style=${styleMap({...this.getStyles(),
              "--nuraly-input-local-border-top-left-radius": inputStyles?.["border-top-left-radius"] ?? "",
              "--nuraly-input-local-border-top-right-radius": inputStyles?.["border-top-right-radius"] ?? "",
              "--nuraly-input-local-border-bottom-left-radius": inputStyles?.["border-bottom-left-radius"] ?? "",
              "--nuraly-input-local-border-bottom-right-radius": inputStyles?.["border-bottom-right-radius"] ?? "",
          })}
          .value=${this.inputHandlersValue?.value ?? nothing}
          .size=${size}
          .state=${this.inputHandlersValue.status ?? nothing}
          .type=${this.inputHandlersValue.type ?? nothing}
          .variant=${this.inputHandlersValue.variant ?? nothing}
          .disabled=${this.inputHandlersValue.state === "disabled"}
          .readonly=${this.inputHandlersValue.readonly || false}
          .placeholder=${this.inputHandlersValue?.placeholder ?? "Text input"}
          .step=${this.inputHandlersValue?.step ?? nothing}
          .min=${this.inputHandlersValue?.min ?? nothing}
          .max=${this.inputHandlersValue?.max ?? nothing}
          .name=${this.inputHandlersValue?.name ?? nothing}
          .required=${this.inputHandlersValue?.required || false}
          .withCopy=${this.inputHandlersValue?.withCopy || false}
          .allowClear=${this.inputHandlersValue?.allowClear || false}
          .showCount=${this.inputHandlersValue?.showCount || false}
          .maxLength=${this.inputHandlersValue?.maxLength ?? nothing}
          .rules=${this.inputHandlersValue?.rules ?? []}
          .validateOnChangeInput=${this.inputHandlersValue?.validateOnChange !== false}
          .validateOnBlurInput=${this.inputHandlersValue?.validateOnBlur !== false}
          .hasFeedback=${this.inputHandlersValue?.hasFeedback || false}
          .autocomplete=${this.inputHandlersValue?.autocomplete ?? 'off'}
          @nr-input=${(e) => {
            this._isUserFocused = true;
            this.executeEvent('onChange', e , 
            {
              value: e.detail.value,
              oldValue: e.detail.oldValue
            }
            );
            this.resetFocusAfterInactivity();
          }}
          @nr-focus=${(e) => {
            this._isUserFocused = true;
            this.executeEvent('onFocus', e, {
              value: e.detail.value
            });
          }}
          @nr-blur=${(e) => {
            this._isUserFocused = false;
            this.executeEvent('onBlur', e, {
              value: e.detail.value
            });
          }}
          @nr-enter=${(e) => {
            this.executeEvent('onEnter', e, {
              value: e.detail.value
            });
          }}
          @nr-clear=${(e) => {
            this.executeEvent('onClear', e, {
              value: e.detail.value
            });
          }}
          @keydown=${(e) => {
            if (e.key === "ArrowUp") {
              this.executeEvent('onArrowUp', e);
            } else if (e.key === "ArrowDown") {
              this.executeEvent('onArrowDown', e);
            }
          }}
        >
          <span
            slot="label"
           
          >
            ${this.inputHandlersValue?.label ?? ""}
          </span>
          <span
            slot="helper-text"
           
          >
            ${this.inputHandlersValue?.helper ?? ""}
          </span>
        </nr-input>
    `;
  }
}