import { css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import "@nuralyui/table";
import { executeCodeWithClosure } from "@runtime/core/Kernel.ts";
import { getNestedAttribute } from "@shared/utils/object.utils.ts";
import { ref } from "lit/directives/ref.js";



@customElement("table-block")
export class TextInputBlock extends BaseElementBlock {
  static styles = [
    css``
  ];
  @property({ type: Object })
  component: ComponentElement;
  @property({ type: Object })
  item: any;
  @state()
  headers = [
    {
      name: "Id",
      key: "id"
    },
    {
      name: "Status",
      key: "status"
    },
    {
      name: "Priority",
      key: "priority"
    },
    {
      name: "Title",
      key: "title"
    },
    {
      name: "Assignee",
      key: "assignee"
    }
  ];

  @state()
  rows = [
    {
      id: 1,
      status: "Open",
      priority: "Normal",
      title: "Product Details Page - Variant Component (1)",
      assignee: "William Jones"
    },
    {
      id: 2,
      status: "Open",
      priority: "High",
      title: "Product Details Page - Variant Component (2)",
      assignee: "Natalia Hayward"
    },
    {
      id: 3,
      status: "Closed",
      priority: "Normal",
      title: "Product Details Page - Variant Component (3)",
      assignee: "Jess Plant"
    },
    {
      id: 4,
      status: "Open",
      priority: "Normal",
      title: "Product Details Page - Variant Component (4)",
      assignee: "William Jones"
    },
    {
      id: 5,
      status: "Open",
      priority: "Normal",
      title: "Product Details Page - Variant Component (5)",
      assignee: "Kathleen Knowles"
    },
    {
      id: 6,
      status: "Open",
      priority: "High",
      title: "Product Details Page - Variant Component (6)",
      assignee: "Mel Young"
    },
    {
      id: 7,
      status: "Closed",
      priority: "Normal",
      title: "Product Details Page - Variant Component (7)",
      assignee: "Zahid Allison"
    },
    {
      id: 8,
      status: "Closed",
      priority: "High",
      title: "Product Details Page - Variant Component (8)",
      assignee: "William Jones"
    }
  ];
  unsubscribe: () => void;


  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribe) this.unsubscribe();
  }

  onSelect(e: CustomEvent) {
    if (this.component.event?.onSelect) {
      const fn = executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.onSelect`) , {
        selected : e.detail
      });
      console.log(fn);
    }
  }

  onSearch(e: CustomEvent) {
    if (this.component.event?.onSearch) {
      const fn = executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.onSearch`));
      console.log(fn);
    }
  }

  onPaginate(e: CustomEvent) {
    if (this.component.event?.onPaginate) {
      const fn = executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.onPaginate`));
      console.log(fn);
    }
  }

  onSort(e: CustomEvent) {
    if (this.component.event?.onSort) {
      const fn = executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.onSort`));
      console.log(fn);
    }
  }


  renderComponent() {
    const tableStyles = this.component?.style || {};
    const tableAutoWidth = this.inputHandlersValue?.width;
    const tableAutoHeight = this.inputHandlersValue?.height;
    const headers = this.inputHandlersValue?.data ? this.inputHandlersValue?.data?.headers : this.headers;
    const rows = this.inputHandlersValue?.data ? this.inputHandlersValue?.data?.rows : this.rows;
    return html`
      <hy-table
        ${ref(this.inputRef)}
        style=${styleMap({ ...tableStyles, width: tableAutoWidth ? "auto" : tableStyles.width, "overflow": "auto" })}
        .headers="${headers}"
        .rows="${rows}"
        .size=${tableStyles.size ?? nothing}
        .withFilter=${(this.inputHandlersValue.filter == "filter")}
        .selectionMode=${this.inputHandlersValue?.selectionMode === "multiple" ? "multiple" : this.inputHandlersValue?.selectionMode === "single" ? "single" : nothing}
        @onSelect=${this.onSelect}
        @onSearch=${this.onSearch}
        @onSort=${this.onSort}
        @onPaginate=${this.onPaginate}
      >
      </hy-table>

    `;
  }
}