import { ComponentElement } from '$store/component/interface';
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js'
import styles from './QuickActionWrapper.style';

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
        this.addClickOutsideListener();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeClickOutsideListener();
    }

    private addClickOutsideListener() {
        this.clickOutsideListener = (event: Event) => {
            if (!this.contains(event.target as Node)) {
                // Clicked outside of the QuickActionWrapper
                // You can add your logic here
                console.log('Clicked outside');
               // this.showQuickAction = false;
                //this.emitQuickActionStatusEvent();
            }
        };

        window.addEventListener('click', this.clickOutsideListener);
    }

    private removeClickOutsideListener() {
        if (this.clickOutsideListener) {
            window.removeEventListener('click', this.clickOutsideListener);
            this.clickOutsideListener = null;
        }
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
          <div>
            <attribute-text-font-size
                .component=${{ ...this.component }}
                ?slim=${true}
            ></attribute-text-font-size>
            </div>
          <div style="margin-left: 30px;width: 160px;">
            <attribute-text-font-weight
             ?slim=${true}
                .component=${{...this.component}}
              ></attribute-text-font-weight>
             
            </div>
          <div style="margin-left: 30px;width: 200px;">
          <attribute-text-font-style
                ?slim=${true}
                .component=${{...this.component}}
              ></attribute-text-font-style>
            </div>
        </div>
        `;
    }
}
