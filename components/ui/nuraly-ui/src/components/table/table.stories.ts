import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './index.js';
import '../../shared/themes/carbon/index.css';
import '../../shared/themes/default/index.css';

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
 * Small size variant for compact displays.
 */
export const SmallSize: Story = {
  args: {
    headers: sampleHeaders,
    rows: sampleRows.slice(0, 5),
    size: 'small',
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
 * Large size variant for more spacious displays.
 */
export const LargeSize: Story = {
  args: {
    headers: sampleHeaders,
    rows: sampleRows.slice(0, 5),
    size: 'large',
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

/**
 * Table with Default theme light variant.
 */
export const DefaultLight: Story = {
  args: {
    headers: sampleHeaders,
    rows: sampleRows.slice(0, 5),
    size: 'normal',
  },
  render: (args) => html`
    <div data-theme="default-light" style="padding: 1rem;">
      <nr-table
        .headers=${args.headers}
        .rows=${args.rows}
        size=${args.size}>
      </nr-table>
    </div>
  `,
};

/**
 * Table with Default theme dark variant.
 */
export const DefaultDark: Story = {
  args: {
    headers: sampleHeaders,
    rows: sampleRows.slice(0, 5),
    size: 'normal',
  },
  render: (args) => html`
    <div data-theme="default-dark" style="padding: 1rem; background: #1a1b1e;">
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

/**
 * Table with fixed header and smaller scroll height.
 * Demonstrates compact fixed header for limited space.
 */
export const FixedHeaderCompact: Story = {
  args: {
    headers: sampleHeaders,
    rows: Array.from({length: 30}, (_, i) => ({
      name: `Employee ${i + 1}`,
      email: `emp${i + 1}@company.com`,
      role: ['Developer', 'Designer', 'Manager', 'Tester'][i % 4],
      status: i % 2 === 0 ? 'Active' : 'Inactive',
    })),
    size: 'small',
    fixedHeader: true,
    scrollConfig: {y: 250},
  },
  render: (args) => html`
    <div style="padding: 1rem;">
      <h3 style="margin-bottom: 1rem;">Compact Fixed Header (250px height, small size)</h3>
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

/**
 * Table with fixed header and selection mode.
 * Shows how fixed header works with row selection.
 */
export const FixedHeaderWithSelection: Story = {
  args: {
    headers: sampleHeaders,
    rows: Array.from({length: 40}, (_, i) => ({
      name: `Person ${i + 1}`,
      email: `person${i + 1}@domain.com`,
      role: ['Developer', 'Designer', 'Manager', 'Tester'][i % 4],
      status: i % 3 === 0 ? 'Inactive' : 'Active',
    })),
    size: 'normal',
    fixedHeader: true,
    scrollConfig: {y: 350},
    selectionMode: 'multiple',
  },
  render: (args) => html`
    <div style="padding: 1rem;">
      <h3 style="margin-bottom: 1rem;">Fixed Header with Multiple Selection</h3>
      <p style="margin-bottom: 1rem; color: #666;">
        Select rows and scroll - header with checkbox stays visible!
      </p>
      <nr-table
        .headers=${args.headers}
        .rows=${args.rows}
        size=${args.size}
        ?fixedHeader=${args.fixedHeader}
        .scrollConfig=${args.scrollConfig}
        selectionMode=${args.selectionMode}>
      </nr-table>
    </div>
  `,
};

/**
 * Table with fixed header and wider columns requiring horizontal scroll.
 * Demonstrates both vertical and horizontal scrolling.
 */
export const FixedHeaderWithHorizontalScroll: Story = {
  args: {
    headers: [
      {name: 'Name', key: 'name'},
      {name: 'Email Address', key: 'email'},
      {name: 'Role', key: 'role'},
      {name: 'Department', key: 'department'},
      {name: 'Location', key: 'location'},
      {name: 'Status', key: 'status'},
      {name: 'Start Date', key: 'startDate'},
      {name: 'Manager', key: 'manager'},
    ],
    rows: Array.from({length: 35}, (_, i) => ({
      name: `Employee Name ${i + 1}`,
      email: `employee${i + 1}@organization.com`,
      role: ['Senior Developer', 'UI/UX Designer', 'Product Manager', 'QA Engineer'][i % 4],
      department: ['Engineering', 'Design', 'Product', 'Quality'][i % 4],
      location: ['New York', 'London', 'Tokyo', 'Sydney'][i % 4],
      status: i % 3 === 0 ? 'On Leave' : 'Active',
      startDate: `2023-0${(i % 9) + 1}-15`,
      manager: `Manager ${Math.floor(i / 5) + 1}`,
    })),
    size: 'normal',
    fixedHeader: true,
    scrollConfig: {x: 800, y: 400},
  },
  render: (args) => html`
    <div style="padding: 1rem;">
      <h3 style="margin-bottom: 1rem;">Fixed Header with Horizontal & Vertical Scroll</h3>
      <p style="margin-bottom: 1rem; color: #666;">
        Scroll in both directions - header remains sticky!
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

/**
 * Large dataset with fixed header for performance demonstration.
 * Shows how fixed header handles many rows efficiently.
 */
export const FixedHeaderLargeDataset: Story = {
  args: {
    headers: sampleHeaders,
    rows: Array.from({length: 100}, (_, i) => ({
      name: `User ${String(i + 1).padStart(3, '0')}`,
      email: `user${String(i + 1).padStart(3, '0')}@example.com`,
      role: ['Developer', 'Designer', 'Manager', 'Tester', 'Analyst', 'Admin'][i % 6],
      status: i % 4 === 0 ? 'Inactive' : 'Active',
    })),
    size: 'normal',
    fixedHeader: true,
    scrollConfig: {y: 500},
  },
  render: (args) => html`
    <div style="padding: 1rem;">
      <h3 style="margin-bottom: 1rem;">Fixed Header with 100 Rows</h3>
      <p style="margin-bottom: 1rem; color: #666;">
        Scroll through 100 rows with smooth fixed header performance.
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

/**
 * Comparison: With and Without Fixed Header.
 * Side-by-side comparison to show the difference.
 */
export const FixedHeaderComparison: Story = {
  args: {
    headers: sampleHeaders,
    rows: Array.from({length: 30}, (_, i) => ({
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: ['Developer', 'Designer', 'Manager', 'Tester'][i % 4],
      status: i % 3 === 0 ? 'Inactive' : 'Active',
    })),
    size: 'normal',
  },
  render: (args) => html`
    <div style="padding: 1rem;">
      <h3 style="margin-bottom: 1rem;">Comparison: Fixed Header ON vs OFF</h3>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 1rem;">
        <div>
          <h4 style="margin-bottom: 0.5rem; color: #0f62fe;">❌ Without Fixed Header</h4>
          <p style="margin-bottom: 1rem; color: #666; font-size: 0.875rem;">
            Header scrolls away with content
          </p>
          <nr-table
            .headers=${args.headers}
            .rows=${args.rows}
            size=${args.size}
            .scrollConfig=${{y: 300}}>
          </nr-table>
        </div>
        
        <div>
          <h4 style="margin-bottom: 0.5rem; color: #198038;">✅ With Fixed Header</h4>
          <p style="margin-bottom: 1rem; color: #666; font-size: 0.875rem;">
            Header stays visible while scrolling
          </p>
          <nr-table
            .headers=${args.headers}
            .rows=${args.rows}
            size=${args.size}
            fixedHeader
            .scrollConfig=${{y: 300}}>
          </nr-table>
        </div>
      </div>
    </div>
  `,
};
