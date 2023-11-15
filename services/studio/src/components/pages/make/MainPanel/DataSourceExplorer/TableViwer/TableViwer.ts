import { LitElement, html, css, nothing } from 'lit';
import { property, state, customElement } from 'lit/decorators.js';

import "../DataEntryAdd/DataEntryAdd";

@customElement('table-viwer')
export class TableViwer extends LitElement {
  @property() provider: any;
  @property() table: string;
  @property() editing: boolean;
  @state() bdTabelsColumns: any[] = [{}];
  @state() entries: any[] = [];

  static override styles = css`
    :host {
      display: flex;
    }
  `;

  async updated(changedProperties) {
    if (changedProperties.has('provider') || changedProperties.has('table')) {
      await this.queryTables();
    }
  }

  async queryTables() {
    try {
      const response = await fetch(`/api/providers/${this.provider}/table/${this.table}/columns`, {
        method: 'GET',
      });
      const columns = await response.json();

      this.bdTabelsColumns = columns.map((column) => ({
        name: column.column_name,
        key: column.column_name,
        type: column.utd_name,
        filtrable: true,
        sortable: true,
      }));
      this.dispatchEvent(new CustomEvent('columns', { detail: this.bdTabelsColumns }));

      const columnNames = columns.map((column) => column.column_name);
      await this.fetchData({ columns: columnNames });
    } catch (error) {
      console.error(error);
    }
  }

  async fetchData(columns: any) {
    if (!this.provider || !this.table) {
      return;
    }

    try {
      const response = await fetch(`/api/providers/${this.provider}/table/${this.table}/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          columns: columns.columns,
        }),
      });

      const data = await response.json();

      this.entries = data.map((entry) => columns.columns.map((column) => entry[column]));
    } catch (error) {
      console.error(error);
    }
  }

  override render() {
    return html`
      ${
        this.bdTabelsColumns.length > 0
          ? html`
          <div style="    ">
              <hy-table
                .columns="${this.bdTabelsColumns}"
                .entries="${this.entries}"
                .paginationEnabled=${false}
                .editable=${this.editing}
                .activateSelection=${true}
                @row-edited=${(e)=>{
                  this.dispatchEvent(new CustomEvent('row-edited', { detail: e.detail }));
                }}
              >
              </hy-table>
              </div>

            `
          : nothing
      }
    `;
  }
}

