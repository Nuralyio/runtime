import { html, LitElement, nothing, type PropertyValueMap, type PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import { type ComponentElement, type DraggingComponentInfo } from "$store/component/interface.ts";
import { eventDispatcher } from "../../utils/change-detection.ts";
import { executeCodeWithClosure, ExecuteInstance } from "../../core/Kernel.ts";
import { getNestedAttribute } from "../../utils/object.utils.ts";
import { setValue } from "$store/apps.ts";
import { isServer } from "../../utils/envirement.ts";
import { $context, getVar, setVar } from "$store/context.ts";
import Editor from "core/Editor.ts";
import { createRef, type Ref } from "lit/directives/ref.js";
import { $hoveredComponent } from "$store/component/store.ts";
import { setHoveredComponentAction } from "$store/actions/component/setHoveredComponentAction.ts";
import "../wrappers/GenerikWrapper/DragWrapper/DragWrapper.ts";
import { Utils } from "core/Utils.ts";
import deepEqual from "fast-deep-equal";

function isPromise(value) {
  return Boolean(value && typeof value.then === "function");
}

export class BaseElementBlock extends LitElement {
  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;
  @property({ type: Boolean })
  isViewMode = false;
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
  @state() hoveredComponent: ComponentElement;
  @state() isDragInitiator = false;

  @state()
  closestGenericComponentWrapper: HTMLElement;
  @state() selectedComponent: ComponentElement;
  @state() draggingComponentInfo: DraggingComponentInfo;

  @state()
  currentSelection: any;
  ExecuteInstance: any;
  currentPlatform: any;
  @state()
  calculatedStyles: any = {};
  componentStyles: any = {};

  @state()
  inputRef: Ref<HTMLInputElement> = createRef();
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
    $hoveredComponent.subscribe((hoveredComponent: ComponentElement) => {
      this.hoveredComponent = hoveredComponent;
    });
    $context.subscribe((context) => {
      this.currentPlatform = getVar("global", "currentPlatform")?.value ?? {
        platform: "desktop",
        isMobile: false,
      };
      this.currentSelection = getVar("global", "selectedComponents")?.value || [];
    });
    /*eventDispatcher.on('component:refresh', this.traitInputsHandlerBound);
    eventDispatcher.on('component:refresh', this.traitStylesHandlerBound);*/
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
    this.calculateStyles();
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
    const  {width, height} = this.calculatedStyles;
    if(width){
      const widthUnit = Utils.extractUnit(width);
      if(widthUnit === '%'){
        this.style.width = width;
      }
     
    } 
  }

  override update(changedProperties: PropertyValueMap<any>) {
    super.update(changedProperties);


    if (this.closestGenericComponentWrapper) {
      //   Object.keys(this.calculatedStyles).forEach((key) => {
      //     this.closestGenericComponentWrapper!.style.setProperty(key, this.calculatedStyles[key]);
      //   }
      // );
      if (
        this.closestGenericComponentWrapper!.style.width !== this.calculatedStyles.width ||
        this.closestGenericComponentWrapper!.style.height !== this.calculatedStyles.height
      ) {
        //   this.closestGenericComponentWrapper!.style.width = this.calculatedStyles.width;
        //   this.closestGenericComponentWrapper!.style.height = this.calculatedStyles.height;
        //  this.closestGenericComponentWrapper!.style.display = "block";
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
   
   
    super.connectedCallback();
    this.closestGenericComponentWrapper = this.closest('generik-component-wrapper');
    this.addEventListener("mouseenter", this.mouseEnterHandler);
    // Using the bound handlers
    this.addEventListener("click", (e)=>{
      if(!this.isViewMode){
        this.selectComponentAction(e);
        e.preventDefault();
        e.stopPropagation();
      }
    });

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

    this.addEventListener("dragenter", () => {
      const wrappers = this.shadowRoot?.querySelectorAll('drag-wrapper') || [];
      wrappers.forEach(wrapper => {
        wrapper.dispatchEvent(new CustomEvent("drag-over-component", {
          bubbles: true,
          composed: true,
        }));
      });
    });
    this.addEventListener("drop", () => {
      const wrappers = this.shadowRoot?.querySelectorAll('drag-wrapper') || [];
      wrappers.forEach(wrapper => {
        wrapper.dispatchEvent(new CustomEvent("drag-leave-component", {
          bubbles: true,
          composed: true,
        }));
      });
    });
   
    this.addEventListener("dragleave", () => {
      const wrappers = this.shadowRoot?.querySelectorAll('drag-wrapper') || [];
      wrappers.forEach(wrapper => {
        wrapper.dispatchEvent(new CustomEvent("drag-leave-component", {
          bubbles: true,
          composed: true,
        }));
      });
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
  
    // Suppression des écouteurs d'événements globaux
    eventDispatcher.off('component:refresh', this.traitInputsHandlerBound);
    eventDispatcher.off('component:refresh', this.traitStylesHandlerBound);
  
    // Suppression des écouteurs d'événements attachés à l'élément
    this.removeEventListener("mouseenter", this.mouseEnterHandler);
    this.removeEventListener("dragenter", this.dragEnterHandler);
    this.removeEventListener("drop", this.dropHandler);
    this.removeEventListener("dragleave", this.dragLeaveHandler);
  }
  
  // Assurez-vous d'ajouter des références aux handlers dans connectedCallback
  private mouseEnterHandler = (e: Event) => {
    if (!this.isViewMode) {
      setHoveredComponentAction(this.component);
    }
  };
  
  private dragEnterHandler = () => {
    const wrappers = this.shadowRoot?.querySelectorAll('drag-wrapper') || [];
    wrappers.forEach(wrapper => {
      wrapper.dispatchEvent(new CustomEvent("drag-over-component", {
        bubbles: true,
        composed: true,
      }));
    });
  };
  
  private dropHandler = () => {
    const wrappers = this.shadowRoot?.querySelectorAll('drag-wrapper') || [];
    wrappers.forEach(wrapper => {
      wrapper.dispatchEvent(new CustomEvent("drag-leave-component", {
        bubbles: true,
        composed: true,
      }));
    });
  };
  
  private dragLeaveHandler = () => {
    const wrappers = this.shadowRoot?.querySelectorAll('drag-wrapper') || [];
    wrappers.forEach(wrapper => {
      wrapper.dispatchEvent(new CustomEvent("drag-leave-component", {
        bubbles: true,
        composed: true,
      }));
    });
  };

  protected get shouldDisplay(): boolean {
    return (
      this.inputHandlersValue?.display === undefined ||
      this.inputHandlersValue?.display
    );
  }
  renderComponent() {

  }

  getStyles(){
    //  "width": Utils.extractUnit(this.componentStyles?.width) === "%" ? "100%" : this.componentStyles?.width ?? "auto",
    return {...this.componentStyles, width : Utils.extractUnit(this.componentStyles?.width) === "%" ? "100%" : this.componentStyles?.width ?? "auto"};
  }

  executeEvent(eventName, e?) {
    if (this.isViewMode) {
      if (this.component.event?.[eventName]) {
        executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.${eventName}`), {}, this.item);
      }
    } else {
      if (eventName === "onClick") {
        if (e) {
         this.selectComponentAction(e);
         e.stopPropagation();
         e.preventDefault();
        }
      }
    }
  }
  selectComponentAction(e){
    let currentSelection = getVar("global", "selectedComponents")?.value || [];
    if (e.metaKey) {
      currentSelection.push(this.component.uuid);
    } else if (e.shiftKey) {
      currentSelection = currentSelection.filter((uuid) => uuid !== this.component.uuid);
    } else {
      currentSelection = [this.component.uuid];
    }
    setVar("global", "selectedComponents", [...currentSelection]);
  }
  protected render(): unknown {
    if (!this.shouldDisplay) return nothing;
    this.componentStyles = this.calculatedStyles || {};
    const labelStyleHandlers = this.component?.styleHandlers
      ? Object.fromEntries(Object.entries(this.component?.styleHandlers)?.filter(([key, value]) => value))
      : {};

    this.componentStyles = {
      ...this.componentStyles,

      ...labelStyleHandlers
    };
    return html`

       
           
     ${!this.isViewMode ? html` 

      <component-title
         @click=${(e) => {
        this.executeEvent("onclick", e);
      }}
              @dragInit=${(e) => {
        this.isDragInitiator = e.detail.value;
        this.setAttribute("draggable", `true`);
      }}
              @dragend=${() => {
        this.isDragInitiator = false;
      }}
              .component=${{ ...this.component }}
              .selectedComponent=${{ ...this.selectedComponent }}
              .hoveredComponent=${{ ...this.hoveredComponent }}

            ></component-title>
            
  <resize-wrapper
        .hoveredComponent=${{ ...this.hoveredComponent }}
        .isSelected=${this.currentSelection.includes(this.component.uuid)}
        .component=${{ ...this.component }}
        .selectedComponent=${{ ...this.selectedComponent }}
        .inputRef=${this.inputRef}
        style="width: fit-content; height: fit-content;"

      >
      </resize-wrapper>
      <drag-wrapper
        .where=${"before"}
        .message=${"Drop before"}
          .component=${{ ...this.component }}
          .inputRef=${this.inputRef}
          .isDragInitiator=${this.isDragInitiator}
        >
        </drag-wrapper>
      `: nothing} 
    ${this.renderComponent()}
    ${!this.isViewMode ? html` 
    <drag-wrapper
    .where=${"after"}
    .message=${"Drop after"}

          .component=${{ ...this.component }}
          .inputRef=${this.inputRef}
          .isDragInitiator=${this.isDragInitiator}
        >
        </drag-wrapper> `: nothing} 
        
        `;

  }
}