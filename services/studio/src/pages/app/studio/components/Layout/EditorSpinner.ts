import { css, html, LitElement, nothing, type PropertyValues } from "lit"
import { customElement, property, state } from "lit/decorators.js"

@customElement("editor-spinner")
export class EditorSpinner extends LitElement{

  @property() data=null

  @state()
  loading=true;
  protected updated(_changedProperties: PropertyValues): void {
    if(this.data){
      this.loading =false;
    }
  }
   
 
    static styles = [
        css`
    .spinner {
        border: 4px solid rgba(0, 0, 0, 0.1); /* Light gray */
        border-top: 4px solid #8f8f8f;        /* Blue */
        border-radius: 50%;
        width: 60px;
        height: 60px;
        animation: spin 1s linear infinite;
      
        /* Centering styles */
        position: absolute;
        top: 50%;
        left: 48%;
        transform: translate(-50%, -50%);
      }
      
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
        
      }
      .loading-text {
        text-align: center;
        margin-top: 10px; /* Space between spinner and text */
        font-size: 18px;   /* Text size */
        color: #8f8f8f;    /* Text color (same as spinner top border) */
        position: absolute;
        top: calc(50% + 60px); /* Adjust based on spinner size */
        left: 50%;
        transform: translateX(-50%); /* Center horizontally */
      }
    
    `]
   



    render(){
     return html` 
     ${this.loading?
     html`  
     <div class="spinner"></div>
       <p class="loading-text">Loading editor...</p>
       `:nothing
      }`
       
    }
}
