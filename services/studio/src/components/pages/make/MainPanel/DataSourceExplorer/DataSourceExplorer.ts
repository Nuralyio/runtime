import { LitElement, html, css, nothing, type PropertyValueMap } from 'lit';
import { property, state } from 'lit/decorators.js';

import "./TableViwer/TableViwer";
import { getActiveTable, setActiveTable } from '$store/providers/store';

export class DatasourceExplorer extends LitElement {
	@property({ type: Object })
	detail: any;

	@state()
	currentTable = ""

	@state()
	bdTabelsColumns: any[] = [
		{
			name: 'Table',
			key: 'table',
			filterable: true,
		}];
	@state()
	tableColumns: any[] = []
	@state()
	activeRowIndex: any = null;
	@state()
	bdTabels: any[] = [];
	static override styles = [
		css`
            :host {
                display: block;
            	background-color: #fff;
            	

            }
            .datasource-explorer{
            	    height: 100vh;

            }
            .db-tables{
            	padding: 15px;
            	
            }
            hy-table {
            	width : 200px;
            	--hy-table-width: 150px;
            }
            .container{
            	display: flex;
            	flex-direction: row;
			}
			.first_column{
				width: 200px;
			}
			.table-name{
				font-size: 28px;
    			font-weight: 400;
    			margin-bottom: 11px;

			}
			@media (prefers-color-scheme: dark) {
				:host {
					background: rgb(65 65 65);
   				color: white;
   					}	
   				}

        `
	];


	openProvider(datasource: any) {
		fetch('/api/providers/' + datasource.id + '/tables'
		
		).then((responce) => {
			if (responce.status == 200) {	
				responce.json().then((data) => {
					this.bdTabels = data;
				})
			}else{
				this.bdTabels = [];
			}
			const activeTable = getActiveTable(this.detail?.id);
			this.activeRowIndex = this.bdTabels.findIndex((table) => table == activeTable);

			if(activeTable){
				this.currentTable = activeTable;
			}
			this.requestUpdate();
		}
		);
	}
	updated(changedProperties) {
		if (changedProperties.has('detail')) {

			this.openProvider({ id: this.detail?.id });

			this.displayForm = false;
		}
	}

	override connectedCallback(): void {
		console.log(this.detail)
		super.connectedCallback();
		this.openProvider({ id: this.detail?.id });
	}

	dbTableRowClickHandler(event: any) {
	const {row, index} = event.detail;
		this.activeRowIndex = index;
		this.currentTable = event.detail.row[0]	;
		setActiveTable(this.detail?.id, this.currentTable);
		this.displayForm = false;
	}
	@state()
	displayForm = false;
	@state()
	editing = true;

@state()
editedRow : Set<any> = new Set();

protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    
    const childComponent = this.shadowRoot.querySelector('table-viwer');
    if (childComponent) {
    }
}
	override render() {
		return html`
		<div class="container">
	        <div class="datasource-explorer first_column">
				<div class="db-tables">
				<div class="table-name">Tables</div>
					 <hy-table 
					 .columns="${this.bdTabelsColumns}" 
					 .paginationEnabled=${false} 
					 .entries="${this.bdTabels.map(table => {
								return [table]
							})}"
					 @row-click=${this.dbTableRowClickHandler}
					 .activeRowIndex=${this.activeRowIndex}
					 >
		        	</hy-table>
		        </div>
	        </div>
	        <div class="db-tables">
				<div class="table-name">${this.currentTable}  <hy-button style="" icon="plus" 
				@click="${() => this.displayForm = true}"
				 > Add entry</hy-button>
 <hy-button style="" type="${this.editing ? "primary" : ""}" icon="pen" 
				@click="${() => this.editing = !this.editing}"
				 > Edit</hy-button>
${this.editedRow.size > 0 ? html` <hy-button  style="" icon="save" 
				@click="${() => this.displayForm = true}"
				 > save</hy-button>
`	: nothing}

${this.editedRow.size > 0 ? html` <hy-button  style="" icon="cancel" 
				@click="${() => {
					(this.shadowRoot.querySelector('table-viwer') as any).queryTables()
				}}"
				 > reset</hy-button>
`	: nothing}
				
				 </div>

	        <table-viwer .table=${this.currentTable} .provider=${ this.detail?.id}
	@columns=${(e)=>this.tableColumns = e.detail}
	.editing=${this.editing}
	       
 @row-edited=${(e)=>{
 	this.editedRow = e.detail;
 	// loop through set in js

 	//this.editedRow is an array of Set
 	for (const row of this.editedRow){
 		let i = 0;
		const query = {
 			wheres : {
 				[this.tableColumns[0].key] : (row as any)[0]
 			},
 			updates : {
 				...this.tableColumns.reduce((acc, column)=>{
 					if(column.key !== this.tableColumns[0].key){
 						acc[column.key] = (row as any)[i]
 					}
 						i++
 					
 					return acc;
 				}, {})
 			}
 		}
 		console.log(query ,'query')

 	}

 		
 	console.log(this.editedRow, this.tableColumns)
                }}
	        ></table-viwer>

	        </div>
	        ${this.displayForm ? html`
	        <div  style="    width: 25%; padding: 25px "> <data-entry-add 
	        @cancel=${()=>this.displayForm = false}
	        .columns=${this.tableColumns}></data-entry-add></div>
	        `	: nothing}
	     </div>
        `;
        
	}
}
customElements.define('data-source-explorer', DatasourceExplorer);


