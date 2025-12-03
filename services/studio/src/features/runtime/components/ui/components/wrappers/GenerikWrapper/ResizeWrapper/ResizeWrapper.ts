import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { createRef, type Ref } from "lit/directives/ref.js";
import { type ComponentElement, ComponentType } from '../../../../../../redux/store/component/component.interface.ts';
import styles from "./ResizeWrapper.style.ts";
import { classMap } from "lit/directives/class-map.js";
import { $pageZoom, $showBorder } from '../../../../../../redux/store/page.ts';
import { updateComponentAttributes } from '../../../../../../redux/actions/component/updateComponentAttributes.ts';
import { setResizing } from '../../../../../../redux/actions/page/setResizing.ts';
import { eventDispatcher } from '../../../../../../utils/change-detection.ts';

@customElement("resize-wrapper")
export class ResizeWrapper extends LitElement {
  static styles = styles;
  
  // Component type lists
  onlyWidthResizableComponents = [
    ComponentType.TextInput, ComponentType.Select, ComponentType.DatePicker, 
    ComponentType.Button, ComponentType.Checkbox
  ];
  notResizableComponents = [];
  
  // Properties
  @property({ type: Object }) component: ComponentElement;
  @property({ type: Object }) selectedComponent: ComponentElement;
  @property({ type: Boolean }) isSelected = false;
  @property({ type: Object }) hoveredComponent: ComponentElement;
  @property({ type: Object }) inputRef: Ref<Element> = createRef();
  
  // State and config
  @state() styles = { lines: {}, points: {} };
  minimum_size = 20;
  @state() original = { width: 0, height: 0, x: 0, y: 0, mouse_x: 0, mouse_y: 0 };
  @state() slotDOMRect: DOMRect;
  @state() currentResizer;
  @state() zoomLevel;
  @state() showBorder = false;
  private _debounceComponent: ReturnType<typeof setTimeout>;
  private _debounceInputRef: ReturnType<typeof setTimeout>;

  constructor() {
    super();
    $showBorder.subscribe(showBorder => this.showBorder = showBorder);
  }

  // Lifecycle methods
  connectedCallback(): void {
    super.connectedCallback();
    eventDispatcher.on("refresh:resize"+this.component.uuid, () => this.firstUpdated());
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
      this._debounceInputRef = setTimeout(() => this.observeInputRef(), 200);
    }

    if (changedProperties.has("component")) {
      clearTimeout(this._debounceComponent);
      this._debounceComponent = setTimeout(() => this.firstUpdated(), 200);
    }
  }

  // Helpers
  observeInputRef() {
    if (this.inputRef?.value) {
      const observer = new MutationObserver(() => this.firstUpdated());
      observer.observe(this.inputRef.value, { 
        attributes: true, childList: true, subtree: true 
      });
    }
  }

  extractNumber(str) {
    const match = str?.match(/\d+/);
    return match ? Number(match[0]) : 0;
  }

  // Resize handlers
  resize = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const resizer = this.currentResizer.classList;
    const el = this.inputRef.value;
    const { width, height, x, y, mouse_x, mouse_y } = this.original;
    const newWidth = width + (e.pageX - mouse_x);
    const newHeight = height + (e.pageY - mouse_y);
    const invWidth = width - (e.pageX - mouse_x);
    const invHeight = height - (e.pageY - mouse_y);
    const canResizeHeight = !this.onlyWidthResizableComponents.includes(this.component.component_type);
    
    const isRightBottom = resizer.contains("resizer-point-right-bottom");
    const isLeftBottom = resizer.contains("resizer-point-left-bottom");
    const isVertical = resizer.contains("resizer-line-bottom") || 
                       resizer.contains("resizer-point-middle-top") || 
                       resizer.contains("resizer-point-middle-bottom");
    const isLeftTop = resizer.contains("resizer-point-left-top");
    const isRightTop = resizer.contains("resizer-point-right-top");
    
    // Apply width changes
    if ((isRightBottom || isRightTop) && newWidth > this.minimum_size) {
      el.style.width = `${newWidth}px`;
    } else if ((isLeftBottom || isLeftTop) && invWidth > this.minimum_size) {
      el.style.width = `${invWidth}px`;
      el.style.left = `${x + (e.pageX - mouse_x)}px`;
    }
    
    // Apply height changes if allowed
    if (canResizeHeight) {
      if ((isRightBottom || isLeftBottom || isVertical) && newHeight > this.minimum_size) {
        el.style.height = `${newHeight}px`;
      } else if ((isLeftTop || isRightTop) && invHeight > this.minimum_size) {
        el.style.height = `${invHeight}px`;
        el.style.top = `${y + (e.pageY - mouse_y)}px`;
      }
    }

    setTimeout(() => {
      this.firstUpdated();
      setTimeout(() => this.applyResize(), 500);
    });
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
    const el = this.inputRef.value;
    const rect = el.getBoundingClientRect();
    
    this.original = {
      width: el.offsetWidth,
      height: el.offsetHeight,
      x: rect.left,
      y: rect.top,
      mouse_x: e.pageX,
      mouse_y: e.pageY
    };

    if (!this.notResizableComponents.includes(this.component.component_type)) {
      window.addEventListener("mousemove", this.resize);
    }
  };

  // Updates
  override firstUpdated() {
    const style = this.component.style || {};
    const margins = {
      left: this.extractNumber(style['margin-left']),
      right: this.extractNumber(style['margin-right']),
      top: this.extractNumber(style['margin-top']),
      bottom: this.extractNumber(style['margin-bottom'])
    };
     
    requestAnimationFrame(() => {
      if (!this.inputRef.value) return;
      
      this.slotDOMRect = this.inputRef.value.getBoundingClientRect();
      const width = this.inputRef.value.offsetWidth + margins.left + margins.right;
      const height = this.inputRef.value.offsetHeight + margins.top + margins.bottom;
      const halfWidth = width / 2 - 3;
      
      this.styles = {
        lines: {
          top: { width: `${width}px` },
          bottom: { width: `${width}px`, marginTop: `${height}px` },
          right: { height: `${height}px`, marginLeft: `${width}px` },
          left: { height: `${height}px` }
        },
        points: {
          leftTop: { marginLeft: "-1px" },
          rightTop: { marginLeft: `${width - 3}px` },
          middleTop: { marginLeft: `${halfWidth}px` },
          leftBottom: { marginTop: `${height - 2}px`, marginLeft: "-1px" },
          rightBottom: { marginLeft: `${width - 3}px`, marginTop: `${height - 2}px` },
          middleBottom: { marginLeft: `${halfWidth}px`, marginTop: `${height - 2}px` }
        }
      };
      
      this.requestUpdate();
    });
  }

  applyResize = () => {
    const el = this.inputRef.value;
    const { component_type: type, uuid, application_id: appId } = this.component;
    const styleUpdates = {};
    
    switch(type) {
      case ComponentType.Button:
        styleUpdates["--nuraly-button-width"] = el.style.width;
        break;
      case ComponentType.Icon:
        styleUpdates["--nuraly-icon-width"] = el.style.width;
        styleUpdates["--nuraly-icon-height"] = el.style.height;
        break;
      case ComponentType.Select:
        styleUpdates["--nuraly-select-width"] = el.style.width;
        break;
      case ComponentType.TextInput:
      case ComponentType.DatePicker:
        styleUpdates.width = el.style.width;
        break;
      default:
        styleUpdates.width = el.style.width;
        styleUpdates.height = el.style.height;
    }
    
    updateComponentAttributes(appId, uuid, "style", styleUpdates);
  };

  // Render
  override render() {
    const { points, lines } = this.styles;
    const isHovered = this.hoveredComponent?.uuid === this.component.uuid && !this.isSelected;
    
    return html`
      <div class=${classMap({ element: true, hovered: isHovered, bordered: this.showBorder, selected: this.isSelected })}>
        <div @mousedown=${this.mouseDown} class="resizer-point-left-top" style=${styleMap(points?.leftTop || {})}></div>
        <div @mousedown=${this.mouseDown} class="resizer-point-right-top" style=${styleMap(points?.rightTop || {})}></div>
        <div @mousedown=${this.mouseDown} class="resizer-point-middle-top" style=${styleMap(points?.middleTop || {})}></div>
        <div @mousedown=${this.mouseDown} class="resizer-point-left-bottom" style=${styleMap(points?.leftBottom || {})}></div>
        <div @mousedown=${this.mouseDown} class="resizer-point-right-bottom" style=${styleMap(points?.rightBottom || {})}></div>
        <div @mousedown=${this.mouseDown} class="resizer-point-middle-bottom" style=${styleMap(points?.middleBottom || {})}></div>
        
        <div class="resizer-line-top" style=${styleMap(lines?.top || {})}></div>
        <div class="resizer-line-bottom" style=${styleMap(lines?.bottom || {})}></div>
        <div class="resizer-line-right" style=${styleMap(lines?.right || {})}></div>
        <div class="resizer-line-left" style=${styleMap(lines?.left || {})}></div>
        
        <slot @slotchange="${() => {}}"></slot>
      </div>
    `;
  }
}