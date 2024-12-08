import { html, LitElement, css } from 'lit';
import '../chatbot-container.component';
import { customElement, property } from 'lit/decorators.js';

@customElement('chatbot-demo')
export class CarouselDemo extends LitElement {
  @property({type: Boolean}) direction: boolean = false;

  static override styles = css`
    .button-container {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 10px; /* Adds space between button and content */
    }

    button {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
      border-radius: 5px;
      transition: background-color 0.3s ease;
    }

    button:hover {
      background-color: #0056b3;
    }

    button:active {
      background-color: #003f7f;
    }

    button:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.5);
    }
  `;

  private toggleDirection() {
    this.direction = !this.direction;
  }

  override render() {
    return html`
      <div class="button-container">
        <button @click="${this.toggleDirection}">Toggle Direction</button>
      </div>

      <div style="height: 400px; width: 60%">
        <nr-chatbot .direction="${this.direction}"></nr-chatbot>
      </div>

      <nr-chatbot-container .direction="${this.direction}"></nr-chatbot-container>
    `;
  }
}