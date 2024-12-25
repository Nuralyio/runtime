import { LitElement, type PropertyValueMap } from "lit";
import { property, state } from "lit/decorators.js";
import { type ComponentElement } from "$store/component/interface.ts";
import { eventDispatcher } from "../../utils/change-detection.ts";
import { executeCodeWithClosure } from "../../core/executer.ts";
import { getNestedAttribute } from "../../utils/object.utils.ts";
import { setValue } from "$store/apps.ts";
import { isServer } from "../../utils/envirement.ts";
import { updateComponentAttributes } from "$store/actions/component/updateComponentAttributes.ts";

function isPromise(value) {
  return Boolean(value && typeof value.then === "function");
}

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

  @state()
  closestGenericComponentWrapper: HTMLElement;

  registerCallback(inputName: string, callback: any) {
    this.callbacks[inputName] = callback;
  }

  unregisterCallback(inputName: string) {
    delete this.callbacks[inputName];
  }

  async traitInputHandler(input: any, inputName: string): Promise<void> {
    if (isServer) {
      return;
    }
    if (input) {
      if (input?.type === "handler") {
        return new Promise((resolve, reject) => {
          const fn = executeCodeWithClosure(this.component, getNestedAttribute(this.component, `input.${inputName}`).value, undefined, this.item);
          if (isPromise(fn)) {
            fn.then((result: any) => {
              this.inputHandlersValue[inputName] = result;
              setValue(this.component.name, inputName, result);
              if (this?.callbacks[inputName]) {
                this.callbacks[inputName](result);
              }
              resolve();
            });
          } else {
            this.inputHandlersValue[inputName] = fn;
            this.thisvalue = fn;
            if (this?.callbacks[inputName]) {
              this.callbacks[inputName](this.inputHandlersValue[inputName]);
            }
            resolve();
          }

        });
      } else {
        this.inputHandlersValue[inputName] = input.value;
        setValue(this.component.name, inputName, input.value);
        if (this?.callbacks[inputName]) {
          this.callbacks[inputName](input.value);
        }
      }
      if (this.inputHandlersValue[inputName]) {
        if (this.inputHandlersValue[inputName] !== this.component.values?.[inputName]) {
          updateComponentAttributes(
            this.component.applicationId,
            this.component.uuid,
            "values",
            {
              [inputName]: this.inputHandlersValue[inputName]
            },
            false
          );
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
              if (this.stylesHandlersValue[styleName] !== fn) {
                this.stylesHandlersValue[styleName] = fn;
              }
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

  override updated(changedProperties: any[] | PropertyValueMap<any>) {
    changedProperties.forEach((_oldValue, propName) => {
      if (propName === "component") {
        this.traitInputsHandlers();
        this.traitStylesHandlers();
      }
    });
  }

  override async connectedCallback() {
    super.connectedCallback();
    this.closestGenericComponentWrapper =  this.closest('generik-component-wrapper');
    eventDispatcher.on("keydown", ({ key, selectedComponents }) => {
      if (key === "Enter") {
        if (selectedComponents.length == 1 && this.component.uuid === selectedComponents[0]) {
          this.isEditable = true;
          this.requestUpdate();
          requestAnimationFrame(() => {
            // todo: implement this
          });
        }
      }
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    eventDispatcher.off("component:refresh", this.traitInputsHandlers);
    eventDispatcher.off("component:refresh", this.traitStylesHandlers);
    eventDispatcher.off("keydown", this.isEditable);
  }
}