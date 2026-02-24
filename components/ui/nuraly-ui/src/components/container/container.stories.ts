import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './container.component.js';
import type { NrContainerElement } from './container.component.js';

const meta: Meta<NrContainerElement> = {
  title: 'Layout/Container',
  component: 'nr-container',
  tags: ['autodocs'],
  argTypes: {
    layout: {
      control: 'select',
      options: ['fluid', 'boxed', 'fixed'],
      description: 'Layout type: fluid (full width), boxed (centered), or fixed',
    },
    direction: {
      control: 'select',
      options: ['row', 'column'],
      description: 'Flex direction',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'Size preset for boxed/fixed layouts',
    },
    padding: {
      control: 'select',
      options: ['', 'none', 'sm', 'md', 'lg'],
      description: 'Padding preset',
    },
    justify: {
      control: 'select',
      options: ['', 'flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'],
      description: 'Justify content alignment',
    },
    align: {
      control: 'select',
      options: ['', 'flex-start', 'flex-end', 'center', 'baseline', 'stretch'],
      description: 'Align items alignment',
    },
    gap: {
      control: 'text',
      description: 'Gap between items (number, preset: small/medium/large, or CSS value)',
    },
    wrap: {
      control: 'boolean',
      description: 'Enable flex wrap',
    },
    width: {
      control: 'text',
      description: 'Custom width (overrides size preset)',
    },
    height: {
      control: 'text',
      description: 'Custom height',
    },
    minHeight: {
      control: 'text',
      description: 'Custom min-height',
    },
  },
};

export default meta;
type Story = StoryObj<NrContainerElement>;

// Helper to create sample content boxes
const sampleBox = (text: string, color: string = '#e0e0e0') => html`
  <div style="padding: 16px; background: ${color}; border-radius: 4px; text-align: center;">
    ${text}
  </div>
`;

/**
 * Basic fluid container that takes full width
 */
export const Fluid: Story = {
  args: {
    layout: 'fluid',
    direction: 'column',
    gap: 16,
  },
  render: (args) => html`
    <nr-container
      layout=${args.layout}
      direction=${args.direction}
      .gap=${args.gap}
    >
      ${sampleBox('Full width content')}
      ${sampleBox('Another item')}
    </nr-container>
  `,
};

/**
 * Boxed container centered with max-width
 */
export const Boxed: Story = {
  args: {
    layout: 'boxed',
    size: 'lg',
    direction: 'column',
    gap: 16,
    padding: 'md',
  },
  render: (args) => html`
    <div style="background: #f5f5f5; padding: 20px;">
      <nr-container
        layout=${args.layout}
        size=${args.size}
        direction=${args.direction}
        padding=${args.padding}
        .gap=${args.gap}
        style="background: white; border: 1px solid #ddd;"
      >
        ${sampleBox('Boxed content (max-width: 1024px)')}
        ${sampleBox('Centered on the page')}
        ${sampleBox('With padding around content')}
      </nr-container>
    </div>
  `,
};

/**
 * Different size presets for boxed layout
 */
export const BoxedSizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px; background: #f5f5f5; padding: 20px;">
      <nr-container layout="boxed" size="sm" padding="md" style="background: white; border: 1px solid #ddd;">
        ${sampleBox('Small (640px)', '#ffcdd2')}
      </nr-container>
      <nr-container layout="boxed" size="md" padding="md" style="background: white; border: 1px solid #ddd;">
        ${sampleBox('Medium (768px)', '#c8e6c9')}
      </nr-container>
      <nr-container layout="boxed" size="lg" padding="md" style="background: white; border: 1px solid #ddd;">
        ${sampleBox('Large (1024px)', '#bbdefb')}
      </nr-container>
      <nr-container layout="boxed" size="xl" padding="md" style="background: white; border: 1px solid #ddd;">
        ${sampleBox('Extra Large (1280px)', '#e1bee7')}
      </nr-container>
    </div>
  `,
};

/**
 * Horizontal row layout
 */
export const RowLayout: Story = {
  args: {
    layout: 'fluid',
    direction: 'row',
    gap: 16,
    justify: 'space-between',
    align: 'center',
  },
  render: (args) => html`
    <nr-container
      layout=${args.layout}
      direction=${args.direction}
      justify=${args.justify}
      align=${args.align}
      .gap=${args.gap}
      style="background: #f5f5f5; padding: 16px;"
    >
      ${sampleBox('Item 1', '#ffcdd2')}
      ${sampleBox('Item 2', '#c8e6c9')}
      ${sampleBox('Item 3', '#bbdefb')}
    </nr-container>
  `,
};

/**
 * Centered content using justify and align
 */
export const CenteredContent: Story = {
  args: {
    layout: 'fluid',
    direction: 'column',
    justify: 'center',
    align: 'center',
    minHeight: '300px',
  },
  render: (args) => html`
    <nr-container
      layout=${args.layout}
      direction=${args.direction}
      justify=${args.justify}
      align=${args.align}
      min-height=${args.minHeight}
      style="background: #f5f5f5; border: 2px dashed #ccc;"
    >
      ${sampleBox('Centered vertically and horizontally', '#e1bee7')}
    </nr-container>
  `,
};

/**
 * Container with wrapping items
 */
export const WrapItems: Story = {
  args: {
    layout: 'fluid',
    direction: 'row',
    gap: 16,
    wrap: true,
  },
  render: (args) => html`
    <nr-container
      layout=${args.layout}
      direction=${args.direction}
      .gap=${args.gap}
      ?wrap=${args.wrap}
      style="background: #f5f5f5; padding: 16px;"
    >
      ${Array.from({ length: 8 }, (_, i) => sampleBox(`Item ${i + 1}`, i % 2 === 0 ? '#bbdefb' : '#c8e6c9'))}
    </nr-container>
  `,
};

/**
 * Custom width container
 */
export const CustomWidth: Story = {
  args: {
    layout: 'boxed',
    width: '500px',
    direction: 'column',
    gap: 16,
    padding: 'md',
  },
  render: (args) => html`
    <div style="background: #f5f5f5; padding: 20px;">
      <nr-container
        layout=${args.layout}
        width=${args.width}
        direction=${args.direction}
        padding=${args.padding}
        .gap=${args.gap}
        style="background: white; border: 1px solid #ddd;"
      >
        ${sampleBox('Custom 500px width')}
        ${sampleBox('Content area')}
      </nr-container>
    </div>
  `,
};

/**
 * Nested containers
 */
export const NestedContainers: Story = {
  render: () => html`
    <nr-container layout="boxed" size="xl" padding="lg" style="background: #f5f5f5;">
      <nr-container direction="row" gap="24" wrap>
        <nr-container direction="column" gap="16" style="flex: 1; background: white; padding: 16px; border-radius: 8px;">
          ${sampleBox('Sidebar item 1', '#ffcdd2')}
          ${sampleBox('Sidebar item 2', '#ffcdd2')}
        </nr-container>
        <nr-container direction="column" gap="16" style="flex: 2; background: white; padding: 16px; border-radius: 8px;">
          ${sampleBox('Main content area', '#c8e6c9')}
          <nr-container direction="row" gap="16">
            ${sampleBox('Card 1', '#bbdefb')}
            ${sampleBox('Card 2', '#bbdefb')}
            ${sampleBox('Card 3', '#bbdefb')}
          </nr-container>
        </nr-container>
      </nr-container>
    </nr-container>
  `,
};

/**
 * Page layout example with header, content, and footer
 */
export const PageLayout: Story = {
  render: () => html`
    <nr-container direction="column" min-height="400px" style="background: #f5f5f5;">
      <!-- Header -->
      <nr-container layout="boxed" size="xl" direction="row" justify="space-between" align="center" padding="md" style="background: #1976d2; color: white;">
        <div style="font-weight: bold;">Logo</div>
        <nr-container direction="row" gap="16">
          <div>Home</div>
          <div>About</div>
          <div>Contact</div>
        </nr-container>
      </nr-container>

      <!-- Main content -->
      <nr-container layout="boxed" size="xl" padding="lg" style="flex: 1;">
        <nr-container direction="column" gap="24">
          <h2 style="margin: 0;">Welcome to the Page</h2>
          <nr-container direction="row" gap="16" wrap>
            ${sampleBox('Feature 1', '#e3f2fd')}
            ${sampleBox('Feature 2', '#e8f5e9')}
            ${sampleBox('Feature 3', '#fff3e0')}
          </nr-container>
        </nr-container>
      </nr-container>

      <!-- Footer -->
      <nr-container layout="boxed" size="xl" direction="row" justify="center" padding="md" style="background: #424242; color: white;">
        <div>Footer content</div>
      </nr-container>
    </nr-container>
  `,
};
