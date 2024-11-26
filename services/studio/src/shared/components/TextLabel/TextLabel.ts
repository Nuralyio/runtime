import { type ComponentElement } from "$store/component/interface.ts";
import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { BaseElementBlock } from "../BaseElement.ts";
import { updateComponentAttributes } from "$store/actions/component.ts";
import { styles } from "./TextLabel.style.ts";
import { getNestedAttribute } from "../../../utils/object.utils.ts";
import { executeCodeWithClosure } from "../../../core/executer.ts";

const isServer = typeof window === 'undefined';

@customElement("text-label-block")
export class TextLabelBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;

  @state()
  currentPageViewPort: string;

  @state()
  viewPortStyles: any;

  static styles = styles

  @state()
  components: ComponentElement[];

  @state()
  thisvalue;

  override connectedCallback() {
    super.connectedCallback();
    this.registerCallback('value', (v) => {
      this.requestUpdate();
    })
  }

  handleBodyClick = (event) => {
    const label = this.shadowRoot.querySelector("label");
    if (label && !label.contains(event.target)) {
      this.isEditable = false;
    }
  };

  @property({ type: Object })
  item: any;



  handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      this.isEditable = true;
      //this.requestUpdate();
    }
  };

  render() {
    const labelStyles = this.component?.style || {};
    const labelStyleHandlers = this.component?.styleHandlers ? Object.fromEntries(
      Object.entries(this.component?.styleHandlers)?.filter(([key,value])=>value)) :{};
    const labelAutoWidth = this.inputHandlersValue?.width;
    const labelAutoHeight = this.inputHandlersValue?.height;

    const combinedStyles = {
      ...labelStyles,
      width: labelAutoWidth ? 'auto' : labelStyles.width,
      height: labelAutoHeight ? 'auto' : labelStyles.height,
      ...labelStyleHandlers
    };


    return html`
      ${!this.inputHandlersValue?.display || (this.inputHandlersValue.value && this.inputHandlersValue.display == 'show') ? html`
        <label
          id=${this.component.uuid}
          contentEditable="${this.isEditable}"
          style=${styleMap(combinedStyles)}
          @click=${() => {
          if (this.component.event?.onClick) {
            executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.onClick`));
          }
        }}
              @mouseenter=${(e) => {
          if (this.component?.event?.mouseEnter) {
            executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.mouseEnter`));
          }
        }}
        @mouseleave=${(e) => {
          if (this.component?.event?.mouseLeave) {

            executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.mouseLeave`));
          }
        }}
          @blur=${(e:Event) => {
          this.isEditable = false;
          const value = (e.target as HTMLElement).innerText
          updateComponentAttributes(this.component.applicationId,this.component.uuid,'input',{value:{type:'value',value}})
        }}
          @dblclick=${(e) => {
          e.preventDefault();
          this.isEditable = true;
        }}
          
        >${this.inputHandlersValue.value || "Text label"}</label>
      ` : nothing}
    `;
  }
}