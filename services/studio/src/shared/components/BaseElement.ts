import { html, LitElement, nothing, type PropertyValueMap, type PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import { ComponentType, type ComponentElement, type DraggingComponentInfo } from "$store/component/interface.ts";
import { eventDispatcher } from "../../utils/change-detection.ts";
import { executeCodeWithClosure, ExecuteInstance } from "../../core/Kernel.ts";
import { getNestedAttribute } from "../../utils/object.utils.ts";
import { setValue } from "$store/apps.ts";
import { isServer } from "../../utils/envirement.ts";
import { $context, getVar, setVar } from "$store/context.ts";
import Editor from "core/Editor.ts";
import { createRef, type Ref } from "lit/directives/ref.js";
import { $applicationComponents, $hoveredComponent, $runtimeStylescomponentStyleByID, clearComponentRuntimeStyleAttributes } from "$store/component/store.ts";
import { setHoveredComponentAction } from "$store/actions/component/setHoveredComponentAction.ts";
import "../wrappers/GenerikWrapper/DragWrapper/DragWrapper.ts";
import { Utils } from "core/Utils.ts";
import deepEqual from "fast-deep-equal";
import { setContextMenuEvent } from "$store/actions/page/setContextMenuEvent.ts";
import { addlogDebug, resetComponentDebug } from "$store/actions/debug/store.ts";
import { $debug } from "$store/debug.ts";
import { Subscription } from "rxjs";
import EditorInstance from "core/Editor.ts";

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
  currentSelection: any = [];
  ExecuteInstance: any;
  currentPlatform: any;
  @state()
  calculatedStyles: any = {};
  componentStyles: any = {};
  @state()
  isConnected2 = false;

  private subscription = new Subscription(); // Subscription management
  
  @state()
  inputRef: Ref<HTMLInputElement> = createRef();
  
  // Store bound handler methods as properties for proper cleanup
  private traitInputsHandlerBound = this.traitInputsHandlers.bind(this);
  private traitStylesHandlerBound = this.traitStylesHandlers.bind(this);
  private mouseEnterHandlerBound = this.mouseEnterHandler.bind(this);
  private mouseLeaveHandlerBound = this.mouseLeaveHandler.bind(this);
  private dragEnterHandlerBound = this.dragEnterHandler.bind(this);
  private dropHandlerBound = this.dropHandler.bind(this);
  private dragLeaveHandlerBound = this.dragLeaveHandler.bind(this);
  private onContextMenuBound = this.onContextMenu.bind(this);
  private selectComponentActionClickBound = (e) => {
    if (!this.isViewMode) {
      this.selectComponentAction(e);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  @state()
  displayErrorPanel: any;
  @state()
  errors: any = {};

  @state()
  runtimeStyles: any = {};

  registerCallback(inputName: string, callback: any) {
    this.callbacks[inputName] = callback;
  }

  unregisterCallback(inputName: string) {
    delete this.callbacks[inputName];
  }

  
  constructor() {
    super();
    const newPlatform = getVar("global", "currentPlatform")?.value ?? {
      platform: "desktop",
      isMobile: false,
    };
    this.currentPlatform = newPlatform;
    this.ExecuteInstance = ExecuteInstance;
    
    // $hoveredComponent.listen((hoveredComponent: ComponentElement) => {
    //   this.hoveredComponent = hoveredComponent;
    //     });

        const context =   $context.get()
 

      if(this.currentPlatform?.platform !== newPlatform.platform){
        setTimeout(() => {
          //clearComponentRuntimeStyleAttributes()
        }, 0);
      }
      if (!this.isViewMode) {
        // this.inputRef?.value?.style?.setProperty("pointer-events", "none");
      } else {
        //this.inputRef?.value?.style?.setProperty("pointer-events", "auto");
      }
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    this.isConnected2 = true;
    this.traitInputsHandlers();
    this.traitStylesHandlers();
  }

  async traitInputHandler(input: any, inputName: string): Promise<void> {
    // console.log("inputName", inputName);
    if (isServer) {
      return;
    }
    if (!this.ExecuteInstance.PropertiesProxy[this.component.name]) {
       this.ExecuteInstance.PropertiesProxy[this.component.name] = {};
    }
    if (input) {
      if (input?.type === "handler") {
        return new Promise((resolve, reject) => {
          try {
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
          } catch (e) {
            this.errors[inputName] = {
                error: e.message,
            }
            console.error(e)
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
    this.errors = {};
    const handlerPromises = [];
    if (this.component?.input) {
      for (const [inputName, input] of Object.entries(this.component?.input)) {
        const inputToTrait = Editor.getComponentBreakpointInput(this.component, inputName);
        handlerPromises.push(this.traitInputHandler(inputToTrait, inputName));
      }
      try {
          Promise.all(handlerPromises);
      } catch(e) {
        console.log(e)
      }
    }
    addlogDebug(
      {
        errors: {
          component: {
            ...this.component,
            errors: {...this.errors}
          },
        }
      }
    );
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
      this.stylesHandlersValue = {};
      for (const [styleName, style] of Object.entries(this.component?.styleHandlers)) {
        handlerPromises.push(this.traitStyleHandler(style, styleName));
      }
      Promise.all(handlerPromises);
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
    const { innerAlignment } = this.inputHandlersValue;
    if (innerAlignment) {
      this.style.removeProperty("align-self");
      this.style.removeProperty("margin");
      this.style.removeProperty("margin-left");

      switch (innerAlignment) {
        case "end":
          this.style.setProperty("margin-left", "auto");
          break;
        case "middle":
          this.style.setProperty("align-self", "center");
          this.style.setProperty("margin", "auto");
          break;
      }
    }
    const { width, height, cursor } = this.calculatedStyles;

    if (width) {
      const widthUnit = Utils.extractUnit(width);
      if (widthUnit === '%') {
        this.style.width = width;
      }
    }
    if (cursor) {
      this.style.cursor = cursor;
    }
  }
  

  override async update(changedProperties: PropertyValueMap<any>) {
    super.update(changedProperties);
  
    changedProperties.forEach(async (_oldValue, propName) => {
      if (propName === "component") {
        if (changedProperties.get("component")?.event?.onInit !== this.component?.event?.onInit) {
          executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.onInit`), {}, this.item);
        }
         
        if(changedProperties.get("component")?.uuid !== this.component?.uuid) {
          this.traitInputsHandlers();
          this.traitStylesHandlers();
        }
      }
    });
  }
  
  onContextMenu(e: MouseEvent) {
    if (!this.isViewMode) {
      this.selectComponentAction(e)
      e.preventDefault();
      e.stopPropagation();
      const rect = this.inputRef.value?.getBoundingClientRect();
      if (rect) {
        e["ComponentTop"] = rect.top;
        e["ComponentLeft"] = rect.left;
        e["ComponentBottom"] = rect.bottom;
        e["ComponentHeight"] = rect.height;
        setContextMenuEvent(e);
      }
    }
  }
  
  override async connectedCallback() {
    super.connectedCallback();
    if(!this.isViewMode) {
    const sub2 = Utils.createStoreObservable($hoveredComponent).subscribe((hoveredComponent: any) => {
      this.hoveredComponent = hoveredComponent;
    });
    this.subscription.add(sub2);

    // @todo:eventleak
   const sub3 = eventDispatcher.on('Vars:selectedComponents', ()=>{
      console.log("Vars:selectedComponents")
      this.currentSelection = Array.from(ExecuteInstance.Vars.selectedComponents ).map(
        c=> c.uuid
      );
      EditorInstance.currentSelection = this.currentSelection ;;
    })
    this.subscription.add(sub3)
  }

  

    // Subscribe to runtime style changes
    const styleSubscription = $runtimeStylescomponentStyleByID(this.component?.uuid).subscribe((styles) => {
      this.runtimeStyles = styles;
      this.requestUpdate();
    });
    this.subscription.add(styleSubscription);

    // Subscribe to component property changes
    const propertySubscription = eventDispatcher.on(
      `component-property-changed:${String(this.component.name)}`, 
      async(data) => {
        // console.log( `component-property-changed:${String(this.component.name)}` , data)
         this.traitInputsHandlers();
        this.traitStylesHandlers();
        // this.requestUpdate()

      }
    );
    this.subscription.add(propertySubscription);

    // Subscribe to component updates
    const updateSubscription = eventDispatcher.on(
      `component-updated:${String(this.component.uuid)}`,
      async (data) => {
        setTimeout(() => {
          this.traitInputsHandlers();
        this.requestUpdate();
        }, 0);
      }
    );
    this.subscription.add(updateSubscription);

    // Add event listeners using the bound references
    this.addEventListener("contextmenu", this.onContextMenuBound);
    this.closestGenericComponentWrapper = this.closest('generik-component-wrapper');
    this.addEventListener("mouseenter", this.mouseEnterHandlerBound);
    this.addEventListener("mouseleave", this.mouseLeaveHandlerBound);
    this.addEventListener("click", this.selectComponentActionClickBound);
    this.addEventListener("dragenter", this.dragEnterHandlerBound);
    this.addEventListener("drop", this.dropHandlerBound);
    this.addEventListener("dragleave", this.dragLeaveHandlerBound);

    // Subscribe to keydown events
    const keydownSubscription = eventDispatcher.on("keydown", ({ key, selectedComponents }) => {
      if (key === "Enter") {
        if (selectedComponents.length === 1 && this.component.uuid === selectedComponents[0]) {
          this.isEditable = true;
        }
      }
    });
    this.subscription.add(keydownSubscription);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();

    // Clean up all subscriptions
    this.subscription.unsubscribe();
    
    this.isConnected2 = false;
    
    // Remove event listeners using the same bound references that were used to add them
    this.removeEventListener("contextmenu", this.onContextMenuBound);
    this.removeEventListener("mouseenter", this.mouseEnterHandlerBound);
    this.removeEventListener("mouseleave", this.mouseLeaveHandlerBound);
    this.removeEventListener("click", this.selectComponentActionClickBound);
    this.removeEventListener("dragenter", this.dragEnterHandlerBound);
    this.removeEventListener("drop", this.dropHandlerBound);
    this.removeEventListener("dragleave", this.dragLeaveHandlerBound);
  }

  // Event handler methods
  private mouseEnterHandler(e: Event) {
    if (!this.isViewMode) {
      setHoveredComponentAction(this.component);
    }
  }

  private mouseLeaveHandler(e: Event) {
    if (!this.isViewMode) {
      setHoveredComponentAction(null);
    }
  }

  private dragEnterHandler() {
    const wrappers = this.shadowRoot?.querySelectorAll('drag-wrapper') || [];
    wrappers.forEach(wrapper => {
      wrapper.dispatchEvent(new CustomEvent("drag-over-component", {
        bubbles: true,
        composed: true,
      }));
    });
  }

  private dropHandler() {
    const wrappers = this.shadowRoot?.querySelectorAll('drag-wrapper') || [];
    wrappers.forEach(wrapper => {
      wrapper.dispatchEvent(new CustomEvent("drag-leave-component", {
        bubbles: true,
        composed: true,
      }));
    });
  }

  private dragLeaveHandler() {
    const wrappers = this.shadowRoot?.querySelectorAll('drag-wrapper') || [];
    wrappers.forEach(wrapper => {
      wrapper.dispatchEvent(new CustomEvent("drag-leave-component", {
        bubbles: true,
        composed: true,
      }));
    });
  }

  protected get shouldDisplay(): boolean {
    return (
      this.inputHandlersValue?.display === undefined ||
      this.inputHandlersValue?.display
    );
  }
  
  renderComponent() {
    // Implementation in child classes
  }

  getStyles() {
    return {
      ...Editor.getComponentStyles(this.component),
      ...this.stylesHandlersValue,
      width: Utils.extractUnit(Editor.getComponentStyle(this.component, "width")) === "%" ? "100%" : Editor.getComponentStyle(this.component, "width") ?? "auto",
      ...this.runtimeStyles
    };
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
  
  selectComponentAction(e) {
    let currentSelection = getVar("global", "selectedComponents")?.value || [];
    // if (e.metaKey) {
    //   currentSelection.push(this.component.uuid);
    // } else if (e.shiftKey) {
    //   currentSelection = currentSelection.filter((uuid) => uuid !== this.component.uuid);
    // } else {
    //   currentSelection = [this.component.uuid];
    // }
    //setVar("global", "selectedComponents", [...currentSelection]);
    this.currentSelection = Array.from([this.component.uuid]);
    EditorInstance.currentSelection = Array.from([this.component.uuid]);;
    ExecuteInstance.VarsProxy.selectedComponents = Array.from([this.component])

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
        ${this.renderError()}
        ${this.item?.index === 0 || this.item?.index === undefined ?
          html`
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
              .component=${this.component }
              .selectedComponent=${{...this.selectedComponent}}
              .hoveredComponent=${{...this.hoveredComponent} }
            ></component-title>
            `
          : nothing
        }
        <resize-wrapper
          .hoveredComponent=${{...this.hoveredComponent} }
          .isSelected=${EditorInstance.currentSelection.includes(this.component.uuid)}
          .component=${{ ...this.component }}
          .selectedComponent=${{ ...this.selectedComponent }}
          .inputRef=${this.inputRef}
          style="width: fit-content; height: fit-content;"
        ></resize-wrapper>
        <drag-wrapper
          .where=${"before"}
          .message=${"Drop before"}
          .component=${{ ...this.component }}
          .inputRef=${this.inputRef}
          .isDragInitiator=${this.isDragInitiator}
        ></drag-wrapper>
      `: nothing} 
      ${this.renderComponent()}
      ${!this.isViewMode ? html` 
        <drag-wrapper
          .where=${"after"}
          .message=${"Drop after"}
          .component=${{ ...this.component }}
          .inputRef=${this.inputRef}
          .isDragInitiator=${this.isDragInitiator}
        ></drag-wrapper> 
      `: nothing}
    `;
  }
  
  renderError(): unknown {
    const error = $debug.get()?.error?.components?.[this.component.uuid]?.errors;
    if(hasOnlyEmptyObjects(error ?? {})) {
      return nothing;
    }
    return html`
      <div
        @mouseenter=${() => {
          this.displayErrorPanel = true;
        }}
        @mouseleave=${() => {
          this.displayErrorPanel = false;
        }}
        style="position:absolute"
      >
        <hy-icon 
          name="info-circle" 
          style="
            z-index: 1000;
            --hybrid-icon-width: 20px;
            --hybrid-icon-height: 25px;
            --hybrid-icon-color: red; position: absolute
          "
        >Error</hy-icon>
        
        ${this.displayErrorPanel ? html`
          <div style="
            margin-top: 20px;
            position: absolute;
            z-index: 1001;
            background: white;
            padding: 5px;
            border-radius: 4px;
            font-weight: 400;
            font-size: 14px;
            color: #c33d3d;
            border-radius: 18px;
            border: 1px solid;
            font-size: 12px;
          ">
            <pre>${JSON.stringify(error, null, 2)}</pre>
          </div>
        `: nothing}
      </div>
    `;
  }
}

function hasOnlyEmptyObjects(error) {
  if (!error || Object.keys(error).length === 0) {
    return true; // The root object is empty
  }

  return Object.values(error).every(value =>
    typeof value === 'object' && value !== null && Object.keys(value).length === 0
  );
}