import { type ComponentElement } from "$store/component/interface";
import { html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { BaseElementBlock } from "../BaseElement";
import { executeHandler } from "core/helper";

const isServer = typeof window === 'undefined';

@customElement("text-label-block")
export class TextLabelBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;

  @state()
  currentPageViewPort: string;

  @state()
  viewPortStyles: any;

  static styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

  @state()
  isEditable = false;

  @state()
  components: ComponentElement[];

  @state()
  thisvalue;


  constructor() {
    super();

  }



  handleBodyClick = (event) => {
    const label = this.shadowRoot.querySelector("label");
    if (label && !label.contains(event.target)) {
      // Click is outside the label, make it non-editable
      this.isEditable = false;
    }
  };
  @property({ type: Object })
  item: any;



  updated(changedProperties) {
    changedProperties.forEach((_oldValue, propName) => {
      if (propName === "component" || propName === "item") {
      }
    });
  }


  getValue() {
    let value = "";
    /* if (isServer) {
       if (this.component.parameters?.value) {
         if (this.component?.parent?.component_type === "Collection") {
           return this.component.iterations[this.item.index];
         }
       }
     }*/

    return isServer ? this.component.parameters?.value : this.thisvalue ?? this.component.parameters?.value;
  }

  render() {
    return html` 
         <label
        id=${this.component.uuid}
        contentEditable="${this.isEditable}"
        style=${styleMap({ ...this.component.style, ...this.viewPortStyles })}
        @click=${(e) => {
        if (this.component.event.onClick) {
          executeHandler({
            component: this.component,
            type: `event.onClick`,
            extras: {
              EventData: e.data,
            },
          });
        }
      }}
        @dblclick=${(e) => {
        e.preventDefault();

        this.isEditable = true;
        this.requestUpdate();
      }}
      >
        ${this.getValue()}
      </label>
      `}
    
}
