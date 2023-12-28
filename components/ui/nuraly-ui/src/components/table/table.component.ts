import styles from "./table.style.js";
import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

const EMPTY = '- - -';

@customElement('hy-table')
export class ComponentName extends LitElement {
	static override styles = styles;

	@property({ type: Array }) columns = [];
	@property({ type: Array }) entries = [];
	@property({ type: Number, state: true }) index = 0;
	@property({ type: Array, state: true }) unique = [];
	@property({ type: Array, state: true }) filter = [];
	@property({ type: Array, state: true }) _hidden: any = [];
 	@property({ type: Number }) activeRowIndex  : Number  = -1;
	@state()
	isAscending = true;

	@state()
	options = [
		{
			label: 'name option 1',
		},
		{
			label: 'latname option 1',
		},
		{ label: 'clear 2' },
		{
			label: 'hey 3',
		},
	];


	@state()
	selectedOptions: any = [];

	@state()
	editedCells: any = [];

	@state()
	page = 1;

	@state()
	pageSize = 10;

	@state()
	searchedElement = "";

	@state()
	pageSizes = [10, 25, 50]; // Define your desired page size options

	@state()
	selectedPageSize = this.pageSizes[0]; // Initialize with the default page size

	@property({ type: Boolean }) paginationEnabled = true; // New property for enabling/disabling pagination

	@property({ type: Boolean }) editable = false;
	@state()
	editedRows: any = new Set<any>();
	override render() {
		const totalEntries = this.filller().length;
		const filteredEntries = this.filller();

		// Check if pagination is enabled, and if so, calculate the pagination data
		if (this.paginationEnabled) {
			const startIndex = (this.page - 1) * this.selectedPageSize;
			const endIndex = Math.min(startIndex + this.selectedPageSize, totalEntries);
			const totalPages = Math.ceil(totalEntries / this.selectedPageSize);
			const visiblePages = 3;

			const pageButtons = [];
			for (let i = this.page - visiblePages; i <= this.page + visiblePages; i++) {
				if (i >= 1 && i <= totalPages) {
					pageButtons.push(html`
            <hy-button @click=${() => this.goToPage(i)} ?disabled=${i === this.page}>${i}</hy-button>
          `);
				}
			}

			const pageRangeStart = Math.max(1, this.page - visiblePages);
			const pageRangeEnd = Math.min(totalPages, this.page + visiblePages);

			return html`
        <hy-input style="width :200px"
        placeholder="Search" 
          @valueChange=${(e: any) => {
					this.searchedElement = e.detail.value;
					this.requestUpdate()
				}}
        ></hy-input>
        <label>Number per page:</label>

           <hy-select .options=${this.pageSizes.map(size => {
					return { label: size };
				})}  @changed=${this.pageSizeChangeHandler}> <hy-button
   
    >${this.selectedPageSize}</hy-button></hy-select>



        
        <table >
          <thead>
            <tr @click="()=>console.log(cell)" g>
              ${this.columns.map((cell: any, index) => {
					const classes = classMap({ active: this.filter[index] !== undefined });
					return html`
                  <th class=${classes} style="padding: 6px 5px 0 10px;">
                    <p>${cell.name}</p>

                    <div style="display: inline-flex;float: right;">
                      <div
                        style="align-items: center;
                              display: inline-flex;
                              flex-direction: column;"
                      >
                      ${cell.sortable ? html`
                      	 <hy-icon name="angle-up" style="margin-bottom: -7px;" @click=${() => this.sort(index, true)}></hy-icon>
                        <hy-icon name="angle-down" @click=${() => this.sort(index, false)}></hy-icon>
                      	` : nothing
						}
                       
                      </div>

                       ${cell.filtrable ? html`
                      		
                      <hy-select @click=${this.onSelect} selectionMode="multiple" .options=${this.options} @changed=${(e: any) => {
							this.selectedOptions[index] = e.detail.value;
							this.requestUpdate();
						}}>
                        <hy-button  style="--hybrid-button-border-width:0" icon="filter">${this.selectedOptions[index]?.length ? this.selectedOptions[index].length : ' '}</hy-button>
                      </hy-select>
                      	` : nothing
						}


                    </div>
                  </th>
                `;
				})}
            </tr>
          </thead>
          <tbody>
            ${filteredEntries.slice(startIndex, endIndex).map((entry, index) => this.renderEntry(entry, index))}
          </tbody>
        </table>
        <div class="pagination">
          <hy-button @click=${() => this.previousPage()} ?disabled=${this.page === 1}>Previous</hy-button>
          ${pageButtons}
          <hy-button @click=${() => this.nextPage()} ?disabled=${endIndex >= totalEntries}>Next</hy-button>
        </div>
        <p>Total Entries: ${totalEntries}</p>
        <p>Page ${this.page} of ${totalPages}</p>
        <p>Page Range: ${pageRangeStart} - ${pageRangeEnd}</p>
      `;
		} else {
			// When pagination is disabled, display all entries without pagination
			return html`
        <table >
          <thead>
            <tr @click="()=>console.log(cell)" >
              ${this.columns.map((cell: any, index) => {
				const classes = classMap({ active: this.filter[index] !== undefined });
				return html`
                  <th class=${classes} style="padding: 6px 5px 0 10px;">
                    <p>${cell.name}</p>

                    <div style="display: inline-flex;float: right;">
                      <div
                        style="align-items: center;
                              display: inline-flex;
                              flex-direction: column;"
                      >
                        <hy-icon name="angle-up" style="margin-bottom: -7px;" @click=${() => this.sort(index, true)}></hy-icon>
                        <hy-icon name="angle-down" @click=${() => this.sort(index, false)}></hy-icon>
                      </div>
                      <hy-select @click=${this.onSelect} .options=${this.options} @changed=${(e: any) => {
						this.selectedOptions[index] = e.detail.value;
						console.log(this.selectedOptions);

						this.requestUpdate();
					}}>
                        <hy-button type="link" icon="filter">${this.selectedOptions[index]?.length ? this.selectedOptions[index].length : ' '}</hy-button>
                      </hy-select>
                    </div>
                  </th>
                `;
			})}
            </tr>
          </thead>
          <tbody>
            ${filteredEntries.map((entry, index) => this.renderEntry(entry, index))}
          </tbody>
        </table>
        <p>Total Entries: ${totalEntries}</p>
      `;
		}
	}

	sort(index: number, isAscending = false) {
		this.index = index;
		this.isAscending = isAscending;
		this.entries = [...this.entries.sort((a, b) => {
			const valueA: any = String(a[index]);
			const valueB: any = String(b[index]);
			return isAscending ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
		})];
	}

	renderEntry(entry: any, index: number) {
		const matches = entry.every((cell: any, index: any) => {
			return this.filter[index] === undefined || this.filter[index] == cell;
		});
		if (matches) {
			this._hidden[index] = true;
			return html`
       	
       	<tr
        @click=${()=>{this.emitRowClickEvent(entry , index)}}
        
 		class=${classMap({ "row-edited" : this.editedRows.has(entry) , "active-row" : this.activeRowIndex === index })}
        >
          ${entry.map((cell: any , index: number) => {
				return html`
              <td contenteditable=${this.editable}   @input=${(e:any)=>{
              	console.log(e.target.textContent, index);
              	entry[index] = e.target.textContent;
              	cell = e.target.textContent;
        	if(!this.editedRows.has(entry)){
        		this.editedRows.add(entry);
        		this.editedRows = new Set(this.editedRows);
        	}
        		this.dispatchEvent(new CustomEvent('row-edited', { detail: this.editedRows}));
        }}>
                <p>${cell}</p>
              </td>
            `;
			})}
        </tr>
      `;
		}
		delete this._hidden[index];
		return '';
	}
	emitRowClickEvent(entry: any, index: number) {
		this.activeRowIndex = index;
		this.dispatchEvent(new CustomEvent('row-click', { detail: {row : entry , index} }));
	}
	onSelect(event: any) {
		if (this.head.includes(event.target.parentNode.parentNode.parentNode)) {
			const index = this.head.indexOf(event.target.parentNode.parentNode.parentNode);
			if (this.index === null || this.index !== index) {
				this.index = this.head.indexOf(event.target.parentNode.parentNode.parentNode);
				let column = this.entries.map(row => row[index]);
				this.unique = [...new Set(column)];
			} else {
				(this.index as any) = null;
			}
		}
		this.renderFilter();
	}

	onApply(event: any) {
		if (!event.target.classList.contains('disable')) {
			const column = event.target.parentNode.parentNode;
			const index = this.head.indexOf(column);
			const value = event.target.textContent;
			value === EMPTY ? delete this.filter[index] : (this.filter[index] as any) = value;
			(this.index as any) = null;
			this.page = 1; // Reset page to 1 when a filter is applied
		}
	}

	renderFilter() {
		this.options = [];
		this.unique.map(cell => {
			//const _hidden = this.filter[this.index] !== undefined && this.filter[this.index] !== cell;
			this.options.push({ label: cell });
		});
		this.requestUpdate();
	}

	get table() {
		return this.renderRoot.querySelector('table');
	}

	get head() {
		return Array.from(this.table!.querySelectorAll('thead th'));
	}

	get body() {
		return Array.from(this.table!.querySelectorAll('tbody tr'));
	}

	previousPage() {
		if (this.page > 1) {
			this.page--;
			this.requestUpdate();
		}
	}

	nextPage() {
		const endIndex = (this.page - 1) * this.selectedPageSize + this.selectedPageSize;
		if (endIndex < this.entries.length) {
			this.page++;
			this.requestUpdate();
		}
	}

	goToPage(pageNumber: number) {
		this.page = pageNumber;
		this.requestUpdate();
	}

	filller() {
		// Filter over all selectedOptions indexes
		return this.entries.filter((entry: any) => {
			return this.selectedOptions.every((selectedOption: any, index: any) => {
				if (!selectedOption?.length) return true;
				return selectedOption.some((option: any) => {
					return String(option.label).includes(entry[index]);
				});
			});
		}).filter((entry: any) => {
			// Filter entries based on the searchedElement
			if (this.searchedElement.trim() === '') {
				return true; // Return all entries when no search text is provided
			}

			// Check if any cell in the entry contains the searchedElement
			return entry.some((cell: any) => {
				return String(cell).toLowerCase().includes(this.searchedElement.trim().toLowerCase());
			});
		});
	}

	pageSizeChangeHandler(event: CustomEvent) {
		const newSize = parseInt(event.detail.value.label, 10);
		this.selectedPageSize = newSize;
		this.page = 1; 

	}
}
