import { LitElement,PropertyValues,html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement('hy-image')
export class HyImage extends LitElement{

    @property()
    src!:string

    @property()
    fallback=null
    
    @property()
    width='auto'

    @property()
    height='auto'

    @property()
    alt=''

    @state()
    image=''
    defaultFallBack='https://placehold.co/50?text=image'


    override willUpdate(_changedProperties: PropertyValues): void {
        if(_changedProperties.has('fallback') || _changedProperties.has('src')){
            this.image = this.src;
        }
    }

    
    private handleError(){
        this.dispatchEvent(new CustomEvent('onError', {
            bubbles: true,
            composed: true,
            detail: {
                error:`error loading image ${this.image}`
            }
        }))
        if(this.fallback && this.image!== this.fallback && this.image!=this.defaultFallBack){
            this.image = this.fallback
        }
        else if(this.image!=this.defaultFallBack){
            this.image = this.defaultFallBack
        }
    }

    override render(){
        return html`
        <img 
        src=${this.image}
        @error=${this.handleError}
        style="width:${this.width}; height:${this.height}"
        alt=${this.alt}
        />
        
        `
    }

}