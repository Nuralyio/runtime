import { css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "@shared/redux/store/component/interface.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import "@nuralyui/input";
import { executeCodeWithClosure } from "@runtime/Kernel.ts";
import { getNestedAttribute } from "@shared/utils/object.utils.ts";
import { debounce } from "@shared/utils/time.ts";
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

  handleValueChange = debounce((customEvent: CustomEvent) => {
   
    if (this.component?.event?.valueChange) {
      executeCodeWithClosure(
        this.component,
        getNestedAttribute(this.component, `event.valueChange`),
        { value: customEvent.detail.value }
      );
    }
    this.resetFocusAfterInactivity();
  }, 0);

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
    this._inputElement = this.renderRoot.querySelector("hy-input");
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowUp" && this.component.event?.onArrowUp) {
      executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.onArrowUp`));
    }
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown" && this.component.event?.onArrowDown) {
      executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.onArrowDown`));
    }
  };

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribe) this.unsubscribe();
    if (this._focusResetTimeout) clearTimeout(this._focusResetTimeout);
    if (this._inputElement) {
      this._inputElement.removeEventListener("keydown", this.handleKeyDown);
      this._inputElement.removeEventListener("keyup", this.handleKeyUp);
    }
  }

  onFocus = () => {
    this._isUserFocused = true;
    if (this._inputElement) {
      this._inputElement.addEventListener("keydown", this.handleKeyDown);
      this._inputElement.addEventListener("keyup", this.handleKeyUp);
    }
    if (this.component?.event?.focus) {
      executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.focus`));
    }
  };

  onBlur = (e: Event) => {
    this._isUserFocused = false;
    if (this._inputElement) {
      this._inputElement.removeEventListener("keydown", this.handleKeyDown);
      this._inputElement.removeEventListener("keyup", this.handleKeyUp);
    }
    if (this.component?.event?.blur) {
      executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.blur`));
    }
  };

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

    return html`
        <hy-input
        ${ref(this.inputRef)}
          style=${styleMap({...this.getStyles(),
              "--hybrid-input-local-border-top-left-radius": inputStyles?.["border-top-left-radius"] ?? "",
              "--hybrid-input-local-border-top-right-radius": inputStyles?.["border-top-right-radius"] ?? "",
              "--hybrid-input-local-border-bottom-left-radius": inputStyles?.["border-bottom-left-radius"] ?? "",
              "--hybrid-input-local-border-bottom-right-radius": inputStyles?.["border-bottom-right-radius"] ?? "",
          })}
          @valueChange=${this.handleValueChange}
          @focused=${this.onFocus}
          @blur=${this.onBlur}
          .value=${this.inputHandlersValue?.value ?? nothing}
          .size=${this.componentStyles?.size
            ? this.componentStyles.size
            : this.componentStyles?.size
              ? this.componentStyles.size
              : nothing}
          .state=${this.inputHandlersValue.status ?? nothing}
          .type=${this.inputHandlersValue.type ?? nothing}
          .disabled=${this.inputHandlersValue.state === "disabled"}
          placeholder=${this.inputHandlersValue?.placeholder ?? "Text input"}
          .step=${this.inputHandlersValue?.step ?? nothing}
          .min=${this.inputHandlersValue?.min ?? nothing}
          .max=${this.inputHandlersValue?.max ?? nothing}
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
        </hy-input>
    `;
  }
}