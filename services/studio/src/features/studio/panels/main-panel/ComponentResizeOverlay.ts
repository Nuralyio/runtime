import { html, LitElement, nothing, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { type Ref } from "lit/directives/ref.js";
import { type ComponentElement } from '@nuraly/runtime/redux/store';
import { ComponentType } from '@nuraly/runtime/redux/store/component/component.interface';
import { eventDispatcher } from '@nuraly/runtime/utils';
import { updateComponentAttributes } from '@nuraly/runtime/redux/actions';
import { setResizing } from '@nuraly/runtime/redux/actions';

@customElement("component-resize-overlay")
export class ComponentResizeOverlay extends LitElement {
  static styles = css`
    .resize-container {
      position: fixed;
      pointer-events: none;
    }
    
    .resize-border {
      position: absolute;
      pointer-events: none;
    }
    
    .resize-container.selected .resize-border.top,
    .resize-container.selected .resize-border.bottom {
      height: 0;
      left: 0;
      right: 0;
      border-top: 1px solid var(--editor-selection-color, #79ade6);
    }
    
    .resize-container:not(.selected) .resize-border.top,
    .resize-container:not(.selected) .resize-border.bottom {
      height: 0;
      left: 0;
      right: 0;
      border-top: 1px dashed var(--editor-selection-color, #79ade6);
    }
    
    .resize-border.top { top: 0; }
    .resize-border.bottom { bottom: 0; }
    
    .resize-container.selected .resize-border.left,
    .resize-container.selected .resize-border.right {
      width: 0;
      top: 0;
      bottom: 0;
      border-left: 1px solid var(--editor-selection-color, #79ade6);
    }
    
    .resize-container:not(.selected) .resize-border.left,
    .resize-container:not(.selected) .resize-border.right {
      width: 0;
      top: 0;
      bottom: 0;
      border-left: 1px dashed var(--editor-selection-color, #79ade6);
    }
    
    .resize-border.left { left: 0; }
    .resize-border.right { right: 0; }
    
    .resize-handle {
      position: absolute;
      width: 6px;
      height: 6px;
      background-color: var(--editor-selection-color, #79ade6);
      border-radius: 2px;
      pointer-events: auto;
      z-index: 10;
    }
    
    .resize-handle.top-left { top: -3px; left: -3px; cursor: nw-resize; }
    .resize-handle.top-right { top: -3px; right: -3px; cursor: ne-resize; }
    .resize-handle.top-middle { top: -3px; left: 50%; transform: translateX(-50%); cursor: n-resize; }
    .resize-handle.bottom-left { bottom: -3px; left: -3px; cursor: sw-resize; }
    .resize-handle.bottom-right { bottom: -3px; right: -3px; cursor: se-resize; }
    .resize-handle.bottom-middle { bottom: -3px; left: 50%; transform: translateX(-50%); cursor: s-resize; }
    
    .size-tags {
      position: fixed;
      z-index: 1002;
      pointer-events: auto;
      display: flex;
      gap: 2px;
    }
  `;

  @property({ type: Object }) component: ComponentElement | null = null;
  @property({ type: Object }) componentRef: Ref<HTMLElement> | null = null;
  @property({ type: Boolean }) isSelected: boolean = false;
  @property({ type: Number }) opacity: number = 1;
  
  @state() position = { top: 0, left: 0 };
  @state() size = { width: 0 | 'auto', height: 0 | 'auto' };
  @state() actualHeight = 0;
  @state() actualWidth = 0;
  @state() private isResizing = false;
  @state() private resizeDirection: string | null = null;
  
  private animationFrameId: number;
  private originalSize = { width: 0, height: 0 };
  private originalPosition = { x: 0, y: 0 };
  private startMouse = { x: 0, y: 0 };
  
  // Component type lists
  private onlyWidthResizableComponents = [
    ComponentType.TextInput, ComponentType.Select, ComponentType.DatePicker, 
    ComponentType.Button, ComponentType.Checkbox
  ];

  connectedCallback() {
    super.connectedCallback();
    
    // Start continuous position update loop
    const updateLoop = () => {
      if (!this.isResizing) {
        this.updatePosition();
      }
      this.animationFrameId = requestAnimationFrame(updateLoop);
    };
    this.animationFrameId = requestAnimationFrame(updateLoop);
    
    // Add mouse event listeners for resizing
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    
    // Force resize wrapper refresh when component or componentRef changes
    if ((changedProperties.has('component') || changedProperties.has('componentRef')) && this.component) {
      requestAnimationFrame(() => {
        eventDispatcher.emit("refresh:resize" + this.component.uuid);
      });
    }
  }

  private updatePosition() {
    if (this.componentRef?.value) {
      const rect = this.componentRef.value.getBoundingClientRect();
      this.position = {
        top: rect.top,
        left: rect.left
      };
      
      // Store actual dimensions
      this.actualHeight = rect.height;
      this.actualWidth = rect.width;
      
      // Get computed style to check for auto values
      const styleWidth = this.component?.style?.width;
      const styleHeight = this.component?.style?.height;
      
      this.size = {
        width: (!styleWidth || styleWidth === 'auto') ? 'auto' : Math.round(rect.width),
        height: (!styleHeight || styleHeight === 'auto') ? 'auto' : Math.round(rect.height)
      };
      this.requestUpdate();
    }
  }
  
  private handleMouseDown = (e: MouseEvent, direction: string) => {
    if (!this.isSelected) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    this.isResizing = true;
    this.resizeDirection = direction;
    setResizing(true);
    
    const el = this.componentRef.value;
    if (!el) return;
    
    const rect = el.getBoundingClientRect();
    this.originalSize = { width: rect.width, height: rect.height };
    this.originalPosition = { x: rect.left, y: rect.top };
    this.startMouse = { x: e.clientX, y: e.clientY };
  };
  
  private handleMouseMove = (e: MouseEvent) => {
    if (!this.isResizing || !this.resizeDirection) return;
    
    e.preventDefault();
    const el = this.componentRef.value;
    if (!el) return;
    
    const deltaX = e.clientX - this.startMouse.x;
    const deltaY = e.clientY - this.startMouse.y;
    const canResizeHeight = !this.onlyWidthResizableComponents.includes(this.component.component_type);
    const minSize = 20;
    
    let newWidth = this.originalSize.width;
    let newHeight = this.originalSize.height;
    
    // Calculate new dimensions based on resize direction
    if (this.resizeDirection.includes('right')) {
      newWidth = Math.max(minSize, this.originalSize.width + deltaX);
    } else if (this.resizeDirection.includes('left')) {
      newWidth = Math.max(minSize, this.originalSize.width - deltaX);
    }
    
    if (canResizeHeight) {
      if (this.resizeDirection.includes('bottom')) {
        newHeight = Math.max(minSize, this.originalSize.height + deltaY);
      } else if (this.resizeDirection.includes('top')) {
        newHeight = Math.max(minSize, this.originalSize.height - deltaY);
      }
    }
    
    // Apply styles to the element
    el.style.width = `${newWidth}px`;
    if (canResizeHeight) {
      el.style.height = `${newHeight}px`;
    }
    
    // Update overlay position
    this.updatePosition();
  };
  
  private handleMouseUp = () => {
    if (!this.isResizing) return;
    
    this.isResizing = false;
    this.resizeDirection = null;
    setResizing(false);
    
    // Apply the resize to component
    this.applyResize();
  };
  
  private applyResize() {
    const el = this.componentRef.value;
    if (!el) return;
    
    const { component_type: type, uuid, application_id: appId } = this.component;
    const styleUpdates: any = {};
    
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
  }

  protected render() {
    if (!this.component || !this.componentRef?.value) {
      return nothing;
    }

    const tagColor = '#49c0b6';
    const hasEventHandlers = this.component.event && Object.keys(this.component.event).length > 0;
    const canResizeHeight = !this.onlyWidthResizableComponents.includes(this.component.component_type);

    return html`
      <div 
        class="resize-container ${this.isSelected ? 'selected' : ''}" 
        style="
          top: ${this.position.top}px; 
          left: ${this.position.left}px; 
          width: ${this.actualWidth}px; 
          height: ${this.actualHeight}px;
          z-index: ${this.isSelected ? 1000 : 999};
          opacity: ${this.opacity};
        "
      >
        <!-- Borders -->
        <div class="resize-border top"></div>
        <div class="resize-border bottom"></div>
        <div class="resize-border left"></div>
        <div class="resize-border right"></div>
        
        <!-- Resize handles (only when selected) -->
        ${this.isSelected ? html`
          <div class="resize-handle top-left" @mousedown=${(e: MouseEvent) => this.handleMouseDown(e, 'top-left')}></div>
          <div class="resize-handle top-right" @mousedown=${(e: MouseEvent) => this.handleMouseDown(e, 'top-right')}></div>
          ${canResizeHeight ? html`
            <div class="resize-handle top-middle" @mousedown=${(e: MouseEvent) => this.handleMouseDown(e, 'top-middle')}></div>
          ` : nothing}
          <div class="resize-handle bottom-left" @mousedown=${(e: MouseEvent) => this.handleMouseDown(e, 'bottom-left')}></div>
          <div class="resize-handle bottom-right" @mousedown=${(e: MouseEvent) => this.handleMouseDown(e, 'bottom-right')}></div>
          ${canResizeHeight ? html`
            <div class="resize-handle bottom-middle" @mousedown=${(e: MouseEvent) => this.handleMouseDown(e, 'bottom-middle')}></div>
          ` : nothing}
        ` : nothing}
      </div>
      
      <!-- Size tags -->
      <div class="size-tags" style="top: ${this.position.top + this.actualHeight }px; left: ${this.position.left}px;">
        <nr-tag color=${tagColor}>
          ${this.size.width} × ${this.size.height}
        </nr-tag>
        
        ${hasEventHandlers ? html`
          <nr-tag color="#7552cc">
            <nr-icon color="white" name="code" size="small"></nr-icon>
          </nr-tag>
        ` : nothing}
      </div>
    `;
  }
}
