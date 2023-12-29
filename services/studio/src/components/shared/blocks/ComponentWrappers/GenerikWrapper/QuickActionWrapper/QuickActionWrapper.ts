import { type ComponentElement } from '$store/component/interface';
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js'
import styles from './QuickActionWrapper.style';
import { copyComponentAction, deleteComponentAction, pasteComponentAction } from '$store/component/action';

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
          <div style="width: 120px;">
            <attribute-text-font-size
                .component=${{ ...this.component }}
                ?slim=${true}
            ></attribute-text-font-size>
            </div>
          <div style="margin-left: 20px;width: 100px;">
            <attribute-text-font-weight
             ?slim=${true}
                .component=${{ ...this.component }}
              ></attribute-text-font-weight>
             
            </div>
            <div style="margin-left: 0px;width: 60px; margin-top : 4px">
            <attribute-color
             ?slim=${true}
                .component=${{ ...this.component }}
              ></attribute-color>
             
            </div>
          <div style="margin-left: 0px;width: 110px;">
          <attribute-text-font-style
                ?slim=${true}
                .component=${{ ...this.component }}
              ></attribute-text-font-style>
            </div>
            <hy-button  style="margin-left : 10px" danger
            
            @click=${() => {
        deleteComponentAction(this.component.uuid);
      }}>Delete</hy-button>


        </div>
        `;
  }
}
