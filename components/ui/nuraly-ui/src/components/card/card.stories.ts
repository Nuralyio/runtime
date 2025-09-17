import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './index.js';
import '../../shared/themes/carbon/index.css';
import '../../shared/themes/default/index.css';

/**
 * ## Card
 * 
 * Cards are flexible content containers that group related information together in a structured way.
 * They provide a clean, organized presentation layer for content and actions, making complex 
 * information easier to scan and digest.
 * 
 * ### When to use
 * - Display related content and actions in a grouped format
 * - Create scannable layouts with multiple pieces of content
 * - Present information hierarchically with clear separation between sections
 * - Group actionable content that belongs together contextually
 * 
 * ### When not to use
 * - Don't use cards for single pieces of content that don't need visual separation
 * - Avoid cards when the content doesn't benefit from being contained or grouped
 * - Don't nest cards deeply as it can create visual complexity
 * 
 * ### Anatomy
 * - **Header (optional)**: Provides context and title for the card content
 * - **Content**: Main body area that accepts any content through slots
 * - **Container**: Provides visual boundaries and consistent spacing
 * 
 * ### Accessibility
 * - Cards are keyboard navigable when they contain interactive elements
 * - Content within cards maintains proper heading hierarchy
 * - Screen readers can navigate card content naturally
 */
const meta: Meta = {
  title: 'Components/Card',
  component: 'nr-card',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Cards are flexible content containers that group related information together in a structured way. They provide a clean, organized presentation layer for content and actions, making complex information easier to scan and digest.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    // Core Properties
    header: {
      control: { type: 'text' },
      description: 'Header text displayed at the top of the card. When empty, header is not rendered.',
      table: {
        category: 'Content',
        defaultValue: { summary: '""' },
      },
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'default', 'large'],
      description: 'Size variant that affects padding and font sizes throughout the card',
      table: {
        category: 'Appearance',
        defaultValue: { summary: 'default' },
      },
    },
    
    // Slot Content
    content: {
      control: { type: 'text' },
      description: 'Content to be displayed in the card body (slot="content")',
      table: {
        category: 'Content',
      },
    },
  },
  args: {
    header: 'Card Title',
    size: 'default',
    content: 'This is the card content. You can put any content here including text, images, buttons, and other components.',
  },
};

export default meta;
type Story = StoryObj;

/**
 * The default card demonstrates the standard card appearance with a header and content.
 * This is the most common card configuration used throughout applications.
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The default card configuration with header and content. This provides a clean container for organizing related information.',
      },
    },
  },
  args: {
    header: 'Default Card',
    content: 'This is a default card with standard sizing and spacing. It provides a clean container for organizing content.',
  },
  render: (args: any) => html`
    <nr-card 
      header="${args.header}" 
      size="${args.size}"
    >
      <div slot="content">${args.content}</div>
    </nr-card>
  `,
};

/**
 * Cards without headers provide a clean content container without additional visual hierarchy.
 * Use this when the content itself provides sufficient context or when headers would be redundant.
 */
export const WithoutHeader: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Card without a header for cases where the content provides sufficient context or when headers would be redundant.',
      },
    },
  },
  args: {
    header: '',
    content: 'This card demonstrates content display without a header. The content area gets full visual prominence.',
  },
  render: (args: any) => html`
    <nr-card size="${args.size}">
      <div slot="content">${args.content}</div>
    </nr-card>
  `,
};

/**
 * Small cards are ideal for compact layouts, dashboards, or when displaying multiple cards 
 * in a grid. They use reduced padding and smaller font sizes to maximize space efficiency.
 */
export const Small: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Small card variant with reduced padding and font sizes, ideal for compact layouts and dashboard widgets.',
      },
    },
  },
  args: {
    header: 'Small Card',
    size: 'small',
    content: 'This is a small card with compact spacing and typography.',
  },
  render: (args: any) => html`
    <nr-card 
      header="${args.header}" 
      size="${args.size}"
    >
      <div slot="content">${args.content}</div>
    </nr-card>
  `,
};

/**
 * Large cards provide more generous spacing and typography, making them suitable for 
 * featured content, detailed information displays, or when visual prominence is needed.
 */
export const Large: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Large card variant with generous padding and typography, perfect for featured content and detailed information displays.',
      },
    },
  },
  args: {
    header: 'Large Card',
    size: 'large',
    content: 'This is a large card with generous spacing and typography for featured content.',
  },
  render: (args: any) => html`
    <nr-card 
      header="${args.header}" 
      size="${args.size}"
    >
      <div slot="content">${args.content}</div>
    </nr-card>
  `,
};

/**
 * Cards can contain rich content including images, buttons, lists, and other components.
 * This demonstrates the flexibility of the card container for complex content layouts.
 */
export const WithRichContent: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Card with rich content including images, buttons, and structured text to showcase content flexibility.',
      },
    },
  },
  args: {
    header: 'Product Card',
    size: 'default',
  },
  render: (args: any) => html`
    <nr-card 
      header="${args.header}" 
      size="${args.size}"
      style="width: 300px;"
    >
      <div slot="content">
        <div style="margin-bottom: 16px;">
          <img src="https://via.placeholder.com/268x150/e1f5fe/01579b?text=Product+Image" 
               alt="Product" 
               style="width: 100%; height: 150px; object-fit: cover; border-radius: 4px;" />
        </div>
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">Premium Product</h3>
        <p style="margin: 0 0 16px 0; color: var(--nuraly-color-text-secondary); font-size: 14px; line-height: 1.5;">
          High-quality product with excellent features and outstanding performance. Perfect for professional use.
        </p>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 18px; font-weight: 600; color: var(--nuraly-color-primary);">$99.99</span>
          <button style="padding: 8px 16px; background: var(--nuraly-color-primary); color: white; border: none; border-radius: 4px; cursor: pointer;">
            Add to Cart
          </button>
        </div>
      </div>
    </nr-card>
  `,
};

/**
 * Demonstrates cards in a grid layout to show how multiple cards work together.
 * This is a common pattern for dashboards, product listings, and content galleries.
 */
export const CardGrid: Story = {
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Multiple cards arranged in a grid layout, demonstrating how cards work together in common UI patterns.',
      },
    },
  },
  args: {
    size: 'default',
  },
  render: (args: any) => html`
    <div style="padding: 20px;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; max-width: 800px;">
        <nr-card header="Analytics" size="${args.size}">
          <div slot="content">
            <div style="text-align: center;">
              <div style="font-size: 2rem; font-weight: 600; color: var(--nuraly-color-primary); margin-bottom: 8px;">1,234</div>
              <div style="color: var(--nuraly-color-text-secondary);">Total Users</div>
            </div>
          </div>
        </nr-card>
        
        <nr-card header="Performance" size="${args.size}">
          <div slot="content">
            <div style="text-align: center;">
              <div style="font-size: 2rem; font-weight: 600; color: var(--nuraly-color-success); margin-bottom: 8px;">98.5%</div>
              <div style="color: var(--nuraly-color-text-secondary);">Uptime</div>
            </div>
          </div>
        </nr-card>
        
        <nr-card header="Revenue" size="${args.size}">
          <div slot="content">
            <div style="text-align: center;">
              <div style="font-size: 2rem; font-weight: 600; color: var(--nuraly-color-warning); margin-bottom: 8px;">$12.5K</div>
              <div style="color: var(--nuraly-color-text-secondary);">This Month</div>
            </div>
          </div>
        </nr-card>
        
        <nr-card header="Tasks" size="${args.size}">
          <div slot="content">
            <div style="space-y: 8px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Complete project</span>
                <span style="color: var(--nuraly-color-success);">✓</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Review designs</span>
                <span style="color: var(--nuraly-color-warning);">⧖</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Deploy updates</span>
                <span style="color: var(--nuraly-color-text-secondary);">○</span>
              </div>
            </div>
          </div>
        </nr-card>
      </div>
    </div>
  `,
};

/**
 * Cards adapt to different themes automatically through the theme system.
 * This example shows how cards appear across different theme variants.
 */
export const ThemeVariations: Story = {
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Cards automatically adapt to different themes, demonstrating the theme system integration.',
      },
    },
  },
  render: () => html`
    <div style="padding: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
      <div>
        <h3 style="margin-bottom: 16px;">Default Theme</h3>
        <div data-theme="default-light" style="padding: 16px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <nr-card header="Light Theme Card" size="default">
            <div slot="content">
              This card demonstrates the default light theme appearance with clean, minimal styling.
            </div>
          </nr-card>
        </div>
      </div>
      
      <div>
        <h3 style="margin-bottom: 16px;">Carbon Theme</h3>
        <div data-theme="carbon-light" style="padding: 16px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <nr-card header="Carbon Theme Card" size="default">
            <div slot="content">
              This card shows the Carbon Design System theme integration with IBM Carbon styling.
            </div>
          </nr-card>
        </div>
      </div>
    </div>
  `,
};

/**
 * Interactive playground for testing all card properties and content combinations.
 * Use the controls panel to experiment with different configurations.
 */
export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground for experimenting with all card properties and content combinations. Use the controls panel to test different configurations.',
      },
    },
  },
  render: (args: any) => html`
    <nr-card 
      header="${args.header}" 
      size="${args.size}"
      style="max-width: 400px;"
    >
      <div slot="content">${args.content}</div>
    </nr-card>
  `,
};