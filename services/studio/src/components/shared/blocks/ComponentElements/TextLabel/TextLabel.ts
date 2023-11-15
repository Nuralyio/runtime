import { type ComponentElement } from "$store/component/interface";
import { $currentPageViewPort } from "$store/page/store";
import { executeEventHandler } from "core/engine";
import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

@customElement("text-label-block")
export class TextLabelBlock extends LitElement {
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

  override connectedCallback() {
    super.connectedCallback();
    $currentPageViewPort.subscribe((viewPort) => {
      this.currentPageViewPort = viewPort;
      this.updateValues();
    });
  }
  updateValues(){
     if( this.component.styleBreakPoints){
        this.viewPortStyles= this.component.styleBreakPoints[this.currentPageViewPort] ? {...this.component.styleBreakPoints[this.currentPageViewPort] as any}: {}
        // clean this.viewPortStyles from null values and do not use delete keyword
      const cleanedViewPortStyles = {};

      for (const key in this.viewPortStyles) {
        if (this.viewPortStyles[key] !== null) {
          cleanedViewPortStyles[key] = this.viewPortStyles[key];
        }
      }

      // Assign the cleaned object back to this.viewPortStyles if needed
      this.viewPortStyles = cleanedViewPortStyles;        
      }
      this.requestUpdate();

  }
   updated(changedProperties) {
    changedProperties.forEach((_oldValue, propName) => {
        if (propName === "component") {
          this.updateValues();
        }
      });
    }


  render() {
    return html`<label
      style=${styleMap({ ...this.component.style ,...this.viewPortStyles  })}
      @click=${(e) => {
        if (this.component.event.onClick) {
          executeEventHandler(this.component, "event", "onClick");
        }
      }}
      >${this.component.parameters?.value}</label
    >`;
  }
}
