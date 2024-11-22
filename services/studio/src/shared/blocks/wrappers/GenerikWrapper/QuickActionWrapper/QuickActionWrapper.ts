import { type ComponentElement } from '$store/component/interface.ts';
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js'
import styles from './QuickActionWrapper.style.ts';

@customElement('quick-action-wrapper')
export class QuickActionWrapper extends LitElement {
  @property({ type: Object })
  component: ComponentElement;

  @state()
  showQuickAction = false;

  private clickOutsideListener: EventListener | null = null;

  static styles = styles

  connectedCallback() {
    super.connectedCallback();
    //this.addClickOutsideListener();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

 
 
  emitQuickActionStatusEvent() {
    const customEvent = new CustomEvent('displayQuickActionChanged', {
      detail: {
        showQuickAction: this.showQuickAction,
      },
    });
    this.dispatchEvent(customEvent);

  }
  render() {
    return html`
        <div class="quick-action">
          <div style="">
      <micro-app uuid="1" componentToRenderUUID="quick-action-wrapper">  </micro-app>
          </div>
        </div>
        `;
  }
}
