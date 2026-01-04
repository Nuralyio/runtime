import { css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { ref } from "lit/directives/ref.js";
import { registerWithParentForm, unregisterFromParentForm } from "../../base/FormRegisterable.ts";

import "@nuralyui/input";

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

    // Get reference to the nr-input element
    this._inputElement = this.renderRoot.querySelector("nr-input");

    // Register with parent form if this input has a name
    if (this._inputElement && this.resolvedInputs?.name) {
      registerWithParentForm(this, this._inputElement);
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribe) this.unsubscribe();
    if (this._focusResetTimeout) clearTimeout(this._focusResetTimeout);

    // Unregister from parent form
    if (this.resolvedInputs?.name) {
      unregisterFromParentForm(this);
    }
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
     class="${`drop-${this.component.uuid}`}"
         
          .value=${this.resolvedInputs?.value ?? nothing}
          .size=${this.resolvedInputs?.size ?? "medium"}
          .state=${this.resolvedInputs.status ?? nothing}
          .type=${this.resolvedInputs.type ?? nothing}
          .variant=${this.resolvedInputs.variant ?? nothing}
          .disabled=${this.resolvedInputs.state === "disabled"}
          .readonly=${this.resolvedInputs.readonly || false}
          .placeholder=${this.resolvedInputs?.placeholder ?? "Text input"}
          .step=${this.resolvedInputs?.step ?? nothing}
          .min=${this.resolvedInputs?.min ?? nothing}
          .max=${this.resolvedInputs?.max ?? nothing}
          .name=${this.resolvedInputs?.name ?? nothing}
          .required=${this.resolvedInputs?.required || false}
          .withCopy=${this.resolvedInputs?.withCopy || false}
          .allowClear=${this.resolvedInputs?.allowClear || false}
          .showCount=${this.resolvedInputs?.showCount || false}
          .maxLength=${this.resolvedInputs?.maxLength ?? nothing}
          .rules=${this.resolvedInputs?.rules ?? []}
          .validateOnChangeInput=${this.resolvedInputs?.validateOnChange !== false}
          .validateOnBlurInput=${this.resolvedInputs?.validateOnBlur !== false}
          .hasFeedback=${this.resolvedInputs?.hasFeedback || false}
          .autocomplete=${this.resolvedInputs?.autocomplete ?? 'off'}
          .debounce=${this.resolvedInputs?.debounce ?? 0}
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
            ${this.resolvedInputs?.label ?? ""}
          </span>
          <span
            slot="helper-text"
           
          >
            ${this.resolvedInputs?.helper ?? ""}
          </span>
        </nr-input>
    `;
  }
}
