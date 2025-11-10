import { css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import "@nuralyui/table";
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

  renderComponent() {
    const tableStyles = this.component?.style || {};
    const tableAutoWidth = this.inputHandlersValue?.width;
    const tableAutoHeight = this.inputHandlersValue?.height;
    
    // Get data from inputHandlers or use defaults
    const headers = this.inputHandlersValue?.data ? this.inputHandlersValue?.data?.headers : this.headers;
    const rows = this.inputHandlersValue?.data ? this.inputHandlersValue?.data?.rows : this.rows;
    
    // Properly type the size (from style)
    const size = (tableStyles.size as 'small' | 'normal' | 'large') || 'normal';
    
    // Get selection mode from input or inputHandlers
    const selectionModeValue = this.component?.input?.selectionMode?.value || this.inputHandlersValue?.selectionMode;
    const selectionMode = selectionModeValue === "multiple" 
      ? "multiple" as const
      : selectionModeValue === "single" 
        ? "single" as const
        : undefined;
    
    // Get other properties from input or inputHandlers
    const filter = this.component?.input?.filter?.value || this.inputHandlersValue?.filter;
    const fixedHeader = this.component?.input?.fixedHeader?.value ?? this.inputHandlersValue?.fixedHeader ?? false;
    const loading = this.component?.input?.loading?.value ?? this.inputHandlersValue?.loading ?? false;
    const expandable = this.component?.input?.expandable?.value || this.inputHandlersValue?.expandable;
    const emptyText = this.component?.input?.emptyText?.value || this.inputHandlersValue?.emptyText || 'No data available';
    const emptyIcon = this.component?.input?.emptyIcon?.value || this.inputHandlersValue?.emptyIcon;
    const expansionRenderer = this.inputHandlersValue?.expansionRenderer;
    const scrollConfig = this.inputHandlersValue?.scrollConfig;
    
    return html`
      <nr-table
        ${ref(this.inputRef)}
        style=${styleMap({ 
          ...tableStyles, 
          width: tableAutoWidth ? "auto" : tableStyles.width, 
          "overflow": "auto" 
        })}
        .headers="${headers}"
        .rows="${rows}"
        .size=${size}
        .withFilter=${filter === "filter"}
        .expandable=${expandable ?? nothing}
        .expansionRenderer=${expansionRenderer ?? nothing}
        .selectionMode=${selectionMode}
        .fixedHeader=${fixedHeader}
        .scrollConfig=${scrollConfig ?? nothing}
        .loading=${loading}
        .emptyText=${emptyText}
        .emptyIcon=${emptyIcon ?? nothing}
        @onPaginate=${(e) => {
          this.executeEvent('onPaginate', e);
        }}
        @nr-select=${(e) => {
          this.executeEvent('onSelect', e);
        }}
        @onSearch=${(e) => {
          this.executeEvent('onSearch', e);
        }}
        @onSort=${(e) => {
          this.executeEvent('onSort', e);
        }}
      >
      </nr-table>

    `;
  }
}