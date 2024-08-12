import { LitElement,html } from "lit";
import { customElement, property } from "lit/decorators.js";

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
    defaultFallBack='https://placehold.co/50?text=image'

    private handleError(){
        const currentImgSrc = (this.shadowRoot?.querySelector('img') as HTMLImageElement).src;
        this.dispatchEvent(new CustomEvent('onError', {
            bubbles: true,
            composed: true,
            detail: {
                error:`error loading image ${currentImgSrc}`
            }
        }))
        if(this.fallback && currentImgSrc!== this.fallback && currentImgSrc!=this.defaultFallBack){
            (this.shadowRoot?.querySelector('img') as HTMLImageElement).src = this.fallback
        }
        else if(currentImgSrc!=this.defaultFallBack){
            (this.shadowRoot?.querySelector('img') as HTMLImageElement).src = this.defaultFallBack
        }
    }

    override render(){
        return html`
        <img 
        src=${this.src}
        @error=${this.handleError}
        style="width:${this.width}; height:${this.height}"
        alt=${this.alt}
        />
        
        `
    }

}