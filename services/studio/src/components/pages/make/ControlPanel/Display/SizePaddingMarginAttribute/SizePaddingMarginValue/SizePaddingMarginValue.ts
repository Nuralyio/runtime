import { ComponentElement } from '$store/component/interface';
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js'

@customElement('size-padding-margin-value')
export class SizePaddingMarginValue extends LitElement {
    @property({ type: Object })
    component: ComponentElement;
    static styles = [
        css`
            :host {
                display: block;
            }
            .input-group {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 300px; /* Adjust the width as needed */
            margin: 10px;
        }
        `
    ];

    render() {
        return html`
      <!--  <hy-input placeholder="width" .value=${this.component.style.width ?? "auto"}></hy-input>
        <hy-input placeholder="height" .value=${this.component.style.height  ?? "auto"}></hy-input>-->
        <div style="display:flex ; height : 100px ;     display: flex;
           border: 1px solid #bcbcbc;
    border-radius: 3px;
    padding: 5px;
           ">
            <hy-input  style="
            
            
            display: block;
    margin-left: -4px;
    height: 50px;
    width: 40px;
    margin-top: 40px;
    position: absolute;
    
    " placeholder="padding left" .value=${this.component.style.paddingLeft  ?? "0"}></hy-input>



        <hy-input    style="  
            
            display: block;
    margin-left: 264px;
    height: 50px;
    width: 40px;
    margin-top: 40px;
    position: absolute;" placeholder="padding right" .value=${this.component.style.paddingRight  ?? "0"}></hy-input>
      

        <hy-input     style="    display: block;
    height: 50px;
    margin-top: -4px;
    width: 40px;

    position: absolute;
    margin-left: 141px;" placeholder="padding top" .value=${this.component.style.paddingTop  ?? "0"}></hy-input>
        <hy-input     style=" display: block;
    height: 50px;
    width: 40px;
    margin-top: 73px;
    position: absolute;
    margin-left: 141px;" placeholder="padding bottom" .value=${this.component.style.paddingBottom  ?? "0"}></hy-input>

        </div>
       
        <!--hy-input  placeholder="margin left" .value=${this.component.style.marginLeft  ?? "0"}></hy-input>
        <hy-input  placeholder="margin right" .value=${this.component.style.marginRight  ?? "0"}></hy-input>
        <hy-input  placeholder="margin top" .value=${this.component.style.marginTop  ?? "0"}></hy-input>
        <hy-input  placeholder="margin bottom" .value=${this.component.style.marginBottom  ?? "0"}></hy-input-->
        `;
    }
}
