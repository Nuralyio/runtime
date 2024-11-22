import { type ComponentElement } from '$store/component/interface.ts';
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js'
import styles from './SizePaddingMarginValue.style.ts';

@customElement('size-padding-margin-value')
export class SizePaddingMarginValue extends LitElement {
    @property({ type: Object })
    component: ComponentElement;
    static styles = styles;

    @state()
    position: any ={}
    



    

connectedCallback(): void {
    super.connectedCallback();
    this.initValues();
}
    updated(changedProperties) {
        changedProperties.forEach((_oldValue, propName) => {
          if (propName === "component") {
            this.initValues();
          }
        });
      }
    initValues() {
        this.position = {
            marginLeft: this.component?.style.marginLeft ?? 0,
            marginRight: this.component?.style.marginRight ?? 0,
            marginTop: this.component?.style.marginTop ?? 0,
            marginBottom: this.component?.style.marginBottom ?? 0,
            paddingLeft: this.component?.style.paddingLeft ?? 0,
            paddingRight: this.component?.style.paddingRight ?? 0,
            paddingTop: this.component?.style.paddingTop ?? 0,
            paddingBottom: this.component?.style.paddingBottom ?? 0,
        }


        this.requestUpdate();
    }

    updateAttribute(key,value){
        let customEvent = new CustomEvent("attributeUpdate", {
          detail: {
            key,
            value,
          },
        });
        this.dispatchEvent(customEvent);
    }
   
     render() {
        return html`
        <div class="container-outside">
                <div class="margin-label" style="margin-left: -43px; margin-top: 2px">Margin </div>
                <hy-input 
                @valueChange="${(e) => this.updateAttribute('marginLeft', e.detail.value)}"
                class="position-input margin-left" placeholder="margin left" value=${this.position.marginLeft}></hy-input>
                <hy-input 
                @valueChange="${(e) => this.updateAttribute('marginRight', e.detail.value)}"
                class="position-input margin-right" placeholder="margin right" .value=${this.position.marginRight }></hy-input>
                <hy-input 
                @valueChange="${(e) => this.updateAttribute('marginTop', e.detail.value)}"
                class="position-input margin-top" placeholder="margin top" .value=${this.position.marginTop }></hy-input>
                <hy-input 
                @valueChange="${(e) => this.updateAttribute('marginBottom', e.detail.value)}"

                class="position-input margin-bottom" placeholder="margin bottom" .value=${this.position.marginBottom }></hy-input>
            <div class="container ">
                <div class="padding-label">Padding</div>
                <hy-input 
                @valueChange="${(e) => this.updateAttribute('paddingLeft', e.detail.value)}"
                class="position-input padding-left" placeholder="padding left" .value=${this.position.paddingLeft }></hy-input>

                <hy-input 
                @valueChange="${(e) => this.updateAttribute('paddingRight', e.detail.value)}"

                class="position-input padding-right" placeholder="padding right" .value=${this.position.paddingRight }></hy-input>
                <hy-input 
                @valueChange="${(e) => this.updateAttribute('paddingTop', e.detail.value)}"

                class="position-input padding-top" placeholder="padding top" .value=${this.position.paddingTop }></hy-input>
                <hy-input
                @valueChange="${(e) => this.updateAttribute('paddingBottom', e.detail.value)}"
                 class="position-input padding-bottom" placeholder="padding bottom" .value=${this.position.paddingBottom }></hy-input>

            </div>
        </div>
        `;
    }
}
