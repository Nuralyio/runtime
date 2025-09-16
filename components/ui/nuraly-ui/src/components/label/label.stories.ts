import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './index.js';
import '../../shared/themes/carbon/index.css';
import '../../shared/themes/default/index.css';
const meta: Meta = {
  title: 'Components/Label',
  component: 'hy-label',
  parameters: {
    docs: {
      description: {
        component: 'A flexible label component that supports various sizes, variants, and states. Perfect for form labels and descriptive text.',
      },
    },
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Size of the label',
      table: {
        defaultValue: { summary: 'medium' },
      },
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'secondary', 'success', 'warning', 'error'],
      description: 'Visual variant of the label',
      table: {
        defaultValue: { summary: 'default' },
      },
    },
    required: {
      control: { type: 'boolean' },
      description: 'Shows required asterisk (*)',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disabled state',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    for: {
      control: { type: 'text' },
      description: 'Associates label with form control (for attribute)',
    },
  },
};

export default meta;
type Story = StoryObj;

// Basic Stories
export const Default: Story = {
  args: {
    size: 'medium',
    variant: 'default',
    required: false,
    disabled: false,
  },
  render: (args) => html`
    <hy-label 
      size=${args.size} 
      variant=${args.variant}
      ?required=${args.required}
      ?disabled=${args.disabled}
      for=${args.for || ''}
    >
      Default Label
    </hy-label>
  `,
};

export const Required: Story = {
  args: {
    ...Default.args,
    required: true,
  },
  render: (args) => html`
    <hy-label 
      size=${args.size} 
      variant=${args.variant}
      ?required=${args.required}
      ?disabled=${args.disabled}
      for=${args.for || ''}
    >
      Required Field
    </hy-label>
  `,
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
  render: (args) => html`
    <hy-label 
      size=${args.size} 
      variant=${args.variant}
      ?required=${args.required}
      ?disabled=${args.disabled}
      for=${args.for || ''}
    >
      Disabled Label
    </hy-label>
  `,
};

// Size Variants
export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div>
        <h3>Small</h3>
        <hy-label size="small">Small Label</hy-label>
      </div>
      <div>
        <h3>Medium (Default)</h3>
        <hy-label size="medium">Medium Label</hy-label>
      </div>
      <div>
        <h3>Large</h3>
        <hy-label size="large">Large Label</hy-label>
      </div>
    </div>
  `,
};

// Variant Colors
export const Variants: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div>
        <h3>Default</h3>
        <hy-label variant="default">Default Label</hy-label>
      </div>
      <div>
        <h3>Secondary</h3>
        <hy-label variant="secondary">Secondary Label</hy-label>
      </div>
      <div>
        <h3>Success</h3>
        <hy-label variant="success">Success Label</hy-label>
      </div>
      <div>
        <h3>Warning</h3>
        <hy-label variant="warning">Warning Label</hy-label>
      </div>
      <div>
        <h3>Error</h3>
        <hy-label variant="error">Error Label</hy-label>
      </div>
    </div>
  `,
};

// Required Indicators
export const RequiredStates: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div>
        <h3>Optional Field</h3>
        <hy-label>Email Address</hy-label>
      </div>
      <div>
        <h3>Required Field</h3>
        <hy-label required>Email Address</hy-label>
      </div>
      <div>
        <h3>Required + Error State</h3>
        <hy-label required variant="error">Email Address</hy-label>
      </div>
    </div>
  `,
};

// Form Integration Example
export const FormIntegration: Story = {
  render: () => html`
    <form style="display: flex; flex-direction: column; gap: 16px; max-width: 300px;">
      <div>
        <hy-label for="username" required>Username</hy-label>
        <input id="username" type="text" style="width: 100%; padding: 8px; margin-top: 4px;" />
      </div>
      
      <div>
        <hy-label for="email" required>Email Address</hy-label>
        <input id="email" type="email" style="width: 100%; padding: 8px; margin-top: 4px;" />
      </div>
      
      <div>
        <hy-label for="phone" variant="secondary">Phone Number (Optional)</hy-label>
        <input id="phone" type="tel" style="width: 100%; padding: 8px; margin-top: 4px;" />
      </div>
      
      <div>
        <hy-label for="bio">Bio</hy-label>
        <textarea id="bio" style="width: 100%; padding: 8px; margin-top: 4px; min-height: 80px;"></textarea>
      </div>
    </form>
  `,
};

// All States Showcase
export const AllStates: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px;">
      <!-- Small Size Variants -->
      <div>
        <h4>Small Size</h4>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <hy-label size="small">Default Small</hy-label>
          <hy-label size="small" required>Required Small</hy-label>
          <hy-label size="small" variant="error">Error Small</hy-label>
          <hy-label size="small" disabled>Disabled Small</hy-label>
        </div>
      </div>
      
      <!-- Medium Size Variants -->
      <div>
        <h4>Medium Size</h4>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <hy-label size="medium">Default Medium</hy-label>
          <hy-label size="medium" required>Required Medium</hy-label>
          <hy-label size="medium" variant="warning">Warning Medium</hy-label>
          <hy-label size="medium" disabled>Disabled Medium</hy-label>
        </div>
      </div>
      
      <!-- Large Size Variants -->
      <div>
        <h4>Large Size</h4>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <hy-label size="large">Default Large</hy-label>
          <hy-label size="large" required>Required Large</hy-label>
          <hy-label size="large" variant="success">Success Large</hy-label>
          <hy-label size="large" disabled>Disabled Large</hy-label>
        </div>
      </div>
    </div>
  `,
};

// Theme Comparison
export const ThemeComparison: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
      <div data-theme="default-light" style="padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h4>Default Light Theme</h4>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <hy-label>Default Label</hy-label>
          <hy-label required>Required Label</hy-label>
          <hy-label variant="error">Error Label</hy-label>
          <hy-label variant="success">Success Label</hy-label>
          <hy-label disabled>Disabled Label</hy-label>
        </div>
      </div>
      
      <div data-theme="carbon-light" style="padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h4>Carbon Light Theme</h4>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <hy-label>Default Label</hy-label>
          <hy-label required>Required Label</hy-label>
          <hy-label variant="error">Error Label</hy-label>
          <hy-label variant="success">Success Label</hy-label>
          <hy-label disabled>Disabled Label</hy-label>
        </div>
      </div>
    </div>
  `,
};

// Interactive Playground
export const Interactive: Story = {
  args: {
    size: 'medium',
    variant: 'default',
    required: false,
    disabled: false,
    for: 'demo-input',
  },
  render: (args) => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
      <hy-label 
        size=${args.size} 
        variant=${args.variant}
        ?required=${args.required}
        ?disabled=${args.disabled}
        for=${args.for || ''}
      >
        Interactive Label (Try changing props above)
      </hy-label>
      
      <input 
        id="demo-input" 
        type="text" 
        placeholder="Associated form input"
        style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
        ?disabled=${args.disabled}
      />
      
      <p style="font-size: 12px; color: #666; margin: 0;">
        Click the label to focus the input field. Use the controls above to see different states.
      </p>
    </div>
  `,
};