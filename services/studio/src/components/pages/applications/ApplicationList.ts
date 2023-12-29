import { $applications } from '$store/apps';
import { deleteApplicationAction, loadOrRefreshApplications } from '$store/handler';
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import "@hybridui/dropdown";	
import './ApplicationAdd';
import './ApplicationDelete';
import { showCreateApplicationModalAction } from '$store/app.action';

@customElement('applications-list')
export class ApplicationList extends LitElement {
	@state()
	applications: any[] = [];

	@state()
	displayModal = false;

	static override styles = [
		css`
           

           .container{
           		display: flex;
           		flex-wrap: wrap;

           }
           .card{
				width: 20%;
				background-color: rgb(41 48 65 );
			    border-radius: 9px;
			    padding: 15px;
			    margin: 5px;
			    min-height: 159px;
			    color : #9e9e9e;
			    width: 223px;
           }

           .card:hover{
           	cursor: pointer;
           }
        `
	];

	options = [{
		label: "Open",
		handler(application) { console.log(application) },
	},];

	generateOption(application: any) {
		return [{
			label: "Open",
			handler: () => {
				console.log(application);
				location.href = "/app/" + application.uuid;
			}
		},
		{
			label: "Preview",
			icon: "plus",
			handler: () => {
				console.log(application);
				location.href = "/app/view/" + application.uuid;
			}
		},
		{
			label: "delete",

			handler: () => {

				const prompt = confirm("Are you sure you want to delete this application ?");
				if (prompt) {
					deleteApplicationAction(application.uuid);
				}
			}
		}
		]
	}

	constructor() {

		super();

		$applications.subscribe((apps: any) => {
			this.applications = apps;
		}
		);

	}
	override connectedCallback(): void {
		super.connectedCallback();
		loadOrRefreshApplications();
	}
	override render() {
		return html`
		<div class="container">
        ${this.applications?.map((application: any) => html`
        	  <hy-dropdown
        placeholder="Select an option"
        .options=${this.generateOption(application)}
        trigger="context-menu"
      >
       

    	   <div class="card" slot="label" @click=${()=>{
    	   	location.href = "/app/" + application.uuid;
    	   }}>
              <h2 style="margin:0"><a  style="color: white; text-decoration: none" href=${"/app/" + application.uuid}>${application.name} </a></h2>
           <p class="">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>
 
        </div>
      </hy-dropdown>
           `)}
        <div class="card" @click=${() => { showCreateApplicationModalAction() }}>
             <h2 style="    text-align: center;    margin-top: 60px; color: white"><strong>+</strong></h2>
           </div>
		</div>

		<application-add .displayModal=${this.displayModal}></application-add>

        `;
	}
}
