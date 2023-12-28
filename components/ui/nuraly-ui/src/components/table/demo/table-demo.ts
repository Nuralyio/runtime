import { LitElement, html, css } from 'lit';
import { state } from 'lit/decorators.js';

export class TableDemo extends LitElement {

	@state()
	columns = [
		{
			name : 'Id',
			sortable : true,
			filtrable : true,
			key : 'id',
		},
		{

			name : 'Status',
			sortable : true,
			filtrable : true,
			key : 'status',
		},
		{
			name : 'Priority',
			sortable : true,
			filtrable : true,
			key : 'priority',
		},
		{
			name : 'Title',
			sortable : true,
			key : 'title',
		},
		{
			name : 'Assignee',
			key : 'assignee',
		},
	];

	@state()
	entries = [
		[4865, 'Open', 'Normal', 'Product Details Page - Variant Component', 'William Jones'],
		[4844, 'Closed', 'High', 'Checkout Page - Optional steps', 'Frank Cooper'],
		[4842, 'Closed', 'Normal', 'Checkout Page - Fix box spacing', 'William Jones'],
		//generate more entries with random data 
		...Array.from({ length: 100 }, () => {
			return [
				Math.floor(Math.random() * 10000),
				Math.random() > 0.5 ? 'Open' : 'Closed',
				Math.random() > 0.5 ? 'High' : 'Normal',
				Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
				Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),

				]}),




	];
	

	static override styles = [
		css`
            :host {
                display: block;
                width: 1000px;
            }
            hy-table{

            }
        `
	];

	override render() {
		return html`
        <hy-table .columns="${this.columns}" .entries="${this.entries}" ></hy-table>
        `;
	}
}
customElements.define('hy-table-demo', TableDemo);