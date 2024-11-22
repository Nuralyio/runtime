import "../Page/Page.ts";
import "./DataSourceExplorer/DataSourceExplorer.ts";
import "./EditorInteractivePanel.ts";
import { closeTab } from "$store/actions/app.ts";
import { $editorState } from "$store/apps.ts";
import { LitElement, css, html } from "lit";
import { state } from "lit/decorators.js";

export class TabsPanel extends LitElement {
	static override styles = [
		css`
            :host {
                display: block;
                background-color: #2d2d2d;
                font-family: 'Roboto', sans-serif;
            }
            hy-tabs  {
            	--hybrid-menu-background-color: #2c2c2c;
		        --hybrid-tabs-label-font-size: 12px;
		          --hybrid-button-border-color: transparent;
          		}

        `
	];
	@state()
	activeTab = 0;

	@state()
	editableTabs = [
		{
			id: '1',
			label: 'Page name',
			content: html`
  	  <editor-interactive-panel >
          <content-page></content-page>
        </editor-interactive-panel>
  	`,
			editable: {
				canDeleteTab: false,
			}
		},
		{
			id: '2',
			label: 'Data source',
			content: html`
  	<data-source-explorer></data-source-explorer>`
		}
	];

	constructor() {
		super();
		
	}
	override connectedCallback() {
		super.connectedCallback();
		$editorState.subscribe((editorState) => {
			this.editableTabs = [
				{
					id: '1',
					label: 'Page name',
					content: html`
					  	  <editor-interactive-panel >
					          <content-page></content-page>
					        </editor-interactive-panel>
					  	`,
					editable: {
						canDeleteTab: false,
					}
				}
			];
			editorState.tabs.forEach((tab) => {
				switch (tab.type) {
					case 'datasource':
						this.editableTabs.push({
							id: tab.id,
							label: `${tab.detail?.provider_type }/${tab.detail?.databasename } : ${tab.detail?.label }`,
							content: html`
						  	<data-source-explorer .detail=${tab.detail}></data-source-explorer>`
						});
						break;

				}
			});
			if (editorState.currentTab) {
				const tabindex = editorState.tabs.findIndex((tab: any) => tab.id === editorState.currentTab.id);
				if(tabindex>0){
					// @TODO: to be reviewed
					//this.activeTab = tabindex;
					this.requestUpdate();
				}
				
			}
			this.editableTabs = [...this.editableTabs];

		});
	}

	override render() {
		return html`
		${this.editableTabs.length === 1 ? html`
		<editor-interactive-panel >
          <content-page></content-page>
        </editor-interactive-panel>` : html`
         <hy-tabs
  		.activeTab=${this.activeTab}
  		@removeTab=${(e: CustomEvent) => {
					
					closeTab(this.editableTabs[e.detail.index])
					//this.editableTabs = this.editableTabs.filter((tab, index) => index !== e.detail.index);
				}}
        .tabs=${this.editableTabs}
        .editable=${{
					canDeleteTab: true,
					canEditTabTitle: false,
					canAddTab: false,
					canMove: false,
				}}
      ></hy-tabs>
      ` }
       
        `;
	}
}
customElements.define('tabs-panel', TabsPanel);