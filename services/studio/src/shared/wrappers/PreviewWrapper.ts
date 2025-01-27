
import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("preview-component-wrapper")
export class PreviewComponentWrapper extends LitElement {
    
  constructor() {
    super();
  
  }

  render() {
    return html`
      <style>
        :host {

        }
      </style>
     
       
     <slot></slot>

    `;
  }

 
}