import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './index.js';
import '../../shared/themes/carbon/index.css';
import '../../shared/themes/default/index.css';
import '../icon/index.js';
import '../button/index.js';

/**
 * ## Badge
 * 
 * Small numerical value or status descriptor for UI elements.
 * Badge normally appears in proximity to notifications or user avatars with
 * eye-catching appeal, typically displaying unread messages count.
 * 
 * ### When to use
 * - Display notification counts or status indicators
 * - Show unread message counts
 * - Indicate status of items or processes
 * - Add decorative ribbons to cards or products
 * - Highlight new or important items
 * 
 * ### Features
 * - Count badge with overflow support
 * - Dot badge for simple indicators
 * - Status badge with predefined states
 * - Ribbon badge for decorative labels
 * - Customizable colors (preset and custom)
 * - Offset positioning
 * - Show zero option
 * - Theme-aware styling
 */
const meta: Meta = {
  title: 'Data Display/Badge',
  component: 'nr-badge',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Small numerical value or status descriptor for UI elements. Badge normally appears in proximity to notifications or user avatars with eye-catching appeal, typically displaying unread messages count.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    count: {
      control: { type: 'number' },
      description: 'Number to show in badge',
      table: {
        category: 'Content',
        type: { summary: 'number' },
      },
    },
    dot: {
      control: { type: 'boolean' },
      description: 'Whether to display a dot instead of count',
      table: {
        category: 'Appearance',
        defaultValue: { summary: 'false' },
      },
    },
    overflowCount: {
      control: { type: 'number' },
      description: 'Max count to show (shows count+ when exceeded)',
      table: {
        category: 'Content',
        defaultValue: { summary: '99' },
      },
    },
    showZero: {
      control: { type: 'boolean' },
      description: 'Whether to show badge when count is zero',
      table: {
        category: 'Appearance',
        defaultValue: { summary: 'false' },
      },
    },
    color: {
      control: { type: 'select' },
      options: ['', 'pink', 'red', 'yellow', 'orange', 'cyan', 'green', 'blue', 'purple', 'geekblue', 'magenta', 'volcano', 'gold', 'lime'],
      description: 'Badge color (preset or custom hex/rgb)',
      table: {
        category: 'Appearance',
        type: { summary: 'BadgeColor | string' },
      },
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'small'],
      description: 'Badge size',
      table: {
        category: 'Appearance',
        defaultValue: { summary: 'default' },
      },
    },
    status: {
      control: { type: 'select' },
      options: ['', 'success', 'processing', 'default', 'error', 'warning'],
      description: 'Set Badge as a status dot',
      table: {
        category: 'Status',
        type: { summary: 'BadgeStatus' },
      },
    },
    text: {
      control: { type: 'text' },
      description: 'Status text to display',
      table: {
        category: 'Content',
        type: { summary: 'string' },
      },
    },
    ribbon: {
      control: { type: 'text' },
      description: 'Ribbon text (enables ribbon mode)',
      table: {
        category: 'Content',
        type: { summary: 'string' },
      },
    },
    ribbonPlacement: {
      control: { type: 'select' },
      options: ['start', 'end'],
      description: 'Ribbon placement',
      table: {
        category: 'Appearance',
        defaultValue: { summary: 'end' },
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/**
 * Basic badge with simple count
 */
export const Default: Story = {
  args: {
    count: 5,
  },
  render: (args) => html`
    <nr-badge count=${args.count}>
      <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer;">
        Notifications
      </button>
    </nr-badge>
  `,
};

/**
 * Badge with overflow count
 */
export const OverflowCount: Story = {
  render: () => html`
    <div style="display: flex; gap: 2rem; align-items: center;">
      <nr-badge count="99">
        <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer;">
          99
        </button>
      </nr-badge>
      
      <nr-badge count="100">
        <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer;">
          100 (99+)
        </button>
      </nr-badge>
      
      <nr-badge count="1000" overflow-count="999">
        <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer;">
          1000 (999+)
        </button>
      </nr-badge>
    </div>
  `,
};

/**
 * Simple dot badge without count
 */
export const DotBadge: Story = {
  render: () => html`
    <div style="display: flex; gap: 2rem; align-items: center;">
      <nr-badge dot>
        <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer;">
          Notifications
        </button>
      </nr-badge>
      
      <nr-badge dot>
        <span style="font-size: 24px;">🔔</span>
      </nr-badge>
      
      <nr-badge dot>
        <a href="#" style="color: #1890ff; text-decoration: none;">Link</a>
      </nr-badge>
    </div>
  `,
};

/**
 * Badge showing zero count
 */
export const ShowZero: Story = {
  render: () => html`
    <div style="display: flex; gap: 2rem; align-items: center;">
      <nr-badge count="0">
        <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer;">
          Hidden when zero
        </button>
      </nr-badge>
      
      <nr-badge count="0" show-zero>
        <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer;">
          Show zero
        </button>
      </nr-badge>
    </div>
  `,
};

/**
 * Status badges with different states
 */
export const StatusBadge: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <nr-badge status="success" text="Success"></nr-badge>
      <nr-badge status="error" text="Error"></nr-badge>
      <nr-badge status="default" text="Default"></nr-badge>
      <nr-badge status="processing" text="Processing"></nr-badge>
      <nr-badge status="warning" text="Warning"></nr-badge>
    </div>
  `,
};

/**
 * Status badges without text
 */
export const StatusDotOnly: Story = {
  render: () => html`
    <div style="display: flex; gap: 1.5rem; align-items: center;">
      <nr-badge status="success"></nr-badge>
      <nr-badge status="error"></nr-badge>
      <nr-badge status="default"></nr-badge>
      <nr-badge status="processing"></nr-badge>
      <nr-badge status="warning"></nr-badge>
    </div>
  `,
};

/**
 * Standalone badges without children
 */
export const Standalone: Story = {
  render: () => html`
    <div style="display: flex; gap: 2rem; align-items: center;">
      <nr-badge count="25"></nr-badge>
      <nr-badge count="100"></nr-badge>
      <nr-badge count="1000" overflow-count="999"></nr-badge>
      <nr-badge dot></nr-badge>
    </div>
  `,
};

/**
 * Badge with size variants
 */
export const SizeVariants: Story = {
  render: () => html`
    <div style="display: flex; gap: 2rem; align-items: center;">
      <nr-badge count="5" size="default">
        <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer;">
          Default
        </button>
      </nr-badge>
      
      <nr-badge count="5" size="small">
        <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer;">
          Small
        </button>
      </nr-badge>
    </div>
  `,
};

/**
 * Preset color badges
 */
export const PresetColors: Story = {
  render: () => html`
    <div style="display: flex; flex-wrap: wrap; gap: 1rem; max-width: 800px;">
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="width: 80px;">Pink:</span>
        <nr-badge count="5" color="pink">
          <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white;">Badge</button>
        </nr-badge>
      </div>
      
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="width: 80px;">Red:</span>
        <nr-badge count="5" color="red">
          <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white;">Badge</button>
        </nr-badge>
      </div>
      
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="width: 80px;">Yellow:</span>
        <nr-badge count="5" color="yellow">
          <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white;">Badge</button>
        </nr-badge>
      </div>
      
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="width: 80px;">Orange:</span>
        <nr-badge count="5" color="orange">
          <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white;">Badge</button>
        </nr-badge>
      </div>
      
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="width: 80px;">Cyan:</span>
        <nr-badge count="5" color="cyan">
          <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white;">Badge</button>
        </nr-badge>
      </div>
      
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="width: 80px;">Green:</span>
        <nr-badge count="5" color="green">
          <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white;">Badge</button>
        </nr-badge>
      </div>
      
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="width: 80px;">Blue:</span>
        <nr-badge count="5" color="blue">
          <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white;">Badge</button>
        </nr-badge>
      </div>
      
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="width: 80px;">Purple:</span>
        <nr-badge count="5" color="purple">
          <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white;">Badge</button>
        </nr-badge>
      </div>
      
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="width: 80px;">Geekblue:</span>
        <nr-badge count="5" color="geekblue">
          <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white;">Badge</button>
        </nr-badge>
      </div>
      
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="width: 80px;">Magenta:</span>
        <nr-badge count="5" color="magenta">
          <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white;">Badge</button>
        </nr-badge>
      </div>
      
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="width: 80px;">Volcano:</span>
        <nr-badge count="5" color="volcano">
          <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white;">Badge</button>
        </nr-badge>
      </div>
      
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="width: 80px;">Gold:</span>
        <nr-badge count="5" color="gold">
          <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white;">Badge</button>
        </nr-badge>
      </div>
      
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="width: 80px;">Lime:</span>
        <nr-badge count="5" color="lime">
          <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white;">Badge</button>
        </nr-badge>
      </div>
    </div>
  `,
};

/**
 * Custom color badges
 */
export const CustomColors: Story = {
  render: () => html`
    <div style="display: flex; gap: 2rem; align-items: center;">
      <nr-badge count="5" color="#f50">
        <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white;">
          #f50
        </button>
      </nr-badge>
      
      <nr-badge count="5" color="rgb(45, 183, 245)">
        <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white;">
          RGB
        </button>
      </nr-badge>
      
      <nr-badge count="5" color="hsl(102, 53%, 61%)">
        <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white;">
          HSL
        </button>
      </nr-badge>
    </div>
  `,
};

/**
 * Ribbon badge examples
 */
export const RibbonBadge: Story = {
  render: () => html`
    <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
      <nr-badge ribbon="Recommended">
        <div style="width: 280px; padding: 20px; border: 1px solid #ddd; border-radius: 4px; background: white;">
          <h3 style="margin: 0 0 10px 0;">Card Title</h3>
          <p style="margin: 0; color: #666;">This is a card with a ribbon badge at the end</p>
        </div>
      </nr-badge>
      
      <nr-badge ribbon="New" color="green" ribbon-placement="start">
        <div style="width: 280px; padding: 20px; border: 1px solid #ddd; border-radius: 4px; background: white;">
          <h3 style="margin: 0 0 10px 0;">Card Title</h3>
          <p style="margin: 0; color: #666;">This is a card with a ribbon badge at the start</p>
        </div>
      </nr-badge>
      
      <nr-badge ribbon="Hot" color="red">
        <div style="width: 280px; padding: 20px; border: 1px solid #ddd; border-radius: 4px; background: white;">
          <h3 style="margin: 0 0 10px 0;">Product Card</h3>
          <p style="margin: 0; color: #666;">Special offer on this product</p>
          <p style="margin: 10px 0 0 0; font-weight: bold; font-size: 1.2em;">$99.99</p>
        </div>
      </nr-badge>
    </div>
  `,
};

/**
 * Ribbon with different colors
 */
export const RibbonColors: Story = {
  render: () => html`
    <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
      <nr-badge ribbon="Pink" color="pink">
        <div style="width: 200px; height: 120px; border: 1px solid #ddd; background: white;"></div>
      </nr-badge>
      
      <nr-badge ribbon="Blue" color="blue">
        <div style="width: 200px; height: 120px; border: 1px solid #ddd; background: white;"></div>
      </nr-badge>
      
      <nr-badge ribbon="Green" color="green">
        <div style="width: 200px; height: 120px; border: 1px solid #ddd; background: white;"></div>
      </nr-badge>
      
      <nr-badge ribbon="Yellow" color="yellow">
        <div style="width: 200px; height: 120px; border: 1px solid #ddd; background: white;"></div>
      </nr-badge>
    </div>
  `,
};

/**
 * Badge with offset positioning
 */
export const WithOffset: Story = {
  render: () => {
    return html`
      <div style="display: flex; gap: 3rem; align-items: center;">
        <nr-badge count="5">
          <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white;">
            Default
          </button>
        </nr-badge>
        
        <nr-badge count="5" .offset=${[10, -10] as [number, number]}>
          <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white;">
            Offset [10, -10]
          </button>
        </nr-badge>
        
        <nr-badge count="5" .offset=${[-10, 10] as [number, number]}>
          <button style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white;">
            Offset [-10, 10]
          </button>
        </nr-badge>
      </div>
    `;
  },
};

/**
 * Real-world examples
 */
export const RealWorldExamples: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 2rem;">
      <div>
        <h4 style="margin: 0 0 1rem 0;">Notification Bell</h4>
        <nr-badge count="12">
          <span style="font-size: 28px; cursor: pointer;">🔔</span>
        </nr-badge>
      </div>
      
      <div>
        <h4 style="margin: 0 0 1rem 0;">User Avatar</h4>
        <nr-badge dot>
          <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
            JD
          </div>
        </nr-badge>
      </div>
      
      <div>
        <h4 style="margin: 0 0 1rem 0;">Shopping Cart</h4>
        <nr-badge count="3" color="green">
          <span style="font-size: 28px; cursor: pointer;">🛒</span>
        </nr-badge>
      </div>
      
      <div>
        <h4 style="margin: 0 0 1rem 0;">Product with Ribbon</h4>
        <nr-badge ribbon="Best Seller" color="gold">
          <div style="width: 300px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: white;">
            <img src="https://via.placeholder.com/260x150" alt="Product" style="width: 100%; border-radius: 4px; margin-bottom: 10px;" />
            <h3 style="margin: 0 0 8px 0;">Premium Product</h3>
            <p style="margin: 0 0 12px 0; color: #666;">High quality product with amazing features</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 1.5em; font-weight: bold; color: #1890ff;">$299</span>
              <button style="padding: 8px 20px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Buy Now
              </button>
            </div>
          </div>
        </nr-badge>
      </div>
    </div>
  `,
};

/**
 * Carbon Dark theme
 */
export const CarbonDarkTheme: Story = {
  render: () => html`
    <div data-theme="carbon-dark" style="padding: 2rem; background: #161616; min-width: 600px;">
      <div style="display: flex; flex-direction: column; gap: 2rem;">
        <div>
          <h4 style="color: #f4f4f4; margin: 0 0 1rem 0;">Count Badges</h4>
          <div style="display: flex; gap: 2rem;">
            <nr-badge count="5">
              <button style="padding: 8px 16px; border: 1px solid #525252; border-radius: 4px; background: #262626; color: #f4f4f4;">
                Messages
              </button>
            </nr-badge>
            
            <nr-badge count="99" color="blue">
              <button style="padding: 8px 16px; border: 1px solid #525252; border-radius: 4px; background: #262626; color: #f4f4f4;">
                Notifications
              </button>
            </nr-badge>
          </div>
        </div>
        
        <div>
          <h4 style="color: #f4f4f4; margin: 0 0 1rem 0;">Status Badges</h4>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <nr-badge status="success" text="Success" style="color: #f4f4f4;"></nr-badge>
            <nr-badge status="processing" text="Processing" style="color: #f4f4f4;"></nr-badge>
            <nr-badge status="error" text="Error" style="color: #f4f4f4;"></nr-badge>
          </div>
        </div>
      </div>
    </div>
  `,
};
