import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './index.js';
import '../../shared/themes/carbon/index.css';
import '../../shared/themes/default/index.css';

/**
 * ## Grid
 * 
 * A flexible and responsive grid layout system based on a 24-column layout. The grid is composed 
 * of Row and Col components that work together to create responsive layouts.
 * 
 * ### When to use
 * - Use the grid system to create consistent, responsive page layouts
 * - Use Row and Col components to organize content in a structured manner
 * - Leverage responsive breakpoints to adapt layouts across different screen sizes
 * 
 * ### Features
 * - 24-column grid system for flexible layouts
 * - Responsive breakpoints (xs, sm, md, lg, xl, xxl)
 * - Flexible gutter spacing (horizontal and vertical)
 * - Alignment and justification controls
 * - Column ordering, offset, push, and pull
 * - Flex layout support
 * 
 * ### Breakpoints
 * - **xs**: <576px (Extra small - phones)
 * - **sm**: ≥576px (Small - tablets)
 * - **md**: ≥768px (Medium - small laptops)
 * - **lg**: ≥992px (Large - desktops)
 * - **xl**: ≥1200px (Extra large - large desktops)
 * - **xxl**: ≥1600px (Extra extra large - ultra-wide)
 */
const meta: Meta = {
  title: 'Layout/Grid',
  component: 'nr-row',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A responsive grid layout system with Row and Col components. Based on a 24-column layout with flexible spacing and responsive breakpoints.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// Shared demo styles
const demoStyles = html`
  <style>
    .demo-col {
      padding: 20px 16px;
      min-height: 50px;
      text-align: center;
      background: rgba(0, 120, 212, 0.15);
      border: 2px solid rgba(0, 120, 212, 0.5);
      border-radius: 4px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .demo-row {
      margin-bottom: 24px;
    }
    .demo-container {
      width: 100%;
      max-width: 1200px;
      padding: 20px;
    }
    h4 {
      margin: 24px 0 12px 0;
      color: var(--nuraly-color-text, #000);
    }
  </style>
`;

/**
 * Basic grid with equal columns. The default grid uses a 24-column system.
 */
export const BasicGrid: Story = {
  render: () => html`
    ${demoStyles}
    <div class="demo-container">
      <nr-row class="demo-row">
        <nr-col span="24"><div class="demo-col">col-24</div></nr-col>
      </nr-row>
      <nr-row class="demo-row">
        <nr-col span="12"><div class="demo-col">col-12</div></nr-col>
        <nr-col span="12"><div class="demo-col">col-12</div></nr-col>
      </nr-row>
      <nr-row class="demo-row">
        <nr-col span="8"><div class="demo-col">col-8</div></nr-col>
        <nr-col span="8"><div class="demo-col">col-8</div></nr-col>
        <nr-col span="8"><div class="demo-col">col-8</div></nr-col>
      </nr-row>
      <nr-row class="demo-row">
        <nr-col span="6"><div class="demo-col">col-6</div></nr-col>
        <nr-col span="6"><div class="demo-col">col-6</div></nr-col>
        <nr-col span="6"><div class="demo-col">col-6</div></nr-col>
        <nr-col span="6"><div class="demo-col">col-6</div></nr-col>
      </nr-row>
    </div>
  `,
};

/**
 * Grid with gutter spacing between columns. Gutter can be a single number for equal spacing.
 */
export const GridWithGutter: Story = {
  render: () => html`
    ${demoStyles}
    <div class="demo-container">
      <h4>Horizontal Gutter: 16px</h4>
      <nr-row gutter="16" class="demo-row">
        <nr-col span="6"><div class="demo-col">col-6</div></nr-col>
        <nr-col span="6"><div class="demo-col">col-6</div></nr-col>
        <nr-col span="6"><div class="demo-col">col-6</div></nr-col>
        <nr-col span="6"><div class="demo-col">col-6</div></nr-col>
      </nr-row>
      
      <h4>Horizontal: 16px, Vertical: 24px</h4>
      <nr-row .gutter=${[16, 24] as [number, number]}>
        <nr-col span="6"><div class="demo-col">col-6</div></nr-col>
        <nr-col span="6"><div class="demo-col">col-6</div></nr-col>
        <nr-col span="6"><div class="demo-col">col-6</div></nr-col>
        <nr-col span="6"><div class="demo-col">col-6</div></nr-col>
        <nr-col span="6"><div class="demo-col">col-6</div></nr-col>
        <nr-col span="6"><div class="demo-col">col-6</div></nr-col>
        <nr-col span="6"><div class="demo-col">col-6</div></nr-col>
        <nr-col span="6"><div class="demo-col">col-6</div></nr-col>
      </nr-row>
    </div>
  `,
};

/**
 * Column offset to create space before a column.
 */
export const ColumnOffset: Story = {
  render: () => html`
    ${demoStyles}
    <div class="demo-container">
      <nr-row class="demo-row">
        <nr-col span="8"><div class="demo-col">col-8</div></nr-col>
        <nr-col span="8" offset="8"><div class="demo-col">col-8 offset-8</div></nr-col>
      </nr-row>
      <nr-row class="demo-row">
        <nr-col span="6" offset="6"><div class="demo-col">col-6 offset-6</div></nr-col>
        <nr-col span="6" offset="6"><div class="demo-col">col-6 offset-6</div></nr-col>
      </nr-row>
      <nr-row class="demo-row">
        <nr-col span="12" offset="6"><div class="demo-col">col-12 offset-6</div></nr-col>
      </nr-row>
    </div>
  `,
};

/**
 * Responsive grid that adapts to different screen sizes using breakpoint properties.
 */
export const ResponsiveGrid: Story = {
  render: () => html`
    ${demoStyles}
    <div class="demo-container">
      <p>Resize the browser window to see the responsive behavior</p>
      <nr-row gutter="16" class="demo-row">
        <nr-col xs="24" sm="12" md="8" lg="6">
          <div class="demo-col">
            xs:24 sm:12 md:8 lg:6
          </div>
        </nr-col>
        <nr-col xs="24" sm="12" md="8" lg="6">
          <div class="demo-col">
            xs:24 sm:12 md:8 lg:6
          </div>
        </nr-col>
        <nr-col xs="24" sm="12" md="8" lg="6">
          <div class="demo-col">
            xs:24 sm:12 md:8 lg:6
          </div>
        </nr-col>
        <nr-col xs="24" sm="12" md="8" lg="6">
          <div class="demo-col">
            xs:24 sm:12 md:8 lg:6
          </div>
        </nr-col>
      </nr-row>
    </div>
  `,
};

/**
 * Responsive gutter that changes based on screen size.
 */
export const ResponsiveGutter: Story = {
  render: () => html`
    ${demoStyles}
    <div class="demo-container">
      <p>Gutter: xs:8, sm:16, md:24, lg:32</p>
      <nr-row .gutter=${{ xs: 8, sm: 16, md: 24, lg: 32 }}>
        <nr-col xs="12" sm="8" md="6" lg="4">
          <div class="demo-col">Col</div>
        </nr-col>
        <nr-col xs="12" sm="8" md="6" lg="4">
          <div class="demo-col">Col</div>
        </nr-col>
        <nr-col xs="12" sm="8" md="6" lg="4">
          <div class="demo-col">Col</div>
        </nr-col>
        <nr-col xs="12" sm="8" md="6" lg="4">
          <div class="demo-col">Col</div>
        </nr-col>
        <nr-col xs="12" sm="8" md="6" lg="4">
          <div class="demo-col">Col</div>
        </nr-col>
        <nr-col xs="12" sm="8" md="6" lg="4">
          <div class="demo-col">Col</div>
        </nr-col>
      </nr-row>
    </div>
  `,
};

/**
 * Alignment controls for vertical positioning of columns within a row.
 */
export const VerticalAlignment: Story = {
  render: () => html`
    ${demoStyles}
    <style>
      .tall-col { 
        height: 120px; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
      }
      .medium-col { 
        height: 80px; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
      }
      .short-col { 
        height: 50px; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
      }
    </style>
    <div class="demo-container">
      <h4>Align Top</h4>
      <nr-row align="top" gutter="16" class="demo-row">
        <nr-col span="8"><div class="demo-col tall-col">col-8 (tall)</div></nr-col>
        <nr-col span="8"><div class="demo-col medium-col">col-8 (medium)</div></nr-col>
        <nr-col span="8"><div class="demo-col short-col">col-8 (short)</div></nr-col>
      </nr-row>
      
      <h4>Align Middle</h4>
      <nr-row align="middle" gutter="16" class="demo-row">
        <nr-col span="8"><div class="demo-col tall-col">col-8 (tall)</div></nr-col>
        <nr-col span="8"><div class="demo-col medium-col">col-8 (medium)</div></nr-col>
        <nr-col span="8"><div class="demo-col short-col">col-8 (short)</div></nr-col>
      </nr-row>
      
      <h4>Align Bottom</h4>
      <nr-row align="bottom" gutter="16" class="demo-row">
        <nr-col span="8"><div class="demo-col tall-col">col-8 (tall)</div></nr-col>
        <nr-col span="8"><div class="demo-col medium-col">col-8 (medium)</div></nr-col>
        <nr-col span="8"><div class="demo-col short-col">col-8 (short)</div></nr-col>
      </nr-row>
    </div>
  `,
};

/**
 * Justification controls for horizontal positioning of columns within a row.
 */
export const HorizontalAlignment: Story = {
  render: () => html`
    ${demoStyles}
    <div class="demo-container">
      <h4>Justify Start</h4>
      <nr-row justify="start" class="demo-row">
        <nr-col span="4"><div class="demo-col">col-4</div></nr-col>
        <nr-col span="4"><div class="demo-col">col-4</div></nr-col>
        <nr-col span="4"><div class="demo-col">col-4</div></nr-col>
      </nr-row>
      
      <h4>Justify Center</h4>
      <nr-row justify="center" class="demo-row">
        <nr-col span="4"><div class="demo-col">col-4</div></nr-col>
        <nr-col span="4"><div class="demo-col">col-4</div></nr-col>
        <nr-col span="4"><div class="demo-col">col-4</div></nr-col>
      </nr-row>
      
      <h4>Justify End</h4>
      <nr-row justify="end" class="demo-row">
        <nr-col span="4"><div class="demo-col">col-4</div></nr-col>
        <nr-col span="4"><div class="demo-col">col-4</div></nr-col>
        <nr-col span="4"><div class="demo-col">col-4</div></nr-col>
      </nr-row>
      
      <h4>Justify Space Between</h4>
      <nr-row justify="space-between" class="demo-row">
        <nr-col span="4"><div class="demo-col">col-4</div></nr-col>
        <nr-col span="4"><div class="demo-col">col-4</div></nr-col>
        <nr-col span="4"><div class="demo-col">col-4</div></nr-col>
      </nr-row>
      
      <h4>Justify Space Around</h4>
      <nr-row justify="space-around" class="demo-row">
        <nr-col span="4"><div class="demo-col">col-4</div></nr-col>
        <nr-col span="4"><div class="demo-col">col-4</div></nr-col>
        <nr-col span="4"><div class="demo-col">col-4</div></nr-col>
      </nr-row>
      
      <h4>Justify Space Evenly</h4>
      <nr-row justify="space-evenly" class="demo-row">
        <nr-col span="4"><div class="demo-col">col-4</div></nr-col>
        <nr-col span="4"><div class="demo-col">col-4</div></nr-col>
        <nr-col span="4"><div class="demo-col">col-4</div></nr-col>
      </nr-row>
    </div>
  `,
};

/**
 * Change the visual order of columns using the order property.
 */
export const ColumnOrder: Story = {
  render: () => html`
    ${demoStyles}
    <div class="demo-container">
      <nr-row gutter="16">
        <nr-col span="6" order="4"><div class="demo-col">1 (order-4)</div></nr-col>
        <nr-col span="6" order="3"><div class="demo-col">2 (order-3)</div></nr-col>
        <nr-col span="6" order="2"><div class="demo-col">3 (order-2)</div></nr-col>
        <nr-col span="6" order="1"><div class="demo-col">4 (order-1)</div></nr-col>
      </nr-row>
    </div>
  `,
};

/**
 * Flex layout allows for flexible column sizing using flex properties.
 */
export const FlexLayout: Story = {
  render: () => html`
    ${demoStyles}
    <div class="demo-container">
      <h4>Flex Auto</h4>
      <nr-row gutter="16" class="demo-row">
        <nr-col flex="100px"><div class="demo-col">100px</div></nr-col>
        <nr-col flex="auto"><div class="demo-col">Auto (fills remaining)</div></nr-col>
      </nr-row>
      
      <h4>Flex with Numbers</h4>
      <nr-row gutter="16" class="demo-row">
        <nr-col flex="1"><div class="demo-col">Flex: 1</div></nr-col>
        <nr-col flex="2"><div class="demo-col">Flex: 2</div></nr-col>
        <nr-col flex="1"><div class="demo-col">Flex: 1</div></nr-col>
      </nr-row>
      
      <h4>Mixed Flex and Span</h4>
      <nr-row gutter="16" class="demo-row">
        <nr-col span="6"><div class="demo-col">Span: 6</div></nr-col>
        <nr-col flex="auto"><div class="demo-col">Flex: auto</div></nr-col>
        <nr-col span="6"><div class="demo-col">Span: 6</div></nr-col>
      </nr-row>
    </div>
  `,
};

/**
 * Complex responsive layout combining multiple features.
 */
export const ComplexResponsiveLayout: Story = {
  render: () => html`
    ${demoStyles}
    <div class="demo-container">
      <p>A real-world example combining responsive columns, gutter, and offsets</p>
      <nr-row .gutter=${{ xs: 8, sm: 16, md: 24 }}>
        <nr-col xs="24" md="12" lg="8">
          <div class="demo-col">Main Content 1</div>
        </nr-col>
        <nr-col xs="24" md="12" lg="8">
          <div class="demo-col">Main Content 2</div>
        </nr-col>
        <nr-col xs="24" md="24" lg="8">
          <div class="demo-col">Sidebar</div>
        </nr-col>
      </nr-row>
      
      <nr-row .gutter=${{ xs: 8, sm: 16, md: 24 }} style="margin-top: 24px;">
        <nr-col xs="24" sm="12" md="6">
          <div class="demo-col">Card 1</div>
        </nr-col>
        <nr-col xs="24" sm="12" md="6">
          <div class="demo-col">Card 2</div>
        </nr-col>
        <nr-col xs="24" sm="12" md="6">
          <div class="demo-col">Card 3</div>
        </nr-col>
        <nr-col xs="24" sm="12" md="6">
          <div class="demo-col">Card 4</div>
        </nr-col>
      </nr-row>
    </div>
  `,
};

/**
 * Advanced responsive configuration using object syntax for fine control.
 */
export const AdvancedResponsive: Story = {
  render: () => html`
    ${demoStyles}
    <div class="demo-container">
      <p>Using object syntax for advanced responsive configurations</p>
      <nr-row gutter="16">
        <nr-col 
          .xs=${{ span: 24 }}
          .sm=${{ span: 12 }}
          .md=${{ span: 8, offset: 2 }}
          .lg=${{ span: 6, offset: 3 }}
        >
          <div class="demo-col">Complex Responsive</div>
        </nr-col>
        <nr-col 
          .xs=${{ span: 24 }}
          .sm=${{ span: 12 }}
          .md=${{ span: 8 }}
          .lg=${{ span: 6 }}
        >
          <div class="demo-col">Complex Responsive</div>
        </nr-col>
      </nr-row>
    </div>
  `,
};
