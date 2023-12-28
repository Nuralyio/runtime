/* eslint-disable @typescript-eslint/no-explicit-any */
import {css, html, LitElement} from 'lit';
import {property, state} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';

export class ModalComponent extends LitElement {
  static override styles = css`
  :host {
    font-size: 16px;
    }
    .modal {
      position: absolute;
      z-index: 9999;
      background-color: #ffffff;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    }

    dialog {
      border: 0;
      box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12),
        0 9px 28px 8px rgba(0, 0, 0, 0.05);
      min-width: 400px;
      min-height: 200px;
    }

    .dialog-label {
      cursor: move;
    }

    .backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.3);
      z-index: 9998;
    }

    .close-icon {
      cursor: pointer;
    }
    ::slotted([slot='footer']) {
      /* Styles applied specifically to slotted elements with slot="custom-slot" */
      bottom: 0;
      position: absolute;
      text-align: end;
      margin-bottom: 10px;
      width : 93%;
    }

    ::slotted([slot='content']) {
      padding: 0px 24px 20px 24px;
    }
    @media (prefers-color-scheme: dark) {
      .modal {
        background-color: rgb(74, 74, 74);
        color: #ffffff;
      } 
      .backdrop {
        background-color: rgba(0, 0, 0, 0.3);
      }
    }

  `;

  @property({type: Boolean})
  isOpen!: boolean;

  @property({type: String})
  label = '';

  @state()
  private offsetX = 0;

  @state()
  private offsetY = 0;

  private isDragging = false;
  private initialX = 0;
  private initialY = 0;

  override connectedCallback() {
    super.connectedCallback();
    // this.addEventListener('mousedown', this.startDrag);
    document.addEventListener('mousemove', this.drag.bind(this));
    // this.addEventListener('mouseup', this.stopDrag);
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    //  document.addEventListener('click', this.handleOutsideClick.bind(this));
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    // this.removeEventListener('mousedown', this.startDrag);
    document.removeEventListener('mousemove', this.drag);
    // this.removeEventListener('mouseup', this.stopDrag);
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('click', this.handleOutsideClick.bind(this));
  }

  private startDrag(event: MouseEvent) {
    if (event.target instanceof HTMLElement) {
      this.isDragging = true;
      this.initialX = event.clientX - this.offsetX;
      this.initialY = event.clientY - this.offsetY;
      event.preventDefault();
    }
  }

  private drag(event: MouseEvent) {
    if (this.isDragging) {
      this.offsetX = event.clientX - this.initialX;
      this.offsetY = event.clientY - this.initialY;
      this.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px)`;
      event.preventDefault();
    }
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeModal();
      event.preventDefault();
    }
  }

  private handleOutsideClick(event: MouseEvent) {
    if (this.isOpen && !this.isChildDialog(event.target as HTMLElement)) {
      this.closeModal();

    }
  }

  private isChildDialog(target: HTMLElement): boolean {
    let element = target.parentElement;
    while (element !== null) {
      if (element.tagName === 'DIALOG') {
        return true;
      }
      element = element.parentElement;
    }
    return false;
  }

  closeModal() {
    this.isOpen = false;
    this.offsetX = 0;
    this.offsetY = 0;
    this.style.transform = 'none';
    this.dispatchEvent(new CustomEvent('close'));

  }

  private adjustDialogPosition() {
    if (this.isOpen) {
      const dialog = this.shadowRoot?.querySelector('.modal') as HTMLElement;
      if (dialog) {

          const contentHeight = dialog.clientHeight;
          const windowHeight = window.innerHeight;
          const dialogHeight = Math.min(contentHeight + 40, windowHeight - 40);

          const topPosition = Math.max((windowHeight - dialogHeight) / 2, 0);
          dialog.style.top = `${topPosition}px`;
      }
    }
  }
  override updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has('isOpen')) {
      if (this.isOpen) {
        // The dialog has been opened
        this.adjustDialogPosition();
      }

    }
  }

  private stopDrag() {
    this.isDragging = false;
  }

  override render() {
    const backdropStyles = {
      display: this.isOpen ? 'block' : 'none',
    };
    const modalStyles = {
      transform: `translate(${this.offsetX}px, ${this.offsetY}px)`,
    };

    return html`
      <div class="backdrop" style=${styleMap(backdropStyles)}></div>

      <dialog class="modal" ?open="${this.isOpen}" style=${styleMap(modalStyles)}>
        <hy-icon
          class="close-icon"
          name="window-close"
          style="float: right;"
          @click=${() => (this.closeModal())}
        ></hy-icon>
        <h2 class="dialog-label" @mousedown=${this.startDrag} @mouseup=${this.stopDrag}>${this.label}</h2>
        <slot></slot>
        <slot name="footer"></slot>
      </dialog>
    `;
  }
}

customElements.define('modal-component', ModalComponent);
