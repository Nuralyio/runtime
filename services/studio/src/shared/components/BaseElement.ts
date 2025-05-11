import { html, LitElement, nothing, type PropertyValueMap, type PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import { type ComponentElement, type DraggingComponentInfo } from "$store/component/interface.ts";
import { eventDispatcher } from "@utils/change-detection.ts";
import { executeCodeWithClosure, ExecuteInstance } from "../../core/Kernel.ts";
import { getNestedAttribute, hasOnlyEmptyObjects } from "@utils/object.utils.ts";
import { isServer } from "@utils/envirement.ts";
import Editor from "core/Editor.ts";
import EditorInstance, { getInitPlatform } from "core/Editor.ts";
import { createRef, type Ref } from "lit/directives/ref.js";
import { $hoveredComponent, $runtimeStylescomponentStyleByID } from "$store/component/store.ts";
import { setHoveredComponentAction } from "$store/actions/component/setHoveredComponentAction.ts";
import "../wrappers/GenerikWrapper/DragWrapper/DragWrapper.ts";
import { Utils } from "core/Utils.ts";
import { setContextMenuEvent } from "$store/actions/page/setContextMenuEvent.ts";
import { addlogDebug } from "$store/actions/debug/store.ts";
import { $debug } from "$store/debug.ts";
import { Subscription } from "rxjs";
import "./ZBase/HandlerComponentError.ts";

export class BaseElementBlock extends LitElement {
  @property({ type: Object }) component: ComponentElement;
  @property({ type: Object, reflect: true }) item: any;
  @property({ type: Boolean }) isViewMode = false;
  
  @state() inputHandlersValue: any = {};
  @state() stylesHandlersValue: any = {};
  @state() callbacks: any = {};
  @state() isEditable = false;
  @state() hoveredComponent: ComponentElement;
  @state() isDragInitiator = false;
  @state() closestGenericComponentWrapper: HTMLElement;
  @state() selectedComponent: ComponentElement;
  @state() draggingComponentInfo: DraggingComponentInfo;
  @state() currentSelection: any = [];
  @state() calculatedStyles: any = {};
  @state() isConnected2 = false;
  @state() displayErrorPanel: any;
  @state() errors: any = {};
  @state() runtimeStyles: any = {};
  @state() inputRef: Ref<HTMLInputElement> = createRef();
  
  ExecuteInstance: any;
  currentPlatform: any;
  componentStyles: any = {};
  private subscription = new Subscription();
  eventsManager = [];

  // Bound event handlers
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

  constructor() {
    super();
    this.ExecuteInstance = ExecuteInstance;
    this.currentPlatform = ExecuteInstance.Vars.currentPlatform ?? getInitPlatform();
  }

  registerCallback(inputName: string, callback: any) {
    this.callbacks[inputName] = callback;
  }

  unregisterCallback(inputName: string) {
    delete this.callbacks[inputName];
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    this.isConnected2 = true;
    this.traitInputsHandlers();
    this.traitStylesHandlers();
    
    const hash = window.location.hash.replace("#", "");
    if(hash && this.id == hash) this.scrollToTarget();

    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace("#", "");
      if(hash && this.id == hash) this.scrollToTarget();
    });

    eventDispatcher.on("Vars:currentPlatform", () => {
      this.traitInputsHandlers();
      this.traitStylesHandlers();
    });

    eventDispatcher.on("Vars:currentEditingMode", () => {
      if(getNestedAttribute(this.component, `event.onInit`)) {
        executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.onInit`), {}, {...this.item});
      }
    });
  }

  async traitInputHandler(input: any, inputName: string): Promise<void> {
    if (isServer || !input) return;

    const proxy = this.ExecuteInstance.PropertiesProxy;
    proxy[this.component.name] ??= {};

    if (input.type === "handler") {
      try {
        const rawValue = getNestedAttribute(this.component, `input.${inputName}`).value;
        const fn = executeCodeWithClosure(this.component, rawValue, undefined, { ...this.item });
        const result = Utils.isPromise(fn) ? await fn : fn;
        
        if (this.inputHandlersValue[inputName] !== result) {
          this.inputHandlersValue[inputName] = result;
          proxy[this.component.name][inputName] = result;
        }

        this.callbacks?.[inputName]?.(result);
      } catch (e) {
        this.errors[inputName] = { error: e.message };
        console.error(getNestedAttribute(this.component, `input.${inputName}`).value);
        throw e;
        console.error(e);
      }
    } else {
      const { value } = input;
      if (this.inputHandlersValue[inputName] !== value) {
        this.inputHandlersValue[inputName] = value;
        proxy[this.component.name][inputName] = value;
      }

      if (inputName === "id") this.id = value;
      this.callbacks?.[inputName]?.(value);
    }
  }

  async traitInputsHandlers() {
    this.errors = {};
    try {
      await Promise.all(
        Object.entries(Editor.getComponentBreakpointInputs(this.component)).map(
          ([inputName]) => this.traitInputHandler(
            Editor.getComponentBreakpointInput(this.component, inputName),
            inputName
          )
        )
      );
    } catch (e) {
      console.log(e);
    }

    addlogDebug({
      errors: {
        component: {
          ...this.component,
          errors: { ...this.errors },
        },
      },
    });
  }

  async traitStyleHandler(style: any, styleName: string): Promise<void> {
    if (isServer || !style) return;

    if (style.startsWith("return ")) {
      try {
        const fn = executeCodeWithClosure(this.component, style);
        if (fn && this.stylesHandlersValue[styleName] !== fn) {
          this.stylesHandlersValue[styleName] = fn;
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      this.stylesHandlersValue[styleName] = style;
    }
  }

  async traitStylesHandlers() {
    if (this.component?.styleHandlers) {
      this.stylesHandlersValue = {};
      await Promise.all(
        Object.entries(this.component.styleHandlers).map(
          ([name, style]) => this.traitStyleHandler(style, name)
        )
      );
    }
    this.calculateStyles();
  }

  private calculateStyles() {
    this.calculatedStyles = { ...Editor.getComponentStyles(this.component), ...this.calculatedStyles };
    const { innerAlignment } = this.inputHandlersValue;

    if (innerAlignment) {
      this.style.removeProperty("align-self");
      this.style.removeProperty("margin");
      this.style.removeProperty("margin-left");

      if (innerAlignment === "end") this.style.setProperty("margin-left", "auto");
      else if (innerAlignment === "middle") {
        this.style.setProperty("align-self", "center");
        this.style.setProperty("margin", "auto");
      }
    }

    const { width, height, cursor, flex } = this.calculatedStyles;
    if (width && Utils.extractUnit(width) === "%") this.style.width = width;
    if (flex) this.style.flex = flex;
    if (cursor) this.style.cursor = cursor;
  }

  override async update(changedProperties: PropertyValueMap<any>) {
    super.update(changedProperties);

    changedProperties.forEach((_old, prop) => {
      if (prop !== "component") return;

      const prev = changedProperties.get("component");
      const curr = this.component;

      if (prev?.event?.onInit !== curr?.event?.onInit) {
        executeCodeWithClosure(curr, getNestedAttribute(curr, "event.onInit"), {}, this.item);
      }

      if (prev?.uuid !== curr?.uuid) {
        this.traitInputsHandlers();
        this.traitStylesHandlers();
      }
    });
  }

  onContextMenu(e: MouseEvent) {
    if (this.isViewMode) return;
    this.selectComponentAction(e);
    e.preventDefault();
    e.stopPropagation();
    
    const rect = this.inputRef.value?.getBoundingClientRect();
    if (rect) {
      Object.assign(e, {
        ComponentTop: rect.top,
        ComponentLeft: rect.left,
        ComponentBottom: rect.bottom,
        ComponentHeight: rect.height,
      });
      setContextMenuEvent(e);
    }
  }

  override async connectedCallback() {
    super.connectedCallback();
    
    if(!this.isViewMode) {
      this.subscription.add(
        Utils.createStoreObservable($hoveredComponent).subscribe((hoveredComponent: any) => {
          this.hoveredComponent = hoveredComponent;
        })
      );

      this.subscription.add(
        eventDispatcher.on('Vars:selectedComponents', () => {
          this.currentSelection = Array.from(ExecuteInstance.Vars.selectedComponents).map((c:any) => c.uuid);
          EditorInstance.currentSelection = this.currentSelection;
        })
      );
    }
    
    // Subscribe to runtime styles
    this.subscription.add(
      $runtimeStylescomponentStyleByID(this.component?.uuid).subscribe((styles) => {
        this.runtimeStyles = styles;
        this.requestUpdate();
      })
    );

    // Subscribe to property changes and updates
    this.subscription.add(
      eventDispatcher.on(`component-property-changed:${String(this.component.name)}`, async() => {
        this.traitInputsHandlers();
        this.traitStylesHandlers();
      })
    );
    
    this.subscription.add(
      eventDispatcher.on(`component-updated:${String(this.component.uuid)}`, async () => {
        setTimeout(() => {
          this.traitInputsHandlers();
          this.traitStylesHandlers();
          this.requestUpdate();
        }, 0);
      })
    );

    // Set up event listeners
    this.closestGenericComponentWrapper = this.closest('generik-component-wrapper');
    this.eventsManager = [
      ["contextmenu", this.onContextMenuBound],
      ["mouseenter", this.mouseEnterHandlerBound],
      ["mouseleave", this.mouseLeaveHandlerBound],
      ["click", this.selectComponentActionClickBound],
      ["dragenter", this.dragEnterHandlerBound],
      ["drop", this.dropHandlerBound],
      ["dragleave", this.dragLeaveHandlerBound],
    ];

    this.eventsManager.forEach(([event, handler]) => this.addEventListener(event, handler));

    // Subscribe to keydown events
    this.subscription.add(
      eventDispatcher.on("keydown", ({ key, selectedComponents }) => {
        if (key === "Enter" && selectedComponents.length === 1 && 
            this.component.uuid === selectedComponents[0]) {
          this.isEditable = true;
        }
      })
    );
  }

  scrollToTarget() {
    if (this.inputRef.value) {
      this.inputRef.value.scrollIntoView({ behavior: 'smooth' });
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.subscription.unsubscribe();
    this.isConnected2 = false;
    this.eventsManager.forEach(([event, handler]) => this.removeEventListener(event, handler));
  }

  // Event handlers consolidated for brevity
  private mouseEnterHandler() {
    if (!this.isViewMode) setHoveredComponentAction(this.component);
  }

  private mouseLeaveHandler() {
    if (!this.isViewMode) setHoveredComponentAction(null);
  }

  private handleDragEvent(eventType: string) {
    this.shadowRoot?.querySelectorAll('drag-wrapper')?.forEach(wrapper =>
      wrapper.dispatchEvent(new CustomEvent(eventType, { bubbles: true, composed: true }))
    );
  }

  private dragEnterHandler() {
    this.handleDragEvent("drag-over-component");
  }

  private dropHandler() {
    this.handleDragEvent("drag-leave-component");
  }

  private dragLeaveHandler() {
    this.handleDragEvent("drag-leave-component");
  }

  protected get shouldDisplay(): boolean {
    return (this.inputHandlersValue?.display === undefined || this.inputHandlersValue?.display);
  }

  renderComponent() {
    // Implementation in child classes
  }

  getStyles() {
    const width = Editor.getComponentStyle(this.component, "width");
    return {
      ...Editor.getComponentStyles(this.component),
      ...this.stylesHandlersValue,
      width: width === "auto" ? "auto" : 
             Utils.extractUnit(width) === "%" ? "100%" : width ?? "auto",
      ...this.runtimeStyles,
    };
  }

  executeEvent(eventName: string, event?: Event, data?: any) {
    if (this.isViewMode) {
      const code = this.component.event?.[eventName];
      if (code) {
        executeCodeWithClosure(
          this.component,
          getNestedAttribute(this.component, `event.${eventName}`),
          { event, ...data },
          this.item
        );
      }
      return;
    }
  
    if (eventName === "onClick" && event) this.selectComponentAction(event);
  }

  selectComponentAction(_e: Event) {
    this.currentSelection = Array.from([this.component.uuid]);
    EditorInstance.currentSelection = Array.from([this.component.uuid]);
    ExecuteInstance.VarsProxy.selectedComponents = Array.from([this.component]);
  }

  renderError(): unknown {
    const error = $debug.get()?.error?.components?.[this.component.uuid]?.errors;
    if (hasOnlyEmptyObjects(error ?? {})) return nothing;
  
    return html`
      <div @mouseenter=${() => this.displayErrorPanel = true}
           @mouseleave=${() => this.displayErrorPanel = false}
           style="position:absolute">
        <hy-icon name="info-circle" 
                 style="z-index: 1000; --hybrid-icon-width: 20px; --hybrid-icon-height: 25px; --hybrid-icon-color: red; position: absolute;">Error</hy-icon>
        ${this.displayErrorPanel ? html`<handler-component-error-block .error=${error}></handler-component-error-block>` : nothing}
      </div>
    `;
  }

  protected render(): unknown {
    if (!this.shouldDisplay) return nothing;
    
    this.componentStyles = this.calculatedStyles || {};
    const labelStyleHandlers = this.component?.styleHandlers
      ? Object.fromEntries(Object.entries(this.component?.styleHandlers)?.filter(([key, value]) => value))
      : {};

    this.componentStyles = {...this.componentStyles, ...labelStyleHandlers};
    return html`
      ${!this.isViewMode ? html`
        ${this.renderError()}
        ${[0, undefined].includes(this.item?.index) ? html`
          <component-title
            @click=${(e) => this.executeEvent("onclick", e)}
            @dragInit=${(e) => {
              this.isDragInitiator = e.detail.value;
              this.setAttribute("draggable", "true");
            }}
            @dragend=${() => { this.isDragInitiator = false; }}
            .component=${this.component}
            .selectedComponent=${{ ...this.selectedComponent }}
            .display=${EditorInstance.currentSelection.includes(this.component.uuid)}
          ></component-title>
          <resize-wrapper
            .hoveredComponent=${{ ...this.hoveredComponent }}
            .isSelected=${EditorInstance.currentSelection.includes(this.component.uuid)}
            .component=${{ ...this.component }}
            .selectedComponent=${{ ...this.selectedComponent }}
            .inputRef=${this.inputRef}
            style="width: fit-content; height: fit-content;"
          ></resize-wrapper>
          <drag-wrapper .where=${"before"} .message=${"Drop before"} .component=${{ ...this.component }}
            .inputRef=${this.inputRef} .isDragInitiator=${this.isDragInitiator}></drag-wrapper>
        ` : nothing}
      ` : nothing}
      ${this.renderComponent()}
      ${!this.isViewMode ? html`
        <drag-wrapper .where=${"after"} .message=${"Drop after"} .component=${{ ...this.component }}
          .inputRef=${this.inputRef} .isDragInitiator=${this.isDragInitiator}></drag-wrapper>
      ` : nothing}
    `;
  }
}