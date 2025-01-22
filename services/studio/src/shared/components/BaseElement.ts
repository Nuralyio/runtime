import { LitElement, type PropertyValueMap } from "lit";
import { property, state } from "lit/decorators.js";
import { type ComponentElement } from "$store/component/interface.ts";
import { eventDispatcher } from "../../utils/change-detection.ts";
import { executeCodeWithClosure, ExecuteInstance } from "../../core/Kernel.ts";
import { getNestedAttribute } from "../../utils/object.utils.ts";
import { setValue } from "$store/apps.ts";
import { isServer } from "../../utils/envirement.ts";
import { updateComponentAttributes } from "$store/actions/component/updateComponentAttributes.ts";
import { $context } from "$store/context.ts";

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

  ExecuteInstance: any;

  registerCallback(inputName: string, callback: any) {
    this.callbacks[inputName] = callback;
  }

  unregisterCallback(inputName: string) {
    delete this.callbacks[inputName];
  }
  constructor() {
    super();
    this.ExecuteInstance = ExecuteInstance;
  }

  async traitInputHandler(input: any, inputName: string): Promise<void> {
    if (isServer) {
      return;
    }
    if (!this.ExecuteInstance.PropertiesProxy[this.component.name]) {
      this.ExecuteInstance.PropertiesProxy[this.component.name] = {}
    }
    if (input) {
      if (input?.type === "handler") {
        return new Promise((resolve, reject) => {
          const fn = executeCodeWithClosure(this.component, getNestedAttribute(this.component, `input.${inputName}`).value, undefined, this.item);
          if (isPromise(fn)) {
            fn.then((result: any) => {
              if (this.inputHandlersValue[inputName] !== result) {
                this.inputHandlersValue[inputName] = result;
                this.ExecuteInstance.PropertiesProxy[this.component.name][inputName] = result;

              }
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
        if (this.inputHandlersValue[inputName] !== input.value) {
          this.ExecuteInstance.PropertiesProxy[this.component.name][inputName] = input.value;

        }
        setValue(this.component.name, inputName, input.value);
        if (this?.callbacks[inputName]) {
          this.callbacks[inputName](input.value);
        }
      }
      if (this.inputHandlersValue[inputName]) {
        if (this.inputHandlersValue[inputName] !== input.value) {
          this.ExecuteInstance.PropertiesProxy[this.component.name][inputName] = input.value;
          //setValue(this.component.name, inputName, input.value);
          if (this?.callbacks[inputName]) {
            this.callbacks[inputName](input.value);
          }
          /*updateComponentAttributes(
            this.component.applicationId,
            this.component.uuid,
            "values",
            {
              [inputName]: this.inputHandlersValue[inputName]
            },
            false
          );*/
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
      Promise.all(handlerPromises);
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
    changedProperties.forEach(async (_oldValue, propName) => {
      if (propName === "component") {
        const excludedTypes = ["text_label", "text_input"];
        if (!excludedTypes.includes(this.component.component_type)) {

        } 
        this.traitInputsHandlers();
        this.traitStylesHandlers();
      }
    });
  }

  override async connectedCallback() {
    super.connectedCallback();
    this.closestGenericComponentWrapper = this.closest('generik-component-wrapper');
    eventDispatcher.on('component:refresh' , async ()=>{
      await this.traitInputsHandlers();
      await this.traitStylesHandlers();
    })
    const excludedTypes = ["text_label", "text_input"];
    if (!excludedTypes.includes(this.component.component_type)) {

    }
    await this.traitInputsHandlers();
    await this.traitStylesHandlers();

    eventDispatcher.on("keydown", ({ key, selectedComponents }) => {
      if (key === "Enter") {
        if (selectedComponents.length == 1 && this.component.uuid === selectedComponents[0]) {
          this.isEditable = true;
          this.requestUpdate();
        }
      }
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    eventDispatcher.off("component:refresh", this.traitInputsHandlers);
    eventDispatcher.off("component:refresh", this.traitStylesHandlers);
  }
}