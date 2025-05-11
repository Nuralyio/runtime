import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { createRef, type Ref } from "lit/directives/ref.js";
import { type ComponentElement, ComponentType } from "$store/component/interface.ts";
import styles from "./ResizeWrapper.style.ts";
import { classMap } from "lit/directives/class-map.js";
import { $pageZoom, $showBorder } from "$store/page.ts";
import { updateComponentAttributes } from "$store/actions/component/updateComponentAttributes.ts";
import { setResizing } from "$store/actions/page/setResizing.ts";
import { eventDispatcher } from "@utils/change-detection.ts";

@customElement("resize-wrapper")
export class ResizeWrapper extends LitElement {
  static styles = styles;
  
  // Component type lists
  onlyWidthResizableComponents = [
    ComponentType.TextInput, 
    ComponentType.Select, 
    ComponentType.DatePicker, 
    ComponentType.Button, 
    ComponentType.Checkbox
  ];
  notResizableComponents = [];
  
  // Properties
  @property({ type: Object }) component: ComponentElement;
  @property({ type: Object }) selectedComponent: ComponentElement;
  @property({ type: Boolean }) isSelected = false;
  @property({ type: Object }) hoveredComponent: ComponentElement;
  @property({ type: Object }) inputRef: Ref<HTMLInputElement> = createRef();
  
  // State
  @state() styles: any = {
    lines: {
      top: { width: "0" },
      bottom: { width: "0", marginTop: "0" },
      left: { width: "0", marginTop: "0" },
      right: { height: "0", marginLeft: "0" }
    },
    points: {
      leftTop: {}, rightTop: {}, middleTop: {},
      leftBottom: {}, rightBottom: {}, middleBottom: {}
    }
  };

  // Config and state values
  minimum_size = 20;
  @state() original_width = 0;
  @state() original_height = 0;
  @state() original_x = 0;
  @state() original_y = 0;
  @state() original_mouse_x = 0;
  @state() original_mouse_y = 0;
  @state() slotDOMRect: DOMRect;
  @state() currentResizer;
  @state() zoomLevel;
  @state() showBorder = false;

  constructor() {
    super();
    $showBorder.subscribe((showBorder) => {
      this.showBorder = showBorder;
    });
  }

  // Lifecycle methods
  connectedCallback(): void {
    super.connectedCallback();
    eventDispatcher.on("refresh:resize"+this.component.uuid, () => {
      this.firstUpdated();
    });

    window.addEventListener("mouseup", this.stopResize);
    $pageZoom.subscribe((pageZoom: string) => {
      this.zoomLevel = Number(pageZoom);
      this.firstUpdated();
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("mouseup", this.stopResize);
    if (!this.notResizableComponents.includes(this.component.component_type)) {
      window.removeEventListener("mousemove", this.resize);
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has("inputRef")) {
      clearTimeout(this._debounceInputRef);
      this._debounceInputRef = setTimeout(() => {
        this.observeInputRef();
      }, 200);
    }

    if (changedProperties.has("component")) {
      clearTimeout(this._debounceComponent);
      this._debounceComponent = setTimeout(() => {
        this.firstUpdated();
      }, 200);
    }
  }

  // Helpers
  observeInputRef() {
    if (this.inputRef?.value) {
      const observer = new MutationObserver(() => this.firstUpdated());
      observer.observe(this.inputRef.value, { 
        attributes: true, 
        childList: true, 
        subtree: true 
      });
    }
  }

  extractNumber(str) {
    const match = str?.match(/\d+/);
    return match ? Number(match[0]) : null;
  }

  // Resize handlers
  resize = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const resizer = this.currentResizer.classList;
    const el = this.inputRef.value;
    const width = this.original_width + (e.pageX - this.original_mouse_x);
    const height = this.original_height + (e.pageY - this.original_mouse_y);
    const inverseWidth = this.original_width - (e.pageX - this.original_mouse_x);
    const inverseHeight = this.original_height - (e.pageY - this.original_mouse_y);
    const canResizeHeight = !this.onlyWidthResizableComponents.includes(this.component.component_type);
    
    if (resizer.contains("resizer-point-right-bottom")) {
      if (width > this.minimum_size) el.style.width = width + "px";
      if (height > this.minimum_size && canResizeHeight) {
        el.style.height = height + "px";
      }
    } else if (resizer.contains("resizer-point-left-bottom")) {
      if (height > this.minimum_size && canResizeHeight) {
        el.style.height = height + "px";
      }
      if (inverseWidth > this.minimum_size) {
        el.style.width = inverseWidth + "px";
        el.style.left = this.original_x + (e.pageX - this.original_mouse_x) + "px";
      }
    } else if (
      resizer.contains("resizer-line-bottom") ||
      resizer.contains("resizer-point-middle-top") ||
      resizer.contains("resizer-point-middle-bottom")
    ) {
      if (height > this.minimum_size && canResizeHeight) {
        el.style.height = height + "px";
      }
    } else if (resizer.contains("resizer-point-left-top")) {
      if (inverseWidth > this.minimum_size) {
        el.style.width = inverseWidth + "px";
        el.style.left = this.original_x + (e.pageX - this.original_mouse_x) + "px";
      }
      if (inverseHeight > this.minimum_size && canResizeHeight) {
        el.style.height = inverseHeight + "px";
        el.style.top = this.original_y + (e.pageY - this.original_mouse_y) + "px";
      }
    } else if (resizer.contains("resizer-point-right-top")) {
      if (width > this.minimum_size) {
        el.style.width = width + "px";
      }
      if (inverseHeight > this.minimum_size && canResizeHeight) {
        el.style.height = inverseHeight + "px";
        el.style.top = this.original_y + (e.pageY - this.original_mouse_y) + "px";
      }
    }

    setTimeout(() => {
      this.firstUpdated();
    });
    setTimeout(() => {
      this.applyResize();
    }, 1000);
  };

  stopResize = () => {
    window.removeEventListener("mousemove", this.resize);
    setTimeout(() => setResizing(false));
  };

  mouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);
    this.currentResizer = e.target;
    this.original_width = this.inputRef.value.offsetWidth;
    this.original_height = this.inputRef.value.offsetHeight;
    this.original_x = this.inputRef.value.getBoundingClientRect().left;
    this.original_y = this.inputRef.value.getBoundingClientRect().top;
    this.original_mouse_x = e.pageX;
    this.original_mouse_y = e.pageY;

    if (!this.notResizableComponents.includes(this.component.component_type)) {
      window.addEventListener("mousemove", this.resize);
    }
  };

  // Updates
  firstUpdated() {
    const marginLeft = this.extractNumber(this.component.style?.['margin-left']); 
    const marginRight = this.extractNumber(this.component.style?.['margin-right']); 
    const marginTop = this.extractNumber(this.component.style?.['margin-top']);
    const marginBottom = this.extractNumber(this.component.style?.['margin-bottom']);
     
    requestAnimationFrame(() => {
      this.slotDOMRect = this.inputRef.value?.getBoundingClientRect();
      const originalWidth = this.inputRef.value?.offsetWidth + marginLeft + marginRight;
      const originalHeight = this.inputRef.value?.offsetHeight + marginTop + marginBottom;
      
      const width = originalWidth;
      const height = originalHeight;
      const widthPixel = `${width}px`;
      const heightPixel = `${height}px`;
      
      this.styles = {
        lines: {
          top: { width: widthPixel },
          bottom: { width: widthPixel, marginTop: heightPixel },
          right: { height: heightPixel, marginLeft: widthPixel },
          left: { height: heightPixel }
        },
        points: {
          leftTop: { marginLeft: "-1px" },
          rightTop: { marginLeft: `${width - 3}px` },
          middleTop: { marginLeft: `${width / 2 - 3}px` },
          leftBottom: { marginTop: `${height - 2}px`, marginLeft: `-1px` },
          rightBottom: { marginLeft: `${width - 3}px`, marginTop: `${height - 2}px` },
          middleBottom: { marginLeft: `${width / 2 - 3}px`, marginTop: `${height - 2}px` }
        }
      };
      
      this.requestUpdate();
    });
  }

  applyResize = () => {
    const el = this.inputRef.value;
    const type = this.component.component_type;
    const uuid = this.component.uuid;
    const appId = this.component.application_id;
    
    if (type === ComponentType.Button) {
      updateComponentAttributes(appId, uuid, "style", {
        "--hybrid-button-width": el.style.width
      });
    } else if (type === ComponentType.Icon) {
      updateComponentAttributes(appId, uuid, "style", {
        "--hybrid-icon-width": el.style.width,
        "--hybrid-icon-height": el.style.height
      });
    } else if (type === ComponentType.Select) {
      updateComponentAttributes(appId, uuid, "style", {
        "--hybrid-select-width": el.style.width
      });
    } else if (type === ComponentType.TextInput || type === ComponentType.DatePicker) {
      updateComponentAttributes(appId, uuid, "style", {
        width: el.style.width
      });
    } else {
      updateComponentAttributes(appId, uuid, "style", {
        width: el.style.width,
        height: el.style.height
      });
    }
  };

  // Render
  render() {
    return html`
      <div class=${classMap({
        element: true,
        hovered: this.hoveredComponent?.uuid === this.component.uuid && !this.isSelected,
        bordered: this.showBorder,
        selected: this.isSelected
      })}>
        <div @mousedown=${this.mouseDown} class="resizer-point-left-top" 
             style=${styleMap(this.styles.points?.leftTop)}></div>
        <div @mousedown=${this.mouseDown} class="resizer-point-right-top" 
             style=${styleMap(this.styles.points?.rightTop)}></div>
        <div @mousedown=${this.mouseDown} class="resizer-point-middle-top" 
             style=${styleMap(this.styles.points?.middleTop)}></div>
        <div @mousedown=${this.mouseDown} class="resizer-point-left-bottom" 
             style=${styleMap(this.styles.points?.leftBottom)}></div>
        <div @mousedown=${this.mouseDown} class="resizer-point-right-bottom" 
             style=${styleMap(this.styles.points?.rightBottom)}></div>
        <div @mousedown=${this.mouseDown} class="resizer-point-middle-bottom" 
             style=${styleMap(this.styles.points?.middleBottom)}></div>
        
        <div class="resizer-line-top" style=${styleMap(this.styles.lines.top)}></div>
        <div class="resizer-line-bottom" style=${styleMap(this.styles.lines.bottom)}></div>
        <div class="resizer-line-right" style=${styleMap(this.styles.lines.right)}></div>
        <div class="resizer-line-left" style=${styleMap(this.styles.lines.left)}></div>
        
        <slot @slotchange="${() => {}}"></slot>
      </div>
    `;
  }
}