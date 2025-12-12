/**
 * @file BaseElementBlock.ts
 * @description Base component class that handles component rendering, events, and styles in the editor
 * @module components/base
 */

import { html, LitElement, nothing, type PropertyValueMap, type PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import { eventDispatcher } from '../../../../utils/change-detection.ts';
import { executeHandler } from '../../../../handlers/handler-executor';
import { ExecuteInstance } from '../../../../state/runtime-context';
import { getNestedAttribute, hasOnlyEmptyObjects } from '../../../../utils/object.utils.ts';
import Editor from '../../../../state/editor.ts';
import EditorInstance, { getInitPlatform } from '../../../../state/editor.ts';
import { createRef, type Ref } from "lit/directives/ref.js";
import { $hoveredComponent, $runtimeStylescomponentStyleByID } from '../../../../redux/store/component/store.ts';
import { $resizing } from '../../../../redux/store/apps.ts';
import "../wrappers/GenerikWrapper/DragWrapper/DragWrapper.ts";
import { RuntimeHelpers } from '../../../../utils/runtime-helpers.ts';
import { setContextMenuEvent } from '../../../../redux/actions/page/setContextMenuEvent.ts';
import { addlogDebug } from '../../../../redux/actions/debug/store.ts';
import { $debug } from '../../../../redux/store/debug.ts';
import { Subscription } from "rxjs";
import "./BaseElement/handler-component-error.ts";
import { scrollToTarget, setupHashScroll, traitInputHandler, traitStyleHandler } from "./BaseElement/input-handler.helpers.ts";
import { calculateStyles } from "./BaseElement/calculateStyles.ts";
import { handleMouseEnter, handleMouseLeave } from "./BaseElement/interactions.helpers.ts";
import { handleComponentEvent } from "./BaseElement/execute-event.helpers.ts";
import type { ComponentElement } from '../../../../redux/store/component/component.interface.ts';
import { v4 as uuidv4 } from "uuid";


/**
 * Base component class that serves as the foundation for all renderable components
 * in the editor. Handles component styling, events, interactions, and rendering.
 * 
 * @extends {LitElement}
 */
export class BaseElementBlock extends LitElement {
  /** @property {ComponentElement} The component data */
  @property({ type: Object }) component;
  
  /** @property {any} Data item being rendered (for lists/loops) */
  @property({ type: Object, reflect: true }) item;
  
  /** @property {boolean} Whether component is in view-only mode */
  @property({ type: Boolean }) isViewMode = false;
  
  /** @state {Object} Values from input handlers */
  @state() inputHandlersValue: any = {};
  
  /** @state {Object} Values from style handlers */
  @state() stylesHandlersValue = {};

  @property({ type: Object }) parentcomponent: ComponentElement;
  
  /** @state {Object} Registered callbacks for input handlers */
  @state() callbacks = {};
  
  /** @state {boolean} Whether component is in editable state */
  @state() isEditable = false;
  
  /** @state {ComponentElement} Currently hovered component */
  @state() hoveredComponent;
  
  /** @state {boolean} Whether this component initiated drag */
  @state() isDragInitiator = false;
  
  /** @state {HTMLElement} Reference to closest wrapper element */
  @state() closestGenericComponentWrapper;
  
  /** @state {ComponentElement} Currently selected component */
  @state() selectedComponent;
  
  /** @state {DraggingComponentInfo} Information about dragging state */
  @state() draggingComponentInfo;
  
  /** @state {Array} Currently selected components */
  @state() currentSelection = [];
  
  /** @state {Object} Calculated component styles */
  @state() calculatedStyles = {};
  
  /** @state {boolean} Whether component is connected to DOM */
  @state() isConnected2 = false;
  
  /** @state {boolean} Whether to display error panel */
  @state() displayErrorPanel;
  
  /** @state {Object} Component errors */
  @state() errors = {};
  
  /** @state {Object} Runtime styles */
  @state() runtimeStyles = {};
  
  /** @state {Ref<Element>} Reference to main input element */
  @state() inputRef = createRef();
  
  /** @type {any} Instance of execution environment */
  ExecuteInstance;
  
  /** @type {any} Current platform information */
  currentPlatform;
  
  /** @type {Object} Component style definitions */
  componentStyles = {};
  
  /** @type {Subscription} RxJS subscription for cleanup */
  private subscription = new Subscription();
  
  /** @type {Array} List of event handlers */
  eventsManager = [];

  uniqueUUID = uuidv4();

  // Bound event handlers
  /**
   * @type {Function} Bound mouse enter event handler
   * @private
   */
  private mouseEnterHandlerBound = this.mouseEnterHandler.bind(this);
  
  /**
   * @type {Function} Bound mouse leave event handler
   * @private
   */
  private mouseLeaveHandlerBound = this.mouseLeaveHandler.bind(this);
  
  /**
   * @type {Function} Bound drag enter event handler
   * @private
   */
  private dragEnterHandlerBound = this.dragEnterHandler.bind(this);
  
  /**
   * @type {Function} Bound drop event handler
   * @private
   */
  private dropHandlerBound = this.dropHandler.bind(this);
  
  /**
   * @type {Function} Bound drag leave event handler
   * @private
   */
  private dragLeaveHandlerBound = this.dragLeaveHandler.bind(this);
  
  /**
   * @type {Function} Bound context menu event handler
   * @private
   */
  private onContextMenuBound = this.onContextMenu.bind(this);
  
  /**
   * @type {Function} Bound component selection handler
   * @private
   */
  private selectComponentActionClickBound = (e) => {
    if (!this.isViewMode) {
      this.selectComponentAction(e);
      e.preventDefault();
      e.stopPropagation();
    }
  };
  
  /**
   * @type {Function} Hash change handler for scrolling
   */
  handleHash;

  /**
   * Constructor for BaseElementBlock
   */
  constructor() {
    super();
    this.ExecuteInstance = ExecuteInstance;
    this.currentPlatform = ExecuteInstance.Vars.currentPlatform ?? getInitPlatform();
    this.handleHash = () => setupHashScroll(this.inputRef as Ref<HTMLInputElement>, this.id, () => scrollToTarget(this.inputRef as Ref<HTMLInputElement>));
    this.uniqueUUID = uuidv4();
  }

  /**
   * Registers a callback function for a specific input
   * 
   * @param {string} inputName - Name of the input to register callback for
   * @param {Function} callback - Callback function to register
   */
  registerCallback(inputName, callback) {
    this.callbacks[inputName] = callback;
  }

  /**
   * Unregisters a callback function for a specific input
   * 
   * @param {string} inputName - Name of the input to unregister callback for
   */
  unregisterCallback(inputName) {
    delete this.callbacks[inputName];
  }

  /**
   * Handles first component update after initialization
   * 
   * @param {PropertyValues} _ - Changed properties
   * @protected
   * @override
   */
  protected firstUpdated(_) {
    super.firstUpdated(_);
    this.isConnected2 = true;
    this.traitInputsHandlers();
    this.traitStylesHandlers();
  
    this.handleHash();
    window.addEventListener("hashchange", this.handleHash);
  this.subscription.add(
    eventDispatcher.on("Vars:currentPlatform", () => {
      this.traitInputsHandlers();
      this.traitStylesHandlers();
    })
  )

  this.subscription.add(
    eventDispatcher.on(`component-input-refresh-request:${this.component.uuid}`, () => {
      this.traitInputsHandlers();
      this.traitStylesHandlers();
    })
  )
  this.subscription.add(

    eventDispatcher.on("Vars:currentEditingMode", () => {
      const code = getNestedAttribute(this.component, `event.onInit`);
      if (code) executeHandler(this.component, code, {}, { ...this.item });
    }))

  }

  /**
   * Processes component input handlers
   * 
   * @returns {Promise<void>}
   */
  async traitInputsHandlers() {
    this.errors = {};
    const inputs = Editor.getComponentBreakpointInputs(this.component);


    await Promise.all(Object.keys(inputs).map(name =>
      traitInputHandler(this, inputs[name], name)
    ));


    addlogDebug({
      errors: { component: { ...this.component, errors: { ...this.errors } } },
    });
  }

  /**
   * Processes component style handlers
   * 
   * @returns {Promise<void>}
   */
  async traitStylesHandlers() {
    if (this.component?.styleHandlers) {
      this.stylesHandlersValue = {};
      await Promise.all(
        Object.entries(this.component.styleHandlers).map(
          ([name, style]) => traitStyleHandler(this, style, name)
        )
      );
    }
    this.calculateStyles();
  }

  /**
   * Calculates and updates component styles
   * 
   * @private
   */
  private calculateStyles() {
    calculateStyles(this);
  }

  /**
   * Handles component updates
   * 
   * @param {PropertyValueMap<any>} changedProperties - Map of changed properties
   * @override
   */
  override update(changedProperties) {
    super.update(changedProperties);

    if (changedProperties.has("component")) {
      const prev = changedProperties.get("component");
      const curr = this.component;

      if (prev?.event?.onInit !== curr?.event?.onInit) {
        executeHandler(curr, getNestedAttribute(curr, "event.onInit"), {}, this.item);
      }
      this.component.uniqueUUID = this.uniqueUUID;
      this.component.parent = this.parentcomponent;

      // Re-process handlers on any component change
      // This ensures property updates (including pseudo-states) are reflected
      this.traitInputsHandlers();
      this.traitStylesHandlers();
      
      // Emit update event if this component is selected
     
    }
  }

  /**
   * Handles context menu events
   * 
   * @param {MouseEvent} e - Context menu event
   */
  onContextMenu(e) {
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

  /**
   * Lifecycle method when component is connected to DOM
   * 
   * @override
   */
  override async connectedCallback() {
    super.connectedCallback();
    
    // Add component-specific class for pseudo-state styling
    if (this.component?.uuid) {
      this.classList.add(`component-${this.component.uuid}`);
    }
    
    if(!this.isViewMode) {
      this.subscription.add(
        RuntimeHelpers.createStoreObservable($hoveredComponent).subscribe((hoveredComponent) => {
          this.hoveredComponent = hoveredComponent;
        })
      );

      this.subscription.add(
        eventDispatcher.on('Vars:selectedComponents', () => {
          this.currentSelection = Array.from(ExecuteInstance.Vars.selectedComponents).map((comppnent :ComponentElement) => comppnent.uuid);
          EditorInstance.currentSelection = this.currentSelection;
          
          // If this component is the selected one, emit the selection event for overlay
          if (ExecuteInstance.Vars.selectedComponents.length === 1 && 
              ExecuteInstance.Vars.selectedComponents[0]?.uuid === this.component.uuid) {
            requestAnimationFrame(() => {
              // Scroll into view only if not already visible
              if (this.inputRef.value) {
                const rect = this.inputRef.value.getBoundingClientRect();
                const isInViewport = (
                  rect.top >= 0 &&
                  rect.left >= 0 &&
                  rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                  rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                );
                
                if (!isInViewport) {
                  this.inputRef.value.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center',
                    inline: 'nearest'
                  });
                }
              }
              
              this.dispatchEvent(new CustomEvent('component-selected', {
                detail: { 
                  component: this.component, 
                  elementRef: this.inputRef 
                },
                bubbles: true,
                composed: true
              }));
            });
          }
        })
      );
    }
    
    // Subscribe to runtime styles
    this.subscription.add(
      $runtimeStylescomponentStyleByID(this.uniqueUUID).subscribe((styles) => {
        this.runtimeStyles = styles;
      })
    );
    this.subscription.add(
    eventDispatcher.on(`component:value:set:${this.uniqueUUID}`, () => {
      this.traitInputsHandlers();
      // @todo: activate this when trigger chidlren rending 
      this.component.childrenIds?.forEach((childId) => {
        eventDispatcher.emit(`component:request:refresh:${childId}`)
      })

   })   )
   this.subscription.add(
   eventDispatcher.on(`component:request:refresh:${this.component.uuid}`, () => {
    this.traitInputsHandlers();
    this.component.childrenIds?.forEach((childId) => {
      eventDispatcher.emit(`component:request:refresh:${childId}`)
    })
   })
  )
    // Subscribe to property changes and updates
    this.subscription.add(
      eventDispatcher.on(`component-property-changed:${String(this.component.name)}`, async() => {
        this.traitInputsHandlers();
        this.traitStylesHandlers();
         /** @todo:  check for event leak */
        this.component.childrenIds?.forEach((childId) => {
          eventDispatcher.emit(`component:request:refresh:${childId}`)
        })
      })
    );
    
    this.subscription.add(
      eventDispatcher.on(`component-updated:${String(this.component.uuid)}`, async () => {
        setTimeout(() => {
          this.traitInputsHandlers();
          this.traitStylesHandlers();
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

  /**
   * Lifecycle method when component is disconnected from DOM
   * 
   * @override
   */
  override disconnectedCallback() {
    super.disconnectedCallback();
    this.subscription.unsubscribe();
    this.isConnected2 = false;
    this.eventsManager.forEach(([event, handler]) => this.removeEventListener(event, handler));
  }

  /**
   * Handles mouse enter events
   * 
   * @private
   */
  private mouseEnterHandler() {
    // Don't trigger hover when resizing
    if ($resizing.get()) return;
    
    handleMouseEnter(this.isViewMode, this.component);
    
    // Emit hover event with component reference
    if (!this.isViewMode) {
      this.dispatchEvent(new CustomEvent('component-hovered', {
        detail: { 
          component: this.component, 
          elementRef: this.inputRef 
        },
        bubbles: true,
        composed: true
      }));
    }
  }
  
  /**
   * Handles mouse leave events
   * 
   * @private
   */
  private mouseLeaveHandler() {
    // Don't trigger hover clear when resizing
    if ($resizing.get()) return;
    
    handleMouseLeave(this.isViewMode);
    
    // Emit hover clear event
    if (!this.isViewMode) {
      this.dispatchEvent(new CustomEvent('component-hovered', {
        detail: { 
          component: null, 
          elementRef: null 
        },
        bubbles: true,
        composed: true
      }));
    }
  }

  /**
   * Handles drag events by dispatching to child wrappers
   * 
   * @param {string} eventType - Type of drag event
   * @private
   */
  private handleDragEvent(eventType) {
    this.shadowRoot?.querySelectorAll('drag-wrapper')?.forEach(wrapper =>
      wrapper.dispatchEvent(new CustomEvent(eventType, { bubbles: true, composed: true }))
    );
  }

  /**
   * Handles drag enter events
   * 
   * @private
   */
  private dragEnterHandler() {
    this.handleDragEvent("drag-over-component");
  }

  /**
   * Handles drop events
   * 
   * @private
   */
  private dropHandler() {
    this.handleDragEvent("drag-leave-component");
  }

  /**
   * Handles drag leave events
   * 
   * @private
   */
  private dragLeaveHandler() {
    this.handleDragEvent("drag-leave-component");
  }

  /**
   * Determines if component should be displayed
   * 
   * @returns {boolean} Whether component should be displayed
   * @protected
   */
  protected get shouldDisplay() {
    return (this.inputHandlersValue?.display === undefined || this.inputHandlersValue?.display);
  }

  /**
   * Renders the component content
   * To be implemented by child classes
   * 
   * @returns {unknown}
   */
  renderComponent() {
    // Implementation in child classes
  }

  /**
   * Generates CSS for pseudo-state styles (e.g., :hover, :focus, :active)
   * 
   * @returns {string} CSS string with pseudo-selectors
   */
  generatePseudoStateStyles() {
    const componentStyles = Editor.getComponentStyles(this.component);
    const pseudoStates = [':hover', ':focus', ':active', ':disabled'];
    let cssString = '';

    // Generate base class with regular styles (non-pseudo-state)
    const regularStyles = Object.keys(componentStyles)
      .filter(key => !pseudoStates.includes(key))
      .reduce((obj, key) => {
        obj[key] = componentStyles[key];
        return obj;
      }, {});

    const baseStyleRules = Object.entries(regularStyles)
      .map(([property, value]) => `  ${property}: ${value};`)
      .join('\n');

    if (baseStyleRules) {
      cssString += `.drop-${this.component.uuid} {\n${baseStyleRules}\n}\n`;
    }

    // Generate pseudo-state classes
    pseudoStates.forEach(pseudoState => {
      if (componentStyles[pseudoState] && typeof componentStyles[pseudoState] === 'object') {
        const pseudoStyles = componentStyles[pseudoState];
        const styleRules = Object.entries(pseudoStyles)
          .map(([property, value]) => `  ${property}: ${value};`)
          .join('\n');
        
        if (styleRules) {
          cssString += `.drop-${this.component.uuid}${pseudoState} {\n${styleRules}\n}\n`;
        }
      }
    });

    return cssString;
  }

  /**
   * Renders dynamic pseudo-state styles
   * 
   * @returns {unknown} Style tag with pseudo-selector CSS
   */
  renderPseudoStateStyles() {
    const cssString = this.generatePseudoStateStyles();
    
    if (!cssString) return nothing;
    
    return html`<style>${cssString}</style>`;
  }

  /**
   * Gets computed component styles
   * 
   * @returns {Object} Component styles
   */
  getStyles() {
    const width = Editor.getComponentStyle(this.component, "width");
    const allStyles = Editor.getComponentStyles(this.component);
    
    // Filter out pseudo-state styles (they're handled via CSS classes)
    const pseudoStates = [':hover', ':focus', ':active', ':disabled'];
    const regularStyles = Object.keys(allStyles)
      .filter(key => !pseudoStates.includes(key))
      .reduce((obj, key) => {
        obj[key] = allStyles[key];
        return obj;
      }, {});
    
    return {
      ...regularStyles,
      ...this.stylesHandlersValue,
      width: width === "auto" ? "auto" : 
             RuntimeHelpers.extractUnit(width) === "%" ? "100%" : width ?? "auto",
      ...this.runtimeStyles,
    };
  }

  /**
   * Executes a component event
   * 
   * @param {string} eventName - Name of event to execute
   * @param {Event} [event] - DOM event that triggered this
   * @param {any} [data] - Additional data for event
   */
  executeEvent(eventName, event, data= {}) {
    // if(event?.unique !== this.uniqueUUID && eventName == "onMouseEnter") {
    //   return false;
    // }
    handleComponentEvent({
      isViewMode: this.isViewMode,
      component:{ ...this.component, uniqueUUID : this.uniqueUUID},
      item: this.item,
      eventName,
      event,
      data,
      onSelect: this.selectComponentAction.bind(this),
    });
  }

  /**
   * Selects this component in the editor
   * 
   * @param {Event} _e - Event that triggered selection
   */
  selectComponentAction(_e) {
    this.currentSelection = Array.from([this.component.uuid]);
    EditorInstance.currentSelection = Array.from([this.component.uuid]);
    ExecuteInstance.VarsProxy.selectedComponents = Array.from([this.component]);
    
    // Emit event with component reference for resize wrapper
    this.dispatchEvent(new CustomEvent('component-selected', {
      detail: { 
        component: this.component, 
        elementRef: this.inputRef 
      },
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Renders error indicator and panel if component has errors
   * 
   * @returns {unknown} Error UI template
   */
  renderError() {
    const error = $debug.get()?.error?.components?.[this.component.uuid]?.errors;
    if (hasOnlyEmptyObjects(error ?? {})) return nothing;
  
    return html`
      <div @mouseenter=${() => this.displayErrorPanel = true}
           @mouseleave=${() => this.displayErrorPanel = false}
           style="position:absolute">
        <nr-icon name="info-circle" 
                 style="z-index: 1000; --nuraly-icon-width: 20px; --nuraly-icon-height: 25px; --nuraly-icon-color: red; position: absolute;">Error</nr-icon>
        ${this.displayErrorPanel ? html`<handler-component-error-block .error=${error}></handler-component-error-block>` : nothing}
      </div>
    `;
  }

  /**
   * Main render method for component
   * 
   * @returns {unknown} Component template
   * @protected
   * @override
   */
  protected render() {
    if (!this.shouldDisplay) return nothing;
    
    this.componentStyles = this.calculatedStyles || {};
    const labelStyleHandlers = this.component?.styleHandlers
      ? Object.fromEntries(Object.entries(this.component?.styleHandlers)?.filter(([key, value]) => value))
      : {};

    this.componentStyles = {...this.componentStyles, ...labelStyleHandlers};
    return html`
      ${this.renderPseudoStateStyles()}
      ${!this.isViewMode ? html`
        ${this.renderError()}
        ${[0, undefined].includes(this.item?.index) ? html`
   
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