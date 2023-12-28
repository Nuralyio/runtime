import { LitElement, html, property, customElement, css } from 'lit-element';

@customElement('hy-toast')
export class LitToast extends LitElement {
   static override styles = css`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
    }

    .toast {
      background-color: #333;
      color: #fff;
      padding: 10px 20px;
      margin-bottom: 10px;
      border-radius: 5px;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
      animation: fadein 0.5s, fadeout 0.5s 2.5s 3000ms;
    }

    @keyframes fadein {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes fadeout {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
  `;

  @property({ type: Array }) toasts  :any[]= [];

  override render() {
    return html`
      <div class="toast-container">
        ${this.toasts.map(
          (toast, index) => html`
            <div class="toast show" @animationend="${() =>
              this.handleAnimationEnd(index)}">${toast.text}</div>
          `
        )}
      </div>
    `;
  }

  show(text = '', duration = 5000) {
    const newToast = { text, duration };
    this.toasts = [...this.toasts, newToast];

    if (this.toasts.length === 1) {
    }

    setTimeout(() => {
      this.toasts.shift();
      this.requestUpdate('toasts');
    }, duration);
  }



  handleAnimationEnd(index :any) {
    this.toasts.splice(index, 1);
    this.requestUpdate('toasts');
    if (this.toasts.length > 0) {
    }
  }
}
