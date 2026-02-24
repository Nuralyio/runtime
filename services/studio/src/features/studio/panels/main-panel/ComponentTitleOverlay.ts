import { html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { type Ref } from "lit/directives/ref.js";
import { type ComponentElement } from '@nuraly/runtime/redux/store';
import { PositionTracker } from './position-tracker';

@customElement("component-title-overlay")
export class ComponentTitleOverlay extends LitElement {
  @property({ type: Object }) component: ComponentElement | null = null;
  @property({ type: Object }) componentRef: Ref<HTMLElement> | null = null;
  @property({ type: Boolean }) isSelected: boolean = false;
  @property({ type: Number }) opacity: number = 1;

  private tracker = new PositionTracker(
    this,
    () => this.componentRef,
    (rect) => ({
      top: rect.top - 22,
      left: rect.left,
    }),
  );

  protected render() {
    if (!this.component || !this.componentRef?.value) {
      return nothing;
    }

    const pointerEvents = this.isSelected ? 'auto' : 'none';

    return html`
      <div
        draggable=${this.isSelected}
        style="position: fixed; top: ${this.tracker.position.top}px; left: ${this.tracker.position.left}px; z-index: 1001; pointer-events: ${pointerEvents}; opacity: ${this.opacity}; cursor: ${this.isSelected ? 'move' : 'default'};"
      >
        <component-title
          .component=${this.component}
          .display=${true}
        ></component-title>
      </div>
    `;
  }
}
