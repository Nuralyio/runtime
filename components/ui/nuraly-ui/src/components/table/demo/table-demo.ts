import {LitElement, css, html} from 'lit';
import {state} from 'lit/decorators.js';

export class TableDemo extends LitElement {
  @state()
  headers = [
    {
      name: 'Id',
      key: 'id',
    },
    {
      name: 'Status',
      key: 'status',
    },
    {
      name: 'Priority',
      key: 'priority',
    },
    {
      name: 'Title',
      key: 'title',
    },
    {
      name: 'Assignee',
      key: 'assignee',
    },
  ];

  @state()
  rows = [
    {
      id: 1,
      status: 'Open',
      priority: 'Normal',
      title: 'Product Details Page - Variant Component (1)',
      assignee: 'William Jones',
    },
    {
      id: 2,
      status: 'Open',
      priority: 'High',
      title: 'Product Details Page - Variant Component (2)',
      assignee: 'Natalia Hayward',
    },
    {
      id: 3,
      status: 'Closed',
      priority: 'Normal',
      title: 'Product Details Page - Variant Component (3)',
      assignee: 'Jess Plant',
    },
    {
      id: 4,
      status: 'Open',
      priority: 'Normal',
      title: 'Product Details Page - Variant Component (4)',
      assignee: 'William Jones',
    },
    {
      id: 5,
      status: 'Open',
      priority: 'Normal',
      title: 'Product Details Page - Variant Component (5)',
      assignee: 'Kathleen Knowles',
    },
    {
      id: 6,
      status: 'Open',
      priority: 'High',
      title: 'Product Details Page - Variant Component (6)',
      assignee: 'Mel Young',
    },
    {
      id: 7,
      status: 'Closed',
      priority: 'Normal',
      title: 'Product Details Page - Variant Component (7)',
      assignee: 'Zahid Allison',
    },
    {
      id: 8,
      status: 'Closed',
      priority: 'High',
      title: 'Product Details Page - Variant Component (8)',
      assignee: 'William Jones',
    },
  ];
  static override styles = [
    css`
      :host {
        display: block;
        width: 90%;
      }
    `,
  ];
  override render() {
    return html`
      <h1>With selection</h1>
      <h3>Multiple selection</h3>
      <nr-table  
      @onSelect=${(e:CustomEvent)=>{
        console.log('selected', e.detail.value)
      }} 
      @onPaginate=${(e:CustomEvent)=>{
        console.log('page ',e.detail.value)
      }}
      @onSort=${(e:CustomEvent)=>{
        console.log('sorted ', e.detail.value)
      }}
      .headers="${this.headers}" .rows="${this.rows}" .selectionMode=${'multiple'}></nr-table>
      <h3>Single selection</h3>
      <nr-table .headers="${this.headers}" .rows="${this.rows}" .selectionMode=${'single'}></nr-table>
      <h1>With Expandable attribute (title)</h1>
      <nr-table .headers="${this.headers}" .rows="${this.rows}" .expandable=${'title'}></nr-table>
      <h1>With filter: search</h1>
      <nr-table .headers="${this.headers}" .rows="${this.rows}" .withFilter=${true}></nr-table>
      <h3>filter + expandable attribute (priority)</h3>
      <nr-table
        .headers="${this.headers}"
        .rows="${this.rows}"
        .withFilter=${true}
        .expandable=${'priority'}
        @onSelect=${(e:CustomEvent)=>{
          console.log('selected', e.detail.value)
        }}
        @onSearch=${(e:CustomEvent)=>{
          console.log('searched ',e.detail.value)
        }}
        @onSort=${(e:CustomEvent)=>{
          console.log('sorted ', e.detail.value)
        }}
      ></nr-table>

      <h1>Sizes</h1>
      <h3>Small size with selection</h3>
      <nr-table
        .headers="${this.headers}"
        .rows="${this.rows}"
        .size=${'small'}
        .selectionMode=${'multiple'}
      ></nr-table>
      <h3>Large size</h3>
      <nr-table .headers="${this.headers}" .rows="${this.rows}" .size=${'large'}></nr-table>
      <h3>Large size with multiple selection</h3>
      <nr-table
        .headers="${this.headers}"
        .rows="${this.rows}"
        .size=${'large'}
        .selectionMode=${'multiple'}
      ></nr-table>
    `;
  }
}
customElements.define('nr-table-demo', TableDemo);
