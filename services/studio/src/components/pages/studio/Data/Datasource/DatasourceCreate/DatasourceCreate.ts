import { openTab } from '$store/actions/app';
import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { Validations } from '@nuralyui/input';
import { loadProviders } from '$store/actions/provider';

@customElement('data-source-create')
export class DataSourceCreate extends LitElement {

	@state()
	errorMessage: any[] = [];

	@state()
	createProviderformSubmitted: boolean = false;

	@state()
	providerIsValide: boolean = false;

	@state()
	createProviderform = {
		url: {
			type: 'text',
			value: 'localhost',
			placeholder: 'host',
			validataions: [
				{
					errorMessage: 'host is required',
					test: Validations.NOT_EMPTY
				},
			]

		},
		label: {
			type: 'text',
			value: 'portal '+Math.random(),
			placeholder: 'label',
			validataions: [
				{
					errorMessage: 'label is required',
					test: Validations.NOT_EMPTY
				},
			]

		},

		port: {
			type: 'number',
			value: '5432',
			placeholder: 'port',
			validataions: [
				{
					errorMessage: 'port is required',
					test: Validations.NOT_EMPTY
				},
				{
					errorMessage: 'Invalid port',
					test: Validations.PORT
				}
			]
		},
		database: {
			type: 'text',
			value: 'postgres',
			placeholder: 'database',
			validataions: [
				{
					errorMessage: 'database is required',
					test: Validations.NOT_EMPTY
				},
			]
		},
		username: {
			type: 'text',
			value: 'postgres',
			placeholder: 'username',
			validataions: [
				{
					errorMessage: 'username is required',
					test: Validations.NOT_EMPTY
				},
			]
		},
		password: {
			type: 'password',
			value: 'postgres',
			placeholder: 'password',
			validataions: [
				{
					errorMessage: 'password is required',
					test: Validations.NOT_EMPTY
				},
			]
		},
	}

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

	@state()
	showCreateForm = false;


	renderForm() {
		return html`
		<div class="connexion-form">
			<h3>Connect to Postgress </h3>
    	${Object.keys(this.createProviderform).map((key) => {
			return html`
    		<hy-input
    		.placeholder=${this.createProviderform[key].placeholder}
    		.type=${this.createProviderform[key].type}
    		.value=${this.createProviderform[key].value}
    		@valueChange=${(e: CustomEvent) => {
					this.createProviderform[key].value = e.detail.value;
					if (this.createProviderformSubmitted) {
						this.submitForm();
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
    	
${this.providerIsValide ? html`
    	<hy-button type="primary" icon="database" @click=${() => {
					this.saveProvider();
				}
				}>Save</hy-button>

	` : html` <hy-button type="primary" icon="database" @click=${() => {
				this.submitForm();
				/*openTab({
					id: String(Math.random()),
					type: "datasource",
					detail: {
						name: "Postgress",
						id: String(Math.random()),
					}
	
				})*/
			}
				}>Connect</hy-button>
	`
			}
    	<hy-button  @click=${() => {

				this.showCreateForm = false;
				this.providerIsValide = false;
			}}
    		>Cancel</hy-button>
		</div>
		`
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
			this.checkProviderConnection();
		}
	}


	checkProviderConnection() {
		fetch("/api/providers/postgres/validate", {

			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				"host": this.createProviderform.url.value,
				"port": Number(this.createProviderform.port.value),
				"database": this.createProviderform.database.value,
				"username": this.createProviderform.username.value,
				"password": this.createProviderform.password.value
			})
		}).then((response) => {
			if (response.status === 200) {
				this.providerIsValide = true;
			} else {
				this.providerIsValide = false;
				alert("Connection failed");
			}
			
		})
	}


	saveProvider() {
		fetch("/api/providers/postgres", {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				"host": this.createProviderform.url.value,
				"port": Number(this.createProviderform.port.value),
				"label": this.createProviderform.label.value,
				"database": this.createProviderform.database.value,
				"username": this.createProviderform.username.value,
				"password": this.createProviderform.password.value
			})
		}).then((response) => {
			if(response.status === 200){
				loadProviders();
				this.showCreateForm = false;
			}
			
		})

	}


	override render() {
		return html`


    	${!this.showCreateForm ? html`<hy-button icon="plus" type="primary" @click="${() => this.showCreateForm = true}">add datasource </hy-button>` : nothing}


		
		${this.showCreateForm ? this.renderForm() : nothing}`;
	}
}