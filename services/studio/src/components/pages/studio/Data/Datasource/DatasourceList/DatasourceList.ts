import { openTab, setCurrentTab } from '$store/actions/app';
import { $editorState } from '$store/apps';
import { loadProviders } from '$store/actions/provider';
import { $providers } from '$store/provider';
import { LitElement, html, css } from 'lit';
import { state } from 'lit/decorators.js';

export class DatasourceList extends LitElement {
	// example of datasource of posgress connection ad db in a state
	@state()
	datasources = [
	];

	static override styles = [
		css`
            :host {
                display: block;
            }
            .datasource-list{
            	margin: 10px 0;
			}
        `
	];
	connectedCallback(): void {
		loadProviders();
		super.connectedCallback();
		$providers.subscribe((datasource) => {
			if (datasource) {
				this.datasources = [...datasource];

			}
			this.requestUpdate();
		});
	}
	renderlist() {
		return html`
		${this.datasources.map((_datasource) => {
			return html`
			<div class="datasource-list">
			<hy-dropdown trigger="context-menu" 
			.options=${[ {
			      label: "Open",
			    },
			    {
			      label: "Edit",
			    },
			    {
			      label: "Delete",
			    }
			    ]}
			>
			<hy-button slot="label"

			 icon="link" @click=${(e) => this.openProvider( _datasource)}>${_datasource.label}</hy-button>
			</hy-dropdown>
			</div>
			`;
		})}

			`;
	}
	openProvider(datasource: any) {
		const openTabIndex =  $editorState.get().tabs.findIndex((tab) => tab.type === 'datasource' && tab.detail.id === datasource.providerid)
		let currentTab; 
		if(openTabIndex !== -1){
			currentTab = $editorState.get().tabs[openTabIndex];
		}else{
				currentTab = {
					id: String(Math.random()),
					type: "datasource",
					detail: {
						name: "Postgress",
						provider_type: datasource.provider_type,
						databasename: datasource.databasename,
						id: datasource.providerid,
						label: datasource.label,
					}
	
				}
				openTab(currentTab)
		}
		
		setCurrentTab(currentTab)


	}

	override render() {
		return html`
	<div class="datasource-list">
		<h3>Datasources list</h3>
		${this.renderlist()}
	</div>
        `;
	}
}
customElements.define('datasource-list', DatasourceList);