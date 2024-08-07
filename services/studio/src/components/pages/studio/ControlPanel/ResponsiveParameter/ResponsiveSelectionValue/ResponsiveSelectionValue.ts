import { setCurrentPageViewPort } from '$store/actions/page';
import { $currentPageViewPort } from '$store/page';
import { LitElement, html, css } from 'lit';
import { state } from 'lit/decorators.js';

export class ResponsiveSelection extends LitElement {
    static override styles = [
        css`
            :host {
                display: block;
            }

            hy-radio-input{
              --hybrid-button-font-size : 15px;
            }
        `
    ];


  @state()
  label = "laptop";

    handleValueChange(event: CustomEvent) {
    const {
      detail: { value },
    } = event;
    let customEvent = new CustomEvent("parametersUpdate", {
      detail: {
        value: value.value,
      },
    });
    this.label = value.value;
    this.dispatchEvent(customEvent);
  }

    @state()
	  options = [
	  	{ 
	  		label :"Laptop",
	  		value : "laptop",
         button: {
          icon: "laptop",
        },
	  	},
	  	{
	  		label :"Tablet",
	  		value : "tablet",
         button: {
          icon: "tablet",
        },
	  	},
	  	{
	  		label :"Mobile",
	  		value : "mobile",
         button: {
          icon: "mobile",
        },

	  	},
	  ];

    constructor(){
      super();
      $currentPageViewPort.subscribe((viewPort) => {
        this.label = viewPort;
      }
      );
    }


    override render() {
        return html`
        <hy-radio-input
      display="button"
      .selectedOption=${this.label}
      @change=${ e => setCurrentPageViewPort(e.detail.value)}
      .options=${this.options}
    ></hy-radio-input>
       
        `;
    }
}
customElements.define('responsive-selectionl-parameter-value', ResponsiveSelection);