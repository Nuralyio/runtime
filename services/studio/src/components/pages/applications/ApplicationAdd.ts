import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import "@nuraly/modal"
import "@nuraly/button"
import "@nuraly/icon";

import { Validations } from '@nuraly/input';
import { $showCreateApplicationModal } from '$store/apps';
import { closeCreateApplicationModalAction } from '$store/actions/app';
import { createApplicationAction } from '$store/handlers/applications/handler';
export class ApplicationAdd extends LitElement {
	static override styles = [
		css`
            :host {
                display: block;
            }
               .connexion-form * {
            	margin: 10px 0;
           	} 
           	.error-message{
           		color : red;
           	}
        `
	];
	@property({ type: Boolean })
	displayModal;

	@state()
	errorMessage: any[] = [];

	@state()
	createProviderformSubmitted: boolean = false;

	@state()
	providerIsValide: boolean = false;

	@state()
	createProviderform = {
		name: {
			type: 'text',
			value: '',
			placeholder: 'Name',
			validataions: [
				{
					errorMessage: 'name is required',
					test: Validations.NOT_EMPTY
				},
			]

		},
	}

	constructor() {
		super();
		$showCreateApplicationModal.subscribe((displayModal) => this.displayModal = displayModal)
	}
	submitForm() {
		this.createProviderformSubmitted = true;
		this.errorMessage = [];
		Object.keys(this.createProviderform).forEach((key) => {
			this.createProviderform[key].validataions?.forEach((validation) => {
				if (!validation.test.test(this.createProviderform[key].value)) {
					console?.log(validation.errorMessage);
					this.errorMessage[key] = validation.errorMessage;
				}
			})
		})
		this.requestUpdate()
		if (this.errorMessage.length === 0) {
			createApplicationAction({
				name: this.createProviderform.name.value,
			});
		}
	}

	override render() {
		return html`
         <modal-component label="Create Application" ?isOpen=${this.displayModal}
	       @close=${() => {
				closeCreateApplicationModalAction()
			}}>

	       ${Object.keys(this.createProviderform).map((key) => {
				return html`
    		<hy-input
    		.placeholder=${this.createProviderform[key].placeholder}
    		.type=${this.createProviderform[key].type}
    		.value=${this.createProviderform[key].value}
    		@valueChange=${(e: CustomEvent) => {
						this.createProviderform[key].value = e.detail.value;
						if (this.createProviderformSubmitted) {
							//this.submitForm();
						}	
						this.requestUpdate()
					}
					}

    		></hy-input>
    		<div class="error-message">
    		${this.errorMessage[key] ? this.errorMessage[key] : nothing}
    		</div>
    		`
			})}

        <div slot="footer"
          style="float: right"
        >
         <hy-button
          danger
          .icon=${['cancel']}
            @click=${() => {
				closeCreateApplicationModalAction()
			}}
          >
            Cancel
          </hy-button>
          <hy-button
          .icon=${['plus']}
            @click=${() => {
				this.submitForm();
			}}
          >
            Create
          </hy-button>
         
        </div>
	  </modal-component>
	  `;
	}
}
customElements.define('application-add', ApplicationAdd);


