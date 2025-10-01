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
