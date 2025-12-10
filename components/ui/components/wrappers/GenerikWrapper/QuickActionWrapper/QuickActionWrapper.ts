import { type ComponentElement } from '../../../../../../redux/store/component/component.interface.ts';
import { html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import styles from "./QuickActionWrapper.style.ts";
import { styleMap } from "lit/directives/style-map.js";
import { createRef, ref, type Ref } from "lit/directives/ref.js";

@customElement("quick-action-wrapper")
export class QuickActionWrapper extends LitElement {
  static styles = styles;
  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  contextMenuEvent
  @state()
  showQuickAction = false;
  private clickOutsideListener: EventListener | null = null;
  private inputRef: Ref<HTMLInputElement> = createRef();

  @property({ type: String })
  position : string = "top";

  @property({ type: String })
  componentToRenderUUID  = "";

  connectedCallback() {
    super.connectedCallback();
    //this.addClickOutsideListener();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }


  emitQuickActionStatusEvent() {
    const customEvent = new CustomEvent("displayQuickActionChanged", {
      detail: {
        showQuickAction: this.showQuickAction
      }
    });
    this.dispatchEvent(customEvent);

  }

  protected updated(_changedProperties: PropertyValues): void {
    super.updated(_changedProperties);

    _changedProperties.forEach((oldValue, propName) => {
      if (propName === "contextMenuEvent") {
        setTimeout(() => {

        requestAnimationFrame(() => {
          this.style.width = "100%";
          if(this.position === "top") {
            this.style.top = `${ this.contextMenuEvent.ComponentTop - this.inputRef.value.getBoundingClientRect().height - 20 }px`;
          }else{
            this.style.top = `${this.contextMenuEvent.ComponentTop + this.contextMenuEvent.ComponentHeight}px`;
          }
          this.style.left = `${this.contextMenuEvent.ComponentLeft}px`;
        });
      }, 50);
        
      }
    })
  }
  
  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties );
    _changedProperties.forEach((oldValue, propName) => {
      if (propName === "contextMenuEvent") {
      
      }
    })
  }

  render() {
    return html`
        <div class="quick-action" 
        ${ref(this.inputRef)}
        style=${styleMap({
            position: "absolute",
          })}>
          ${this.componentToRenderUUID ? 
            html`
             <micro-app uuid="1" componentToRenderUUID=${this.componentToRenderUUID}>  </micro-app>
             ` : nothing
          }
           
        </div>
        `;
  }
}
