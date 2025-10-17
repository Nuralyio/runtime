import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './index.js';

/**
 * ## Table
 * 
 * Advanced table component with sorting, filtering, pagination, and selection capabilities.
 * Supports both single and multiple selection modes, expandable rows, and customizable sizing.
 * 
 * ### When to use
 * - Display structured data in rows and columns
 * - Enable users to sort, filter, and search through data
 * - Allow users to select one or multiple rows for actions
 * - Paginate large datasets for better performance
 * 
 * ### When not to use
 * - For simple lists, use a list component instead
 * - For very small datasets (< 5 items), consider a simpler display format
 * 
 * ### Features
 * - **Sorting**: Click column headers to sort data
 * - **Filtering**: Search/filter table rows
 * - **Pagination**: Navigate through pages of data
 * - **Selection**: Single or multiple row selection
 * - **Expandable rows**: Show additional row details
 * - **Responsive sizing**: Small, normal, and large variants
 */
const meta: Meta = {
  title: 'Data Display/Table',
  component: 'nr-table',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Advanced table component with sorting, filtering, pagination, and selection capabilities. Follows best practices for data table interactions and accessibility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    // Core Properties
    headers: {
      control: {type: 'object'},
      description: 'Array of header objects defining columns',
      table: {
        category: 'Data',
        type: {summary: 'IHeader[]'},
      },
    },
    rows: {
      control: {type: 'object'},
      description: 'Array of row data objects',
      table: {
        category: 'Data',
        type: {summary: 'any[]'},
      },
    },
    size: {
      control: {type: 'select'},
      options: ['small', 'normal', 'large'],
      description: 'Table size variant',
      table: {
        category: 'Appearance',
        defaultValue: {summary: 'normal'},
      },
    },
    
    // Features
    withFilter: {
      control: {type: 'boolean'},
      description: 'Enable search/filter functionality',
      table: {
        category: 'Features',
        defaultValue: {summary: 'false'},
      },
    },
    selectionMode: {
      control: {type: 'select'},
      options: [undefined, 'single', 'multiple'],
      description: 'Enable row selection (single or multiple)',
      table: {
        category: 'Features',
        defaultValue: {summary: 'undefined'},
      },
    },
    expandable: {
      control: {type: 'text'},
      description: 'Column key for expandable row content',
      table: {
        category: 'Features',
        defaultValue: {summary: 'undefined'},
      },
    },
    fixedHeader: {
      control: {type: 'boolean'},
      description: 'Enable sticky header that remains visible while scrolling',
      table: {
        category: 'Features',
        defaultValue: {summary: 'false'},
      },
    },
    scrollConfig: {
      control: {type: 'object'},
      description: 'Scroll configuration for table dimensions (x and y)',
      table: {
        category: 'Features',
        defaultValue: {summary: 'undefined'},
        type: {summary: '{ x?: number | string; y?: number | string }'},
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Sample data for stories
const sampleHeaders = [
  {name: 'Name', key: 'name'},
  {name: 'Email', key: 'email'},
  {name: 'Role', key: 'role'},
  {name: 'Status', key: 'status'},
];

const sampleRows = [
  {name: 'John Doe', email: 'john.doe@example.com', role: 'Developer', status: 'Active'},
  {name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Designer', status: 'Active'},
  {name: 'Bob Johnson', email: 'bob.johnson@example.com', role: 'Manager', status: 'Inactive'},
  {name: 'Alice Brown', email: 'alice.brown@example.com', role: 'Developer', status: 'Active'},
  {name: 'Charlie Wilson', email: 'charlie.wilson@example.com', role: 'Tester', status: 'Active'},
  {name: 'Diana Davis', email: 'diana.davis@example.com', role: 'Designer', status: 'Inactive'},
  {name: 'Eve Martinez', email: 'eve.martinez@example.com', role: 'Developer', status: 'Active'},
  {name: 'Frank Garcia', email: 'frank.garcia@example.com', role: 'Manager', status: 'Active'},
  {name: 'Grace Lee', email: 'grace.lee@example.com', role: 'Tester', status: 'Inactive'},
  {name: 'Henry Taylor', email: 'henry.taylor@example.com', role: 'Developer', status: 'Active'},
];

/**
 * Default table with basic configuration.
 */
export const Default: Story = {
  args: {
    headers: sampleHeaders,
    rows: sampleRows.slice(0, 5),
    size: 'normal',
  },
  render: (args) => html`
    <nr-table
      .headers=${args.headers}
      .rows=${args.rows}
      size=${args.size}>
    </nr-table>
  `,
};

/**
 * Table with search/filter functionality enabled.
 */
export const WithFilter: Story = {
  args: {
    headers: sampleHeaders,
    rows: sampleRows,
    size: 'normal',
    withFilter: true,
  },
  render: (args) => html`
    <nr-table
      .headers=${args.headers}
      .rows=${args.rows}
      size=${args.size}
      ?withFilter=${args.withFilter}>
    </nr-table>
  `,
};

/**
 * Table with single row selection mode.
 */
export const SingleSelection: Story = {
  args: {
    headers: sampleHeaders,
    rows: sampleRows,
    size: 'normal',
    selectionMode: 'single',
  },
  render: (args) => html`
    <nr-table
      .headers=${args.headers}
      .rows=${args.rows}
      size=${args.size}
      selectionMode=${args.selectionMode}>
    </nr-table>
  `,
};

/**
 * Table with multiple row selection mode.
 */
export const MultipleSelection: Story = {
  args: {
    headers: sampleHeaders,
    rows: sampleRows,
    size: 'normal',
    selectionMode: 'multiple',
  },
  render: (args) => html`
    <nr-table
      .headers=${args.headers}
      .rows=${args.rows}
      size=${args.size}
      selectionMode=${args.selectionMode}>
    </nr-table>
  `,
};

/**
 * Table with pagination for large datasets.
 */
export const WithPagination: Story = {
  args: {
    headers: sampleHeaders,
    rows: sampleRows,
    size: 'normal',
  },
  render: (args) => html`
    <nr-table
      .headers=${args.headers}
      .rows=${args.rows}
      size=${args.size}>
    </nr-table>
  `,
};

/**
 * Complete table with all features enabled.
 */
export const AllFeatures: Story = {
  args: {
    headers: sampleHeaders,
    rows: sampleRows,
    size: 'normal',
    withFilter: true,
    selectionMode: 'multiple',
  },
  render: (args) => html`
    <nr-table
      .headers=${args.headers}
      .rows=${args.rows}
      size=${args.size}
      ?withFilter=${args.withFilter}
      selectionMode=${args.selectionMode}>
    </nr-table>
  `,
};

/**
 * Table with Carbon Design System light theme.
 */
export const CarbonLight: Story = {
  args: {
    headers: sampleHeaders,
    rows: sampleRows.slice(0, 5),
    size: 'normal',
  },
  render: (args) => html`
    <div data-theme="carbon-light" style="padding: 1rem;">
      <nr-table
        .headers=${args.headers}
        .rows=${args.rows}
        size=${args.size}>
      </nr-table>
    </div>
  `,
};

/**
 * Table with Carbon Design System dark theme.
 */
export const CarbonDark: Story = {
  args: {
    headers: sampleHeaders,
    rows: sampleRows.slice(0, 5),
    size: 'normal',
  },
  render: (args) => html`
    <div data-theme="carbon-dark" style="padding: 1rem; background: #161616;">
      <nr-table
        .headers=${args.headers}
        .rows=${args.rows}
        size=${args.size}>
      </nr-table>
    </div>
  `,
  parameters: {
    backgrounds: {default: 'dark'},
  },
};

// ============================================
// Fixed Header Feature Stories
// ============================================

/**
 * Table with fixed header and vertical scrolling.
 * The header remains visible while scrolling through rows.
 * Useful for long tables where you need to reference column headers.
 */
export const FixedHeaderBasic: Story = {
  args: {
    headers: sampleHeaders,
    rows: Array.from({length: 50}, (_, i) => ({
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: ['Developer', 'Designer', 'Manager', 'Tester'][i % 4],
      status: i % 3 === 0 ? 'Inactive' : 'Active',
    })),
    size: 'normal',
    fixedHeader: true,
    scrollConfig: {y: 400},
  },
  render: (args) => html`
    <div style="padding: 1rem;">
      <h3 style="margin-bottom: 1rem;">Fixed Header with Vertical Scroll (400px height)</h3>
      <p style="margin-bottom: 1rem; color: #666;">
        Try scrolling - the header stays fixed at the top!
      </p>
      <nr-table
        .headers=${args.headers}
        .rows=${args.rows}
        size=${args.size}
        ?fixedHeader=${args.fixedHeader}
        .scrollConfig=${args.scrollConfig}>
      </nr-table>
    </div>
  `,
};

// ============================================
// Column Filters Feature Stories
// ============================================

/**
 * Table with multiple column filters active simultaneously.
 * Demonstrates combining filters across different columns.
 */
export const ColumnFiltersMultiple: Story = {
  args: {
    headers: [
      {
        name: 'Name',
        key: 'name',
        filterable: true,
        filterConfig: {
          type: 'text',
          placeholder: 'Filter name...',
        },
      },
      {
        name: 'Department',
        key: 'department',
        filterable: true,
        filterConfig: {
          type: 'select',
          placeholder: 'Filter department...',
          options: [
            {label: 'All', value: ''},
            {label: 'Engineering', value: 'Engineering'},
            {label: 'Design', value: 'Design'},
            {label: 'Product', value: 'Product'},
            {label: 'Sales', value: 'Sales'},
          ],
        },
      },
      {
        name: 'Level',
        key: 'level',
        filterable: true,
        filterConfig: {
          type: 'select',
          placeholder: 'Filter level...',
          options: [
            {label: 'All', value: ''},
            {label: 'Junior', value: 'Junior'},
            {label: 'Mid', value: 'Mid'},
            {label: 'Senior', value: 'Senior'},
          ],
        },
      },
      {
        name: 'Status',
        key: 'status',
        filterable: true,
        filterConfig: {
          type: 'select',
          placeholder: 'Filter status...',
          options: [
            {label: 'All', value: ''},
            {label: 'Active', value: 'Active'},
            {label: 'On Leave', value: 'On Leave'},
            {label: 'Inactive', value: 'Inactive'},
          ],
        },
      },
    ],
    rows: Array.from({length: 40}, (_, i) => ({
      name: `Employee ${String(i + 1).padStart(2, '0')}`,
      department: ['Engineering', 'Design', 'Product', 'Sales'][i % 4],
      level: ['Junior', 'Mid', 'Senior'][i % 3],
      status: ['Active', 'On Leave', 'Inactive'][i % 3],
    })),
    size: 'normal',
  },
  render: (args) => html`
    <div style="padding: 1rem;">
      <h3 style="margin-bottom: 1rem;">Column Filters - Multiple Active Filters</h3>
      <p style="margin-bottom: 1rem; color: #666;">
        Apply filters to multiple columns simultaneously. All filters work together (AND logic).
        Active filters show a blue indicator dot.
      </p>
      <nr-table
        .headers=${args.headers}
        .rows=${args.rows}
        size=${args.size}>
      </nr-table>
    </div>
  `,
};

/**
 * Table with mixed filter types (text, select, number).
 * Demonstrates the flexibility of the column filter system.
 */
export const ColumnFiltersMixedTypes: Story = {
  args: {
    headers: [
      {
        name: 'Order ID',
        key: 'orderId',
        filterable: true,
        filterConfig: {
          type: 'number',
          placeholder: 'Filter by order ID...',
        },
      },
      {
        name: 'Customer',
        key: 'customer',
        filterable: true,
        filterConfig: {
          type: 'text',
          placeholder: 'Search customer...',
        },
      },
      {
        name: 'Product',
        key: 'product',
        filterable: true,
        filterConfig: {
          type: 'text',
          placeholder: 'Search product...',
        },
      },
      {
        name: 'Priority',
        key: 'priority',
        filterable: true,
        filterConfig: {
          type: 'select',
          placeholder: 'Select priority...',
          options: [
            {label: 'All', value: ''},
            {label: 'High', value: 'High'},
            {label: 'Medium', value: 'Medium'},
            {label: 'Low', value: 'Low'},
          ],
        },
      },
    ],
    rows: Array.from({length: 35}, (_, i) => ({
      orderId: 1000 + i,
      customer: `Customer ${String.fromCharCode(65 + (i % 26))}`,
      product: `Product ${['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'][i % 5]}`,
      priority: ['High', 'Medium', 'Low'][i % 3],
    })),
    size: 'normal',
  },
  render: (args) => html`
    <div style="padding: 1rem;">
      <h3 style="margin-bottom: 1rem;">Column Filters - Mixed Types</h3>
      <p style="margin-bottom: 1rem; color: #666;">
        Different filter types for different data: number input for Order ID, 
        text search for Customer/Product, and dropdown for Priority.
      </p>
      <nr-table
        .headers=${args.headers}
        .rows=${args.rows}
        size=${args.size}>
      </nr-table>
    </div>
  `,
};

// ============================================
// Fixed Columns Feature Stories
// ============================================

// Story: Fixed Columns Right
export const FixedColumnsRight: Story = {
  args: {
    headers: [
      {name: 'Name', key: 'name', width: 180},
      {name: 'Department', key: 'department', width: 150},
      {name: 'Email', key: 'email', width: 250},
      {name: 'Position', key: 'position', width: 150},
      {name: 'Location', key: 'location', width: 150},
      {name: 'Join Date', key: 'joinDate', width: 150},
      {name: 'Salary', key: 'salary', width: 120},
      {name: 'Status', key: 'status', width: 120, fixed: 'right'},
      {name: 'Actions', key: 'actions', width: 120, fixed: 'right'},
    ],
    rows: Array.from({length: 25}, (_, i) => ({
      id: i + 1,
      name: `Employee ${i + 1}`,
      department: ['Engineering', 'Design', 'Product', 'Sales'][i % 4],
      email: `employee${i + 1}@company.com`,
      position: ['Senior', 'Mid', 'Junior', 'Lead'][i % 4],
      location: ['New York', 'London', 'Tokyo', 'Berlin'][i % 4],
      joinDate: `202${i % 5}-0${(i % 9) + 1}-15`,
      salary: `$${(50 + i * 5)}K`,
      status: i % 5 === 0 ? 'On Leave' : 'Active',
      actions: '⋮',
    })),
    size: 'normal',
    scrollConfig: {x: 1200},
  },
  render: (args) => html`
    <div style="padding: 1rem;">
      <h3 style="margin-bottom: 1rem;">Fixed Columns on the Right</h3>
      <p style="margin-bottom: 1rem; color: #666;">
        Status and Actions columns are fixed on the right side. 
        Scroll horizontally to see that these columns remain visible while viewing other data.
      </p>
      <nr-table
        .headers=${args.headers}
        .rows=${args.rows}
        size=${args.size}
        .scrollConfig=${args.scrollConfig}>
      </nr-table>
    </div>
  `,
};

// Story: Fixed Columns Both Sides
export const FixedColumnsBothSides: Story = {
  args: {
    headers: [
      {name: 'Name', key: 'name', width: 180, fixed: 'left'},
      {name: 'Department', key: 'department', width: 150},
      {name: 'Email', key: 'email', width: 250},
      {name: 'Position', key: 'position', width: 150},
      {name: 'Location', key: 'location', width: 150},
      {name: 'Join Date', key: 'joinDate', width: 150},
      {name: 'Salary', key: 'salary', width: 120},
      {name: 'Status', key: 'status', width: 120, fixed: 'right'},
      {name: 'Actions', key: 'actions', width: 120, fixed: 'right'},
    ],
    rows: Array.from({length: 25}, (_, i) => ({
      id: i + 1,
      name: `Employee ${i + 1}`,
      department: ['Engineering', 'Design', 'Product', 'Sales'][i % 4],
      email: `employee${i + 1}@company.com`,
      position: ['Senior', 'Mid', 'Junior', 'Lead'][i % 4],
      location: ['New York', 'London', 'Tokyo', 'Berlin'][i % 4],
      joinDate: `202${i % 5}-0${(i % 9) + 1}-15`,
      salary: `$${(50 + i * 5)}K`,
      status: i % 5 === 0 ? 'On Leave' : 'Active',
      actions: '⋮',
    })),
    size: 'normal',
    scrollConfig: {x: 1200},
  },
  render: (args) => html`
    <div style="padding: 1rem;">
      <h3 style="margin-bottom: 1rem;">Fixed Columns on Both Sides</h3>
      <p style="margin-bottom: 1rem; color: #666;">
        Name is fixed on the left, Status and Actions are fixed on the right.
        Scroll horizontally to see both fixed columns remain visible while the middle columns scroll.
      </p>
      <nr-table
        .headers=${args.headers}
        .rows=${args.rows}
        size=${args.size}
        .scrollConfig=${args.scrollConfig}>
      </nr-table>
    </div>
  `,
};

// Story: Fixed Columns Both Sides + Fixed Header
export const FixedColumnsBothSidesWithHeader: Story = {
  args: {
    headers: [
      {name: 'SKU', key: 'sku', width: 150, fixed: 'left'},
      {name: 'Product Name', key: 'name', width: 250},
      {name: 'Category', key: 'category', width: 150},
      {name: 'Description', key: 'description', width: 300},
      {name: 'Supplier', key: 'supplier', width: 180},
      {name: 'Price', key: 'price', width: 100},
      {name: 'Stock', key: 'stock', width: 100},
      {name: 'Status', key: 'status', width: 120, fixed: 'right'},
    ],
    rows: Array.from({length: 40}, (_, i) => ({
      id: i + 1,
      sku: `SKU-${1000 + i}`,
      name: `Product ${i + 1}`,
      category: ['Electronics', 'Furniture', 'Clothing', 'Food'][i % 4],
      description: `High quality ${['electronics', 'furniture', 'clothing', 'food'][i % 4]} product with excellent features and durability.`,
      supplier: `Supplier ${(i % 10) + 1}`,
      price: `$${(10 + i * 2)}`,
      stock: (100 + i * 3).toString(),
      status: i % 7 === 0 ? 'Out of Stock' : 'In Stock',
    })),
    size: 'normal',
    fixedHeader: true,
    scrollConfig: {x: 1200, y: 400},
  },
  render: (args) => html`
    <div style="padding: 1rem;">
      <h3 style="margin-bottom: 1rem;">Fixed Columns Both Sides + Fixed Header</h3>
      <p style="margin-bottom: 1rem; color: #666;">
        SKU fixed on left, Status fixed on right, and header is fixed on top.
        Scroll both horizontally and vertically to see all three features working together!
      </p>
      <nr-table
        .headers=${args.headers}
        .rows=${args.rows}
        size=${args.size}
        ?fixedHeader=${args.fixedHeader}
        .scrollConfig=${args.scrollConfig}>
      </nr-table>
    </div>
  `,
};

// ============================================
// Loading State Feature Stories
// ============================================

/**
 * Table with skeleton loading state.
 * Shows animated skeleton rows while data is loading.
 */
export const LoadingSkeleton: Story = {
  args: {
    headers: sampleHeaders,
    rows: [],
    size: 'normal',
    loading: true,
  },
  render: (args) => html`
    <div style="padding: 1rem;">
      <h3 style="margin-bottom: 1rem;">Loading State - Skeleton Rows</h3>
      <p style="margin-bottom: 1rem; color: #666;">
        Skeleton loading provides visual feedback while data is being fetched.
        This creates a better user experience than showing an empty table.
      </p>
      <nr-table
        .headers=${args.headers}
        .rows=${args.rows}
        size=${args.size}
        ?loading=${args.loading}>
      </nr-table>
    </div>
  `,
};

/**
 * Table simulating data load transition.
 * Demonstrates transitioning from loading to loaded state.
 */
export const LoadingTransition: Story = {
  args: {
    headers: [
      {name: 'Order ID', key: 'orderId'},
      {name: 'Customer', key: 'customer'},
      {name: 'Product', key: 'product'},
      {name: 'Amount', key: 'amount'},
      {name: 'Status', key: 'status'},
    ],
    rows: [],
    size: 'normal',
    loading: true,
  },
  render: (args) => {
    // Simulate data loading after 3 seconds
    setTimeout(() => {
      const table = document.querySelector('nr-table[data-story="loading-transition"]') as any;
      if (table) {
        // Properly set loading to false using property setter
        table.loading = false;
        table.rows = Array.from({length: 10}, (_, i) => ({
          orderId: `#${1000 + i}`,
          customer: `Customer ${i + 1}`,
          product: ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Headphones'][i % 5],
          amount: `$${(Math.random() * 500 + 50).toFixed(2)}`,
          status: i % 3 === 0 ? 'Pending' : 'Completed',
        }));
      }
    }, 3000);

    return html`
      <div style="padding: 1rem;">
        <h3 style="margin-bottom: 1rem;">Loading Transition</h3>
        <p style="margin-bottom: 1rem; color: #666;">
          This story simulates loading data. Wait 3 seconds to see the transition
          from loading skeleton to actual data.
        </p>
        <nr-table
          data-story="loading-transition"
          .headers=${args.headers}
          .rows=${args.rows}
          size=${args.size}
          ?loading=${args.loading}>
        </nr-table>
      </div>
    `;
  },
};

/**
 * Table with loading state and selection mode.
 * Shows how loading works with interactive features.
 */
export const LoadingWithFeatures: Story = {
  args: {
    headers: [
      {name: 'Name', key: 'name'},
      {name: 'Email', key: 'email'},
      {name: 'Department', key: 'department'},
      {name: 'Status', key: 'status'},
    ],
    rows: [],
    size: 'normal',
    loading: true,
    selectionMode: 'multiple',
  },
  render: (args) => html`
    <div style="padding: 1rem;">
      <h3 style="margin-bottom: 1rem;">Loading with Multiple Selection</h3>
      <p style="margin-bottom: 1rem; color: #666;">
        Loading state works seamlessly with other table features like row selection.
        The selection column is included in the skeleton animation.
      </p>
      <nr-table
        .headers=${args.headers}
        .rows=${args.rows}
        size=${args.size}
        ?loading=${args.loading}
        selectionMode=${args.selectionMode}>
      </nr-table>
    </div>
  `,
};

/**
 * Empty State - Default
 * Shows the default empty state with the default message and icon when no data is available.
 */
export const EmptyStateDefault: Story = {
  args: {
    headers: [
      {name: 'Name', key: 'name'},
      {name: 'Email', key: 'email'},
      {name: 'Department', key: 'department'},
      {name: 'Status', key: 'status'},
    ],
    rows: [],
    size: 'normal',
  },
  render: (args) => html`
    <div style="padding: 1rem;">
      <h3 style="margin-bottom: 1rem;">Empty State - Default</h3>
      <p style="margin-bottom: 1rem; color: #666;">
        When the table has no data, an empty state is displayed with a default message.
        This provides clear feedback to users.
      </p>
      <nr-table
        .headers=${args.headers}
        .rows=${args.rows}
        size=${args.size}>
      </nr-table>
    </div>
  `,
};

/**
 * Empty State - Custom Message
 * Shows a custom empty state message and icon.
 */
export const EmptyStateCustom: Story = {
  args: {
    headers: [
      {name: 'Product', key: 'product'},
      {name: 'Price', key: 'price'},
      {name: 'Stock', key: 'stock'},
      {name: 'Category', key: 'category'},
    ],
    rows: [],
    size: 'normal',
    emptyText: 'No products found in inventory',
    emptyIcon: 'box-open',
  },
  render: (args) => html`
    <div style="padding: 1rem;">
      <h3 style="margin-bottom: 1rem;">Empty State - Custom Message</h3>
      <p style="margin-bottom: 1rem; color: #666;">
        Customize the empty state with your own message and icon to provide
        context-specific feedback.
      </p>
      <nr-table
        .headers=${args.headers}
        .rows=${args.rows}
        size=${args.size}
        emptyText=${args.emptyText}
        emptyIcon=${args.emptyIcon}>
      </nr-table>
    </div>
  `,
};

/**
 * Empty State - With Features
 * Shows empty state with other table features like selection mode and fixed header.
 */
export const EmptyStateWithFeatures: Story = {
  args: {
    headers: [
      {name: 'Task', key: 'task'},
      {name: 'Assignee', key: 'assignee'},
      {name: 'Due Date', key: 'dueDate'},
      {name: 'Priority', key: 'priority'},
    ],
    rows: [],
    size: 'normal',
    emptyText: 'No tasks assigned yet',
    emptyIcon: 'clipboard-list',
    selectionMode: 'multiple',
  },
  render: (args) => html`
    <div style="padding: 1rem;">
      <h3 style="margin-bottom: 1rem;">Empty State - With Features</h3>
      <p style="margin-bottom: 1rem; color: #666;">
        Empty state works seamlessly with other table features like selection mode.
        The empty state spans across all columns including the selection column.
      </p>
      <nr-table
        .headers=${args.headers}
        .rows=${args.rows}
        size=${args.size}
        emptyText=${args.emptyText}
        emptyIcon=${args.emptyIcon}
        selectionMode=${args.selectionMode}>
      </nr-table>
    </div>
  `,
};

/**
 * Row Expansion - Basic
 * Demonstrates basic row expansion with simple content.
 * Click the expand icon to reveal additional row details with smooth animation.
 */
export const RowExpansionBasic: Story = {
  args: {
    headers: [
      {name: 'Product', key: 'product'},
      {name: 'Category', key: 'category'},
      {name: 'Price', key: 'price'},
      {name: 'Stock', key: 'stock'},
    ],
    rows: [
      {product: 'Laptop Pro', category: 'Electronics', price: '$1,299', stock: 45, details: 'High-performance laptop with 16GB RAM, 512GB SSD, and dedicated graphics card. Perfect for developers and designers.'},
      {product: 'Wireless Mouse', category: 'Accessories', price: '$29', stock: 120, details: 'Ergonomic wireless mouse with precision tracking, 3-button design, and long battery life.'},
      {product: 'USB-C Hub', category: 'Accessories', price: '$49', stock: 78, details: 'Multi-port USB-C hub with HDMI, USB 3.0, SD card reader, and power delivery support.'},
      {product: 'Monitor 4K', category: 'Electronics', price: '$599', stock: 32, details: '27-inch 4K UHD monitor with HDR support, 99% sRGB color accuracy, and adjustable stand.'},
      {product: 'Keyboard Mechanical', category: 'Accessories', price: '$149', stock: 67, details: 'Premium mechanical keyboard with RGB backlighting, hot-swappable switches, and aluminum frame.'},
    ],
    expandable: 'details',
    size: 'normal',
  },
  render: (args) => html`
    <div style="padding: 1rem;">
      <h3 style="margin-bottom: 1rem;">Row Expansion - Basic</h3>
      <p style="margin-bottom: 1rem; color: #666;">
        Click the expand icon (▼) to reveal additional details for each row.
        The expansion animates smoothly with a slide-down effect.
        Use keyboard (Enter/Space) or click to toggle expansion.
      </p>
      <nr-table
        .headers=${args.headers}
        .rows=${args.rows}
        expandable=${args.expandable}
        size=${args.size}>
      </nr-table>
    </div>
  `,
};

/**
 * Row Expansion - Custom Content
 * Shows row expansion with rich HTML content using a custom renderer.
 * Supports complex layouts, nested components, and formatted content.
 */
export const RowExpansionCustomContent: Story = {
  args: {
    headers: [
      {name: 'Employee', key: 'name'},
      {name: 'Department', key: 'department'},
      {name: 'Position', key: 'position'},
      {name: 'Status', key: 'status'},
    ],
    rows: [
      {
        name: 'Sarah Johnson',
        department: 'Engineering',
        position: 'Senior Developer',
        status: 'Active',
        email: 'sarah.johnson@company.com',
        phone: '+1 (555) 123-4567',
        skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
        joined: '2021-03-15',
      },
      {
        name: 'Michael Chen',
        department: 'Design',
        position: 'UX Designer',
        status: 'Active',
        email: 'michael.chen@company.com',
        phone: '+1 (555) 234-5678',
        skills: ['Figma', 'Sketch', 'Prototyping', 'User Research'],
        joined: '2022-07-01',
      },
      {
        name: 'Emily Rodriguez',
        department: 'Product',
        position: 'Product Manager',
        status: 'On Leave',
        email: 'emily.rodriguez@company.com',
        phone: '+1 (555) 345-6789',
        skills: ['Roadmapping', 'Agile', 'Analytics', 'Stakeholder Management'],
        joined: '2020-11-20',
      },
    ],
    size: 'normal',
  },
  render: (args) => html`
    <div style="padding: 1rem;">
      <h3 style="margin-bottom: 1rem;">Row Expansion - Custom Content</h3>
      <p style="margin-bottom: 1rem; color: #666;">
        This example uses a custom renderer to display rich HTML content with formatted layout.
        The expansion panel shows detailed employee information with proper styling.
      </p>
      <nr-table
        .headers=${args.headers}
        .rows=${args.rows}
        .expansionRenderer=${(row: any) => html`
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; padding: 8px 0;">
            <div>
              <strong style="color: #262626;">Contact Information</strong>
              <div style="margin-top: 8px; color: #595959;">
                <div style="margin-bottom: 4px;">
                  <span style="color: #8c8c8c;">Email:</span> ${row.email}
                </div>
                <div>
                  <span style="color: #8c8c8c;">Phone:</span> ${row.phone}
                </div>
              </div>
            </div>
            <div>
              <strong style="color: #262626;">Employment Details</strong>
              <div style="margin-top: 8px; color: #595959;">
                <div style="margin-bottom: 4px;">
                  <span style="color: #8c8c8c;">Joined:</span> ${row.joined}
                </div>
                <div>
                  <span style="color: #8c8c8c;">Status:</span> 
                  <span style="color: ${row.status === 'Active' ? '#52c41a' : '#faad14'};">
                    ${row.status}
                  </span>
                </div>
              </div>
            </div>
            <div style="grid-column: 1 / -1;">
              <strong style="color: #262626;">Skills</strong>
              <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
                ${row.skills.map((skill: string) => html`
                  <span style="
                    padding: 4px 12px;
                    background: #f0f0f0;
                    border-radius: 4px;
                    font-size: 12px;
                    color: #595959;
                  ">${skill}</span>
                `)}
              </div>
            </div>
          </div>
        `}
        size=${args.size}>
      </nr-table>
    </div>
  `,
};

/**
 * Row Expansion - With Other Features
 * Demonstrates row expansion combined with other table features.
 * Shows expansion working alongside pagination, sorting, and fixed headers.
 */
export const RowExpansionWithFeatures: Story = {
  args: {
    headers: [
      {name: 'Order ID', key: 'orderId', sortable: true},
      {name: 'Customer', key: 'customer', sortable: true},
      {name: 'Amount', key: 'amount', sortable: true},
      {name: 'Date', key: 'date', sortable: true},
      {name: 'Status', key: 'status'},
    ],
    rows: [
      {orderId: '#12345', customer: 'Alice Williams', amount: '$450.00', date: '2024-10-01', status: 'Delivered', items: 'MacBook Pro (x1), USB-C Cable (x2)', shipping: 'Express - Delivered on Oct 3, 2024'},
      {orderId: '#12346', customer: 'Bob Smith', amount: '$89.99', date: '2024-10-02', status: 'Shipped', items: 'Wireless Mouse (x1), Mouse Pad (x1)', shipping: 'Standard - Expected Oct 5, 2024'},
      {orderId: '#12347', customer: 'Carol Davis', amount: '$1,299.00', date: '2024-10-02', status: 'Processing', items: 'Monitor 4K (x2), HDMI Cable (x2)', shipping: 'Express - Processing'},
      {orderId: '#12348', customer: 'David Brown', amount: '$149.00', date: '2024-10-03', status: 'Delivered', items: 'Keyboard Mechanical (x1)', shipping: 'Standard - Delivered on Oct 5, 2024'},
      {orderId: '#12349', customer: 'Eva Martinez', amount: '$599.00', date: '2024-10-03', status: 'Shipped', items: 'Laptop Stand (x1), Cable Organizer (x2)', shipping: 'Express - Expected Oct 4, 2024'},
      {orderId: '#12350', customer: 'Frank Wilson', amount: '$249.50', date: '2024-10-04', status: 'Processing', items: 'Webcam HD (x1), Microphone (x1)', shipping: 'Standard - Processing'},
      {orderId: '#12351', customer: 'Grace Lee', amount: '$89.00', date: '2024-10-04', status: 'Cancelled', items: 'USB Hub (x1)', shipping: 'Cancelled by customer'},
      {orderId: '#12352', customer: 'Henry Taylor', amount: '$799.00', date: '2024-10-05', status: 'Delivered', items: 'Graphics Tablet (x1), Stylus (x2)', shipping: 'Express - Delivered on Oct 6, 2024'},
    ],
    size: 'normal',
    fixedHeader: true,
    scrollConfig: {y: 400},
  },
  render: (args) => html`
    <div style="padding: 1rem;">
      <h3 style="margin-bottom: 1rem;">Row Expansion - With Features</h3>
      <p style="margin-bottom: 1rem; color: #666;">
        Row expansion works seamlessly with fixed headers, scrolling, and sorting.
        Try sorting columns, scrolling, and expanding rows to see how they all work together.
      </p>
      <nr-table
        .headers=${args.headers}
        .rows=${args.rows}
        .expansionRenderer=${(row: any) => html`
          <div style="padding: 8px 0;">
            <div style="margin-bottom: 12px;">
              <strong style="color: #262626;">Order Items:</strong>
              <div style="margin-top: 4px; color: #595959;">${row.items}</div>
            </div>
            <div>
              <strong style="color: #262626;">Shipping Info:</strong>
              <div style="margin-top: 4px; color: #595959;">${row.shipping}</div>
            </div>
          </div>
        `}
        fixedHeader
        .scrollConfig=${args.scrollConfig}
        size=${args.size}>
      </nr-table>
    </div>
  `,
};
