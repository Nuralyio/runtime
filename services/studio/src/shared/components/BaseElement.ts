import { LitElement, type PropertyValueMap, type PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import { type ComponentElement } from "$store/component/interface.ts";
import { eventDispatcher } from "../../utils/change-detection.ts";
import { executeCodeWithClosure, ExecuteInstance } from "../../core/Kernel.ts";
import { getNestedAttribute } from "../../utils/object.utils.ts";
import { setValue } from "$store/apps.ts";
import { isServer } from "../../utils/envirement.ts";
import { $context, getVar } from "$store/context.ts";
import Editor from "core/Editor.ts";

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
  currentPlatform: any;
  calculatedStyles: any = {};

  private traitInputsHandlerBound = this.traitInputsHandlers.bind(this);
  private traitStylesHandlerBound = this.traitStylesHandlers.bind(this);

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
      this.ExecuteInstance.PropertiesProxy[this.component.name] = {};
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
          if (this?.callbacks[inputName]) {
            this.callbacks[inputName](input.value);
          }
        }
      }
    }
  }

  async traitInputsHandlers() {
    const handlerPromises = [];
    if (this.component?.input) {
      for (const [inputName, input] of Object.entries(this.component?.input)) {
        const inputToTrait = Editor.getComponentBreakpointInput(this.component, inputName);
        handlerPromises.push(this.traitInputHandler(inputToTrait, inputName));
      }
      await Promise.all(handlerPromises);
    }
  }

  async traitStyleHandler(style: any, styleName: string): Promise<void> {
    this.calculateStyles();
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
              resolve();
            });
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        this.stylesHandlersValue[styleName] = style;
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

  private calculateStyles() {

    if (this.currentPlatform?.platform !== "desktop") {
      this.calculatedStyles = this.component?.breakpoints?.[this.currentPlatform.width]?.style ?? {};
      if (this.component?.style) {
        this.calculatedStyles = Object.assign({}, this.component?.style, this.calculatedStyles);
      }
    } else {
      this.calculatedStyles = this.component?.style || {};
    }

  }

  override update(changedProperties: PropertyValueMap<any>) {
    super.update(changedProperties);

      this.calculateStyles();
    if (this.closestGenericComponentWrapper) {
      if (
        this.closestGenericComponentWrapper!.style.width !== this.calculatedStyles.width ||
        this.closestGenericComponentWrapper!.style.height !== this.calculatedStyles.height
      ) {
        eventDispatcher.emit("refresh:resize" + this.component.uuid, {}, 0);
      }
    }

    changedProperties.forEach((_oldValue, propName) => {
      if (propName === "component") {
        if (changedProperties.get("component")?.event?.onInit !== this.component?.event?.onInit) {
          executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.onInit`), {}, this.item);
        }
        this.traitInputsHandlers();
        this.traitStylesHandlers();
      }
    });
  }

  override async connectedCallback() {
    $context.subscribe((context) => {
      this.currentPlatform = getVar("global", "currentPlatform")?.value ?? {
        platform: "desktop",
        isMobile: false,
      };
    });
    super.connectedCallback();
    this.closestGenericComponentWrapper = this.closest('generik-component-wrapper');
    this.addEventListener("click", (e) => {
    
    });
    // Using the bound handlers
    eventDispatcher.on('component:refresh', this.traitInputsHandlerBound);
    eventDispatcher.on('component:refresh', this.traitStylesHandlerBound);

    const excludedTypes = ["text_label", "text_input"];
    if (!excludedTypes.includes(this.component.component_type)) {
      // Additional logic if needed
    }

    this.traitInputsHandlers();
    this.traitStylesHandlers();

    eventDispatcher.on("keydown", ({ key, selectedComponents }) => {
      if (key === "Enter") {
        if (selectedComponents.length === 1 && this.component.uuid === selectedComponents[0]) {
          this.isEditable = true;
        }
      }
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();

    // Removing the event listeners
    eventDispatcher.off('component:refresh', this.traitInputsHandlerBound);
    eventDispatcher.off('component:refresh', this.traitStylesHandlerBound);
  }

  protected get shouldDisplay(): boolean {
    return (
      this.inputHandlersValue?.display === undefined ||
      this.inputHandlersValue?.display
    );
  }
}