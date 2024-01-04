import { type ComponentElement } from "$store/component/interface";
import { $componentWithChildrens } from "$store/component/sotre";
import { $currentPageViewPort } from "$store/page/store";
import { executeEventHandler } from "core/engine";
import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

const isServer = typeof window === 'undefined';
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

  @state()
  components: ComponentElement[];

  @state()
  thisvalue;
  constructor() {
    super();
    $componentWithChildrens.subscribe((components: ComponentElement[]) => {
      this.components = components;
      if(typeof window !== 'undefined' && typeof window.navigator !== 'undefined'){

      }else{
       this.updateValue();

      }
    });

  
  }
  override connectedCallback() {
    super.connectedCallback();
    $currentPageViewPort.subscribe((viewPort) => {
      this.currentPageViewPort = viewPort;
      this.updateValue();
      this.updateValues();
    });
  }

  @property({ type: Object })
  item: any
  updateValues() {
    if (this.component.styleBreakPoints) {
      this.viewPortStyles = this.component.styleBreakPoints[this.currentPageViewPort] ? { ...this.component.styleBreakPoints[this.currentPageViewPort] as any } : {}
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

  }
  updated(changedProperties) {

    changedProperties.forEach((_oldValue, propName) => {
      if (propName === "component" || propName === "item") {
        this.updateValue();
        this.updateValues();
      }
    });
  }

  updateValue() {
    let messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = function (event) {
      if(event.data.result){
      this.thisvalue = event.data.result;

      }
    }.bind(this)
    const command = "executeValue";
    if(typeof window !== 'undefined' && typeof window.navigator !== 'undefined'){
      if ("serviceWorker" in navigator) {
      navigator.serviceWorker.controller?.postMessage(
        {
          command,
          value: this.component.attributesHandlers?.value,
          components: this.components,
          component: this.component,
        },
        [messageChannel.port2]
      );    
    }
    }else{
      
    }
    
   
  }

getValue(){
  let value = "";
  if(isServer){
      if(this.component.parameters?.value){
        if(this.component?.parent?.component_type === "Collection"){
          return this.component.iterations[this.item.index]
        }
      }
  }

  return isServer ? this.component.parameters?.value :  this.thisvalue ?? this.component.parameters?.value 
}


  render() {
    return html`
    <label
      style=${styleMap({ ...this.component.style, ...this.viewPortStyles })}
      @click=${(e) => {
        if (this.component.event.onClick) {
          executeEventHandler(this.component, "event", "onClick");
        }
      }}
      >${  this.getValue()  }</label
    >`;
  }
}
