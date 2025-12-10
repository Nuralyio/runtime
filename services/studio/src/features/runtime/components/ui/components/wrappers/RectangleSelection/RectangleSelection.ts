import { $context, getVar } from '../../../../../redux/store/context';
import { $environment, type Environment, ViewMode } from '../../../../../redux/store/environment';
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("selectable-element")
class SelectableElement extends LitElement {
  static styles = css`
    :host {
      position: absolute;
      padding: 10px;
      border: 1px solid #000;
      background: lightgray;
      transition: background-color 0.3s;

    }
    :host([highlighted]) {
      background: #007bff; 
    }
  `;
  @property({ type: Boolean, reflect: true, attribute: "highlighted" }) highlighted = false;

  render() {
    return html`<slot></slot>`;
  }
}

@customElement("rectangle-selection")
class RectangleSelection extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: relative; 
      overflow-x:hidden;

    }
    .rectangle {
      position: absolute;
      border: 1px dashed #000;
      background-color: rgba(0, 123, 255, 0.3);
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `;
  @property({ type: Object }) selectionStart = null;
  @property({ type: Object }) selectionRect = null;
  mode: ViewMode;
  selectableElements: NodeListOf<Element>;
  currentPlatform: any;

  constructor() {
    super();
    $environment.subscribe((environment: Environment) => {
      this.mode = environment.mode;
      this.requestUpdate();
    });
    $context.listen(() => {
      this.currentPlatform = getVar("global", "currentPlatform")?.value;
      const isDesktop = this.currentPlatform?.platform == undefined || this.currentPlatform?.platform === "desktop";

      if (!isDesktop) {
        this.style.setProperty("justify-self", "center");
      } else {
        this.style.removeProperty("justify-self");
      }
    });

  }

  render() {
    return html`<slot></slot>`;
  }

  firstUpdated() {
    if (this.mode === ViewMode.Preview) return;
    // this.addEventListener("mousedown", this.startSelection.bind(this));
    // this.addEventListener("mousemove", this.updateSelection.bind(this));
    // this.addEventListener("mouseup", this.endSelection.bind(this));

    const observer = new MutationObserver(() => {
      this.updateSelectableElements();
    });

    observer.observe(this, { childList: true, subtree: true });
    this.updateSelectableElements();
  }

  updateSelectableElements() {
    this.selectableElements = this.querySelectorAll("generiks-component-wrapper");
  }

  startSelection(event) {
    this.selectionStart = { x: event.offsetX, y: event.offsetY };

    this.selectionRect = document.createElement("div");
    this.selectionRect.classList.add("rectangle");
    this.selectionRect.style.left = `${this.selectionStart.x}px`;
    this.selectionRect.style.top = `${this.selectionStart.y}px`;

    this.shadowRoot.appendChild(this.selectionRect);
  }

  updateSelection(event) {
    if (this.mode === ViewMode.Preview) return;
    if (!this.selectionRect) return;

    requestAnimationFrame(() => {
      const width = event.offsetX - this.selectionStart.x;
      const height = event.offsetY - this.selectionStart.y;

      this.selectionRect.style.width = `${Math.abs(width)}px`;
      this.selectionRect.style.height = `${Math.abs(height)}px`;

      if (width < 0) {
        this.selectionRect.style.left = `${event.offsetX}px`;
      }
      if (height < 0) {
        this.selectionRect.style.top = `${event.offsetY}px`;
      }
    });
  }

  endSelection(event) {
    event.preventDefault();
    if (!this.selectionRect) return;

    const rect = this.selectionRect.getBoundingClientRect();

    // Dynamically query and update highlighted elements
    this.selectableElements.forEach(element => {
      const elementRect = element.getBoundingClientRect();
      const isSelected = (
        rect.left <= elementRect.right &&
        rect.right >= elementRect.left &&
        rect.top <= elementRect.bottom &&
        rect.bottom >= elementRect.top
      );
      console.log("Element:", element, "isSelected:", isSelected);
      element.highlighted = isSelected;
    });

    this.shadowRoot.removeChild(this.selectionRect);
    this.selectionRect = null;
    this.selectionStart = null;
  }
}
