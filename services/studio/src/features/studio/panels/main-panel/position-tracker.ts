import { type ReactiveController, type ReactiveControllerHost } from "lit";
import { type Ref } from "lit/directives/ref.js";

export class PositionTracker implements ReactiveController {
  host: ReactiveControllerHost;
  position = { top: 0, left: 0 };
  private animationFrameId: number;
  private getRef: () => Ref<HTMLElement> | null;
  private computePosition: (rect: DOMRect) => { top: number; left: number };

  constructor(
    host: ReactiveControllerHost,
    getRef: () => Ref<HTMLElement> | null,
    computePosition: (rect: DOMRect) => { top: number; left: number },
  ) {
    this.host = host;
    this.getRef = getRef;
    this.computePosition = computePosition;
    host.addController(this);
  }

  hostConnected() {
    const updateLoop = () => {
      this.update();
      this.animationFrameId = requestAnimationFrame(updateLoop);
    };
    this.animationFrameId = requestAnimationFrame(updateLoop);
  }

  hostDisconnected() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private update() {
    const el = this.getRef()?.value;
    if (el) {
      const rect = el.getBoundingClientRect();
      this.position = this.computePosition(rect);
      this.host.requestUpdate();
    }
  }
}
