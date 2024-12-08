import {html, LitElement} from 'lit';
import '../chatbot-container.component';
import {customElement} from 'lit/decorators.js';

@customElement('chatbot-demo')
export class CarouselDemo extends LitElement {
  override render() {
    return html`
      <div style="height : 400px; width: 60%">
        <nr-chatbot></nr-chatbot>
      </div>
    <nr-chatbot-container></nr-chatbot-container>
    `;
  }
}
