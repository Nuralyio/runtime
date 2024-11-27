import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import styles from "./label.style";

@customElement('hy-label')
export class HyTextLabel extends LitElement{
   static override styles=styles

   @property()
    value=''



    override render(){

        return html` 
        <label>
          <slot></slot>
        </label>
        `

    }
}