import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { type Ref } from "lit/directives/ref.js";
import { type ComponentElement } from '@nuraly/runtime/redux/store';

@customElement("component-title-overlay")
export class ComponentTitleOverlay extends LitElement {
  @property({ type: Object }) component: ComponentElement | null = null;
  @property({ type: Object }) componentRef: Ref<HTMLElement> | null = null;
  @property({ type: Boolean }) isSelected: boolean = false;
  @property({ type: Number }) opacity: number = 1;
  
  @state() position = { top: 0, left: 0 };
  private animationFrameId: number;

  connectedCallback() {
    super.connectedCallback();
    
    // Start continuous position update loop
    const updateLoop = () => {
      this.updatePosition();
      this.animationFrameId = requestAnimationFrame(updateLoop);
    };
    this.animationFrameId = requestAnimationFrame(updateLoop);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private updatePosition() {
    if (this.componentRef?.value) {
      const rect = this.componentRef.value.getBoundingClientRect();
      this.position = {
        top: rect.top - 22,
        left: rect.left
      };
      this.requestUpdate();
    }
  }

  protected render() {
    if (!this.component || !this.componentRef?.value) {
      return nothing;
    }

    const pointerEvents = this.isSelected ? 'auto' : 'none';

    return html`
      <div
        draggable=${this.isSelected}
        style="position: fixed; top: ${this.position.top}px; left: ${this.position.left}px; z-index: 1001; pointer-events: ${pointerEvents}; opacity: ${this.opacity}; cursor: ${this.isSelected ? 'move' : 'default'};"
      >
        <component-title
          .component=${this.component}
          .display=${true}
        ></component-title>
      </div>
    `;
  }
}
