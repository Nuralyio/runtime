import { css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import "@nuralyui/input";
import { executeCodeWithClosure } from "../../../core/Kernel.ts";
import { getNestedAttribute } from "@utils/object.utils.ts";
import { debounce } from "@utils/time.ts";
import { eventDispatcher } from "@utils/change-detection.ts";

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

  
  handleValueChange = debounce((customEvent: CustomEvent) => {
    if (!this.ExecuteInstance.PropertiesProxy[this.component.name]) {
      this.ExecuteInstance.PropertiesProxy[this.component.name] = {};
    }
    this.ExecuteInstance.PropertiesProxy[this.component.name].value = customEvent.detail.value;

    if (this.component?.event?.valueChange) {
      executeCodeWithClosure(
        this.component,
        getNestedAttribute(this.component, `event.valueChange`),
        { value: customEvent.detail.value }
      );
    }
    // Reset focus state after a delay of inactivity
    this.resetFocusAfterInactivity();
  }, 0  );

  unsubscribe: () => void;

  constructor() {
    super();
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

   
    this.registerCallback("value", (value) => {
      if (!this._isUserFocused && this.currentValue !== value) {
        this.currentValue = value ?? "";
        this.requestUpdate();
      }
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribe) this.unsubscribe();
    if (this._focusResetTimeout) clearTimeout(this._focusResetTimeout);
  }

  override async connectedCallback() {
    await super.connectedCallback();
    eventDispatcher.on(`component-property-changed:${String(this.component.name)}`, (data) => {
      //console.log('data', data)
     this.traitInputsHandlers();
    });
  }

  onFocus = () => {
    this._isUserFocused = true;
    if (this.component?.event?.focus) {
      executeCodeWithClosure(
        this.component,
        getNestedAttribute(this.component, `event.focus`)
      );
    }
  };

  onBlur = (e: Event) => {
    this._isUserFocused = false;
    if (this.component?.event?.blur) {
      executeCodeWithClosure(
        this.component,
        getNestedAttribute(this.component, `event.blur`)
      );
    }
  };

  private resetFocusAfterInactivity() {
    if (this._focusResetTimeout) {
      clearTimeout(this._focusResetTimeout);
    }
    this._focusResetTimeout = setTimeout(() => {
      this._isUserFocused = false;
    }, 3000); // Adjust the timeout duration (in milliseconds) as needed
  }

  render() {
    const inputStyles = this.component?.style || {};
    const inputAutoWidth = this.inputHandlersValue?.width;
    const inputAutoHeight = this.inputHandlersValue?.height;

    const inputStyleHandlers = this.component?.styleHandlers
      ? Object.fromEntries(
          Object.entries(this.component.styleHandlers).filter(([_, v]) => v)
        )
      : {};

    return html`
      <span
        style=${styleMap({
          ...inputStyles,
          width: inputAutoWidth ? "auto" : inputStyles.width,
          height: inputAutoHeight ? "auto" : inputStyles.height,
          display: "block",
          ...inputStyleHandlers,
        })}
      >
        ${
          this.component.uuid === "a40800b4-930f-46bf-8ecc-ada07d233682"
            ? JSON.stringify(this.inputHandlersValue.state, null, 2)
            : nothing
        }
        <hy-input
          style=${styleMap({
            ...inputStyles,
            width: inputAutoWidth ? "auto" : inputStyles.width,
            height: inputAutoHeight ? "auto" : inputStyles.height,
          })}
          @valueChange=${this.handleValueChange}
          @focused=${this.onFocus}
          @blur=${this.onBlur}
          .value=${this.currentValue}
          .size=${inputStyleHandlers?.size
            ? inputStyleHandlers.size
            : inputStyles?.size
              ? inputStyles.size
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
            style=${styleMap({
              "--hybrid-input-label-color":
                inputStyleHandlers["--hybrid-input-label-color"] ??
                inputStyles["--hybrid-input-label-color"],
              "--hybrid-input-label-font-size":
                inputStyleHandlers["--hybrid-input-label-font-size"] ??
                inputStyles["--hybrid-input-label-font-size"],
            })}
          >
            ${this.inputHandlersValue?.label ?? ""}
          </span>
          <span
            slot="helper-text"
            style=${styleMap({
              "--hybrid-input-helper-text-color":
                inputStyleHandlers["--hybrid-input-helper-text-color"] ??
                inputStyles["--hybrid-input-helper-text-color"],
              "--hybrid-input-helper-text-font-size":
                inputStyleHandlers["--hybrid-input-helper-text-font-size"] ??
                inputStyles["--hybrid-input-helper-text-font-size"],
            })}
          >
            ${this.inputHandlersValue?.helper ?? ""}
          </span>
        </hy-input>
      </span>
    `;
  }
}