import { LitElement } from "lit";
import { property, state } from "lit/decorators.js";
import { executeHandler } from "core/helper";
import { $context } from "$store/context";
import { generateRandomId } from "utils/randomness";
import { type ComponentElement } from "$store/component/interface";
import { eventDispatcher } from "utils/change-detection";
import { updateComponentAttributes } from "$store/actions/component";
import { executeCodeWithClosure } from "core/executer";
import { getNestedAttribute } from "utils/object.utils";
import { setValue } from "$store/apps";
import { isServer } from "utils/envirement";

export class BaseElementBlock extends LitElement {
  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  @state()
  inputHandlersValue: any = {};

  @state()
  stylesHandlersValue: any = {};

  @state()
  thisvalue: any;

  @state()
  callbacks: any = {};

  @state()
  isEditable = false;

  registerCallback(inputName: string, callback: any) {
    this.callbacks[inputName] = callback;
  }

  async traitInputHandler(input: any, inputName: string): Promise<void> {
    if (isServer) {
      return;
    }
    if (input) {
      if (input?.type === "handler") {
        try {
          const fn = executeCodeWithClosure(this.component, getNestedAttribute(this.component, `input.${inputName}`).value);
          if (fn) {
            return new Promise((resolve) => {
              this.inputHandlersValue[inputName] = fn;
              this.thisvalue = fn;
              setValue(this.component.name, inputName, fn);
              if (this?.callbacks[inputName]) {
                this.callbacks[inputName](this.inputHandlersValue[inputName]);
              }
              resolve();
            });
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        this.inputHandlersValue[inputName] = input.value;
        setValue(this.component.name, inputName, input.value);
        if (this?.callbacks[inputName]) {
          this.callbacks[inputName](input.value);
        }
      }

      if (this.inputHandlersValue[inputName]) {
        if (this.inputHandlersValue[inputName] !== this.component.values?.[inputName]) {
          updateComponentAttributes(this.component.applicationId, this.component.uuid, "values", {
            [inputName]: this.inputHandlersValue[inputName]
          }, false);
        }
      }
    }
  }

  async traitInputsHandlers() {
    const handlerPromises = [];
    if (this.component?.input) {
      for (const [inputName, input] of Object.entries(this.component?.input)) {
        handlerPromises.push(this.traitInputHandler(input, inputName));
      }
      await Promise.all(handlerPromises);
    }
  }

  async traitStyleHandler(style: any, styleName: string): Promise<void> {
    if (isServer) {
      return;
    }
    if (style) {
      if (style?.startsWith("return ")) {
        try {
          const fn = executeCodeWithClosure(this.component, style);
          if (fn) {
            return new Promise((resolve) => {
              this.stylesHandlersValue[styleName] = fn;
              this.requestUpdate();
              resolve();
            });
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        this.stylesHandlersValue[styleName] = style;
        this.requestUpdate();
      }
    }
  }

  async traitStylesHandlers() {
    const handlerPromises = [];
    if (this.component?.styleHandlers) {
      for (const [styleName, style] of Object.entries(this.component?.styleHandlers)) {
        handlerPromises.push(this.traitStyleHandler(style, styleName));
      }
      await Promise.all(handlerPromises);
    }
  }

  override updated(changedProperties) {
    changedProperties.forEach((_oldValue, propName) => {
      if (propName === "component") {
        this.traitInputsHandlers();
        this.traitStylesHandlers();
      }
    });
  }

  focusLabel() {
    const label = this.shadowRoot.querySelector("label");
    if (label) {
      label.focus();
    }
  }

  override async connectedCallback() {
    super.connectedCallback();
    $context.subscribe(async (context) => {
      await this.traitInputsHandlers();
      await this.traitStylesHandlers();
    });

    eventDispatcher.on('component:refresh', () => {
      setTimeout(async () => {
        await this.traitInputsHandlers();
        await this.traitStylesHandlers();
      }, 0);
    });

    eventDispatcher.on('keydown', ({ key, selectedComponents }) => {
      if (key === 'Enter') {
        if (selectedComponents.length == 1 && this.component.uuid === selectedComponents[0]) {
          this.isEditable = true;
          this.requestUpdate();
          requestAnimationFrame(() => {
            //this.focusLabel();
          });
        }
      }
    });
  }

}