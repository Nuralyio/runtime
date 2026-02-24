import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './index.js';

/**
 * ## Flex
 * 
 * A flexible box layout component for creating responsive flex layouts with ease. 
 * Provides intuitive props for controlling direction, alignment, wrapping, and spacing.
 * 
 * ### When to use
 * - Use Flex for creating flexible, responsive layouts
 * - Use for aligning and distributing space among items
 * - Use for creating simple one-dimensional layouts (row or column)
 * 
 * ### Features
 * - Simple and intuitive API for flexbox layouts
 * - Support for direction, wrapping, and alignment
 * - Flexible gap system with presets and custom values
 * - Support for both horizontal and vertical gaps
 * - Theme-aware with CSS custom properties
 */
const meta: Meta = {
  title: 'Layout/Flex',
  component: 'nr-flex',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A flexible box layout component for creating responsive flex layouts. Based on CSS Flexbox with intuitive props.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: { type: 'select' },
      options: ['row', 'row-reverse', 'column', 'column-reverse'],
      description: 'Flex direction',
      table: {
        category: 'Layout',
        defaultValue: { summary: 'row' },
      },
    },
    vertical: {
      control: { type: 'boolean' },
      description: 'Shorthand for flex-direction: column',
      table: {
        category: 'Layout',
        defaultValue: { summary: 'false' },
      },
    },
    wrap: {
      control: { type: 'select' },
      options: ['nowrap', 'wrap', 'wrap-reverse'],
      description: 'Flex wrap behavior',
      table: {
        category: 'Layout',
        defaultValue: { summary: 'nowrap' },
      },
    },
    justify: {
      control: { type: 'select' },
      options: ['', 'flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'],
      description: 'Justify content alignment',
      table: {
        category: 'Alignment',
      },
    },
    align: {
      control: { type: 'select' },
      options: ['', 'flex-start', 'flex-end', 'center', 'baseline', 'stretch'],
      description: 'Align items alignment',
      table: {
        category: 'Alignment',
      },
    },
    gap: {
      control: { type: 'text' },
      description: 'Gap between items (small, medium, large, number, or CSS value)',
      table: {
        category: 'Spacing',
        defaultValue: { summary: '0' },
      },
    },
    inline: {
      control: { type: 'boolean' },
      description: 'Use inline-flex display',
      table: {
        category: 'Display',
        defaultValue: { summary: 'false' },
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Shared demo styles
const demoStyles = html`
  <style>
    .demo-box {
      padding: 16px;
      text-align: center;
      background: rgba(0, 120, 212, 0.15);
      border: 2px solid rgba(0, 120, 212, 0.5);
      border-radius: 4px;
      font-weight: 500;
      min-width: 80px;
    }
    .demo-container {
      padding: 20px;
      background: var(--nuraly-color-background, #fff);
    }
    h4 {
      margin: 24px 0 12px 0;
      color: var(--nuraly-color-text, #000);
    }
    .demo-tall { height: 80px; display: flex; align-items: center; justify-content: center; }
    .demo-medium { height: 60px; display: flex; align-items: center; justify-content: center; }
    .demo-short { height: 40px; display: flex; align-items: center; justify-content: center; }
  </style>
`;

/**
 * Basic horizontal flex layout with default settings.
 */
export const BasicFlex: Story = {
  render: () => html`
    ${demoStyles}
    <div class="demo-container">
      <nr-flex gap="medium">
        <div class="demo-box">Item 1</div>
        <div class="demo-box">Item 2</div>
        <div class="demo-box">Item 3</div>
      </nr-flex>
    </div>
  `,
};

/**
 * Vertical flex layout using the vertical shorthand prop.
 */
export const VerticalLayout: Story = {
  render: () => html`
    ${demoStyles}
    <div class="demo-container">
      <nr-flex vertical gap="medium">
        <div class="demo-box">Item 1</div>
        <div class="demo-box">Item 2</div>
        <div class="demo-box">Item 3</div>
      </nr-flex>
    </div>
  `,
};

/**
 * Different gap sizes using preset values.
 */
export const GapSizes: Story = {
  render: () => html`
    ${demoStyles}
    <div class="demo-container">
      <h4>Small Gap</h4>
      <nr-flex gap="small">
        <div class="demo-box">Item 1</div>
        <div class="demo-box">Item 2</div>
        <div class="demo-box">Item 3</div>
      </nr-flex>
      
      <h4>Medium Gap</h4>
      <nr-flex gap="medium">
        <div class="demo-box">Item 1</div>
        <div class="demo-box">Item 2</div>
        <div class="demo-box">Item 3</div>
      </nr-flex>
      
      <h4>Large Gap</h4>
      <nr-flex gap="large">
        <div class="demo-box">Item 1</div>
        <div class="demo-box">Item 2</div>
        <div class="demo-box">Item 3</div>
      </nr-flex>
      
      <h4>Custom Gap (32px)</h4>
      <nr-flex gap="32">
        <div class="demo-box">Item 1</div>
        <div class="demo-box">Item 2</div>
        <div class="demo-box">Item 3</div>
      </nr-flex>
    </div>
  `,
};

/**
 * Justify content alignment options.
 */
export const JustifyContent: Story = {
  render: () => html`
    ${demoStyles}
    <div class="demo-container">
      <h4>Flex Start</h4>
      <nr-flex justify="flex-start" gap="medium">
        <div class="demo-box">Item 1</div>
        <div class="demo-box">Item 2</div>
        <div class="demo-box">Item 3</div>
      </nr-flex>
      
      <h4>Center</h4>
      <nr-flex justify="center" gap="medium">
        <div class="demo-box">Item 1</div>
        <div class="demo-box">Item 2</div>
        <div class="demo-box">Item 3</div>
      </nr-flex>
      
      <h4>Flex End</h4>
      <nr-flex justify="flex-end" gap="medium">
        <div class="demo-box">Item 1</div>
        <div class="demo-box">Item 2</div>
        <div class="demo-box">Item 3</div>
      </nr-flex>
      
      <h4>Space Between</h4>
      <nr-flex justify="space-between">
        <div class="demo-box">Item 1</div>
        <div class="demo-box">Item 2</div>
        <div class="demo-box">Item 3</div>
      </nr-flex>
      
      <h4>Space Around</h4>
      <nr-flex justify="space-around">
        <div class="demo-box">Item 1</div>
        <div class="demo-box">Item 2</div>
        <div class="demo-box">Item 3</div>
      </nr-flex>
      
      <h4>Space Evenly</h4>
      <nr-flex justify="space-evenly">
        <div class="demo-box">Item 1</div>
        <div class="demo-box">Item 2</div>
        <div class="demo-box">Item 3</div>
      </nr-flex>
    </div>
  `,
};

/**
 * Align items options for vertical alignment.
 */
export const AlignItems: Story = {
  render: () => html`
    ${demoStyles}
    <div class="demo-container">
      <h4>Flex Start</h4>
      <nr-flex align="flex-start" gap="medium" style="height: 120px; background: rgba(0,0,0,0.05);">
        <div class="demo-box demo-tall">Tall</div>
        <div class="demo-box demo-medium">Medium</div>
        <div class="demo-box demo-short">Short</div>
      </nr-flex>
      
      <h4>Center</h4>
      <nr-flex align="center" gap="medium" style="height: 120px; background: rgba(0,0,0,0.05);">
        <div class="demo-box demo-tall">Tall</div>
        <div class="demo-box demo-medium">Medium</div>
        <div class="demo-box demo-short">Short</div>
      </nr-flex>
      
      <h4>Flex End</h4>
      <nr-flex align="flex-end" gap="medium" style="height: 120px; background: rgba(0,0,0,0.05);">
        <div class="demo-box demo-tall">Tall</div>
        <div class="demo-box demo-medium">Medium</div>
        <div class="demo-box demo-short">Short</div>
      </nr-flex>
      
      <h4>Stretch</h4>
      <nr-flex align="stretch" gap="medium" style="height: 120px; background: rgba(0,0,0,0.05);">
        <div class="demo-box">Stretched</div>
        <div class="demo-box">Stretched</div>
        <div class="demo-box">Stretched</div>
      </nr-flex>
    </div>
  `,
};

/**
 * Wrapping behavior for flex items.
 */
export const FlexWrap: Story = {
  render: () => html`
    ${demoStyles}
    <div class="demo-container">
      <h4>No Wrap (default)</h4>
      <nr-flex gap="medium" style="width: 400px; overflow: hidden;">
        <div class="demo-box">Item 1</div>
        <div class="demo-box">Item 2</div>
        <div class="demo-box">Item 3</div>
        <div class="demo-box">Item 4</div>
        <div class="demo-box">Item 5</div>
      </nr-flex>
      
      <h4>Wrap</h4>
      <nr-flex wrap="wrap" gap="medium" style="width: 400px;">
        <div class="demo-box">Item 1</div>
        <div class="demo-box">Item 2</div>
        <div class="demo-box">Item 3</div>
        <div class="demo-box">Item 4</div>
        <div class="demo-box">Item 5</div>
        <div class="demo-box">Item 6</div>
        <div class="demo-box">Item 7</div>
        <div class="demo-box">Item 8</div>
      </nr-flex>
    </div>
  `,
};

/**
 * Centered layout - a common use case.
 */
export const CenteredLayout: Story = {
  render: () => html`
    ${demoStyles}
    <div class="demo-container">
      <nr-flex justify="center" align="center" style="height: 200px; background: rgba(0,0,0,0.05);">
        <div class="demo-box">Perfectly Centered</div>
      </nr-flex>
    </div>
  `,
};

/**
 * Different horizontal and vertical gaps using array syntax.
 */
export const DifferentGaps: Story = {
  render: () => html`
    ${demoStyles}
    <div class="demo-container">
      <p>Horizontal gap: 8px, Vertical gap: 24px</p>
      <nr-flex wrap="wrap" .gap=${[8, 24]} style="width: 400px;">
        <div class="demo-box">Item 1</div>
        <div class="demo-box">Item 2</div>
        <div class="demo-box">Item 3</div>
        <div class="demo-box">Item 4</div>
        <div class="demo-box">Item 5</div>
        <div class="demo-box">Item 6</div>
      </nr-flex>
    </div>
  `,
};

/**
 * Real-world example: Navbar layout.
 */
export const NavbarLayout: Story = {
  render: () => html`
    ${demoStyles}
    <style>
      .navbar {
        padding: 16px;
        background: rgba(0, 120, 212, 0.1);
        border-radius: 8px;
      }
      .nav-link {
        padding: 8px 16px;
        background: rgba(0, 120, 212, 0.2);
        border-radius: 4px;
        text-decoration: none;
        color: inherit;
        cursor: pointer;
      }
      .logo {
        font-weight: bold;
        font-size: 1.2em;
      }
      .btn {
        padding: 8px 16px;
        background: rgba(0, 120, 212, 0.8);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
    </style>
    <div class="demo-container">
      <nr-flex class="navbar" justify="space-between" align="center">
        <div class="logo">My App</div>
        <nr-flex gap="medium">
          <span class="nav-link">Home</span>
          <span class="nav-link">Products</span>
          <span class="nav-link">About</span>
          <span class="nav-link">Contact</span>
        </nr-flex>
        <button class="btn">Login</button>
      </nr-flex>
    </div>
  `,
};

/**
 * Real-world example: Card with actions.
 */
export const CardLayout: Story = {
  render: () => html`
    ${demoStyles}
    <style>
      .card {
        padding: 24px;
        background: white;
        border: 1px solid rgba(0,0,0,0.1);
        border-radius: 8px;
        max-width: 400px;
      }
      .card-title {
        margin: 0 0 8px 0;
        font-size: 1.5em;
        font-weight: bold;
      }
      .card-content {
        margin: 0 0 16px 0;
        color: #666;
      }
      .card-button {
        padding: 8px 16px;
        border: 1px solid rgba(0, 120, 212, 0.5);
        background: white;
        border-radius: 4px;
        cursor: pointer;
      }
      .card-button.primary {
        background: rgba(0, 120, 212, 0.8);
        color: white;
        border-color: transparent;
      }
    </style>
    <div class="demo-container">
      <nr-flex class="card" vertical gap="medium">
        <h3 class="card-title">Card Title</h3>
        <p class="card-content">
          This is the card content. It can contain any information you want to display.
        </p>
        <nr-flex justify="flex-end" gap="small">
          <button class="card-button">Cancel</button>
          <button class="card-button primary">Confirm</button>
        </nr-flex>
      </nr-flex>
    </div>
  `,
};

/**
 * Direction variants including reverse.
 */
export const DirectionVariants: Story = {
  render: () => html`
    ${demoStyles}
    <div class="demo-container">
      <h4>Row (default)</h4>
      <nr-flex direction="row" gap="medium">
        <div class="demo-box">1</div>
        <div class="demo-box">2</div>
        <div class="demo-box">3</div>
      </nr-flex>
      
      <h4>Row Reverse</h4>
      <nr-flex direction="row-reverse" gap="medium">
        <div class="demo-box">1</div>
        <div class="demo-box">2</div>
        <div class="demo-box">3</div>
      </nr-flex>
      
      <h4>Column</h4>
      <nr-flex direction="column" gap="medium">
        <div class="demo-box">1</div>
        <div class="demo-box">2</div>
        <div class="demo-box">3</div>
      </nr-flex>
      
      <h4>Column Reverse</h4>
      <nr-flex direction="column-reverse" gap="medium">
        <div class="demo-box">1</div>
        <div class="demo-box">2</div>
        <div class="demo-box">3</div>
      </nr-flex>
    </div>
  `,
};
