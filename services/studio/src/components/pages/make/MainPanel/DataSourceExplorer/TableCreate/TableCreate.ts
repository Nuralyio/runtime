import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('pg-create-table')
export class TableCreate extends LitElement {
	static override styles = [
		css`
            :host {
            	float: right;
   
            }
            .footer{
            	width :100%
            }
        `
	];

	@state()
	dispalyCreateForm: boolean = false;

	@state()

	renderCreateButton(){
		return html`
			<hy-button style=" " icon="plus" @click=${
				()=>{
					this.dispalyCreateForm = true;
				}

			}></hy-button>
		`
	}
	override render() {
		return html`
		${this.renderCreateButton()}
       <modal-component label="Create Table" ?isOpen=${this.dispalyCreateForm}
       @close=${()=>{
       	this.dispalyCreateForm=false
       }}>
 

       
        <div slot="footer"
          style="float: right"
        >
         <hy-button
          danger
          icon="cancel"
            @click=${() => {
			}}
          >
            Cancel
          </hy-button>
          <hy-button
          icon="plus"
            @click=${() => {
			}}
          >
            Create
          </hy-button>
         
        </div>
	  </modal-component>
	  `;
	}
}
