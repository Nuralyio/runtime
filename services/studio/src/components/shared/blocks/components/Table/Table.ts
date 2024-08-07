import { html, css, type PropertyValues, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface";
import { executeHandler } from "core/helper";
import { BaseElementBlock } from "../BaseElement";
import "@hybridui/table"
const isVerbose = import.meta.env.PUBLIC_VERBOSE;

// Debounce function with default wait time
function debounce(func, wait = 300) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

@customElement("table-block")
export class TextInputBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  static styles = [
    css``,
  ];

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
  unsubscribe: () => void;



  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribe) this.unsubscribe();
  }

  // Debounced event handler with default debounce wait time
  handleValueChange = debounce((e) => {
    if (this.component?.event?.valueChange) {
      executeHandler(
        {
          component: this.component,
          type: `event.valueChange`,
          extras: {
            EventData: {
              value: e.detail.value,
            },
          },
        }
      );
    }
  }, 300); // Adjust the debounce wait time as needed.

  render() {
    const inputStyles = this.component?.style || {};
    return html`
    <hy-table
    .headers="${this.headers}" .rows="${this.rows}" .selectionMode=${'multiple'}>

    </hy-table>
      
    `;
  }
}