import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './index.js';

const meta: Meta = {
  title: 'General/Label',
  component: 'nr-label',
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
    <nr-label 
      size=${args.size} 
      variant=${args.variant}
      ?required=${args.required}
      ?disabled=${args.disabled}
      for=${args.for || ''}
    >
      Default Label
    </nr-label>
  `,
};

export const Required: Story = {
  args: {
    ...Default.args,
    required: true,
  },
  render: (args) => html`
    <nr-label 
      size=${args.size} 
      variant=${args.variant}
      ?required=${args.required}
      ?disabled=${args.disabled}
      for=${args.for || ''}
    >
      Required Field
    </nr-label>
  `,
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
  render: (args) => html`
    <nr-label 
      size=${args.size} 
      variant=${args.variant}
      ?required=${args.required}
      ?disabled=${args.disabled}
      for=${args.for || ''}
    >
      Disabled Label
    </nr-label>
  `,
};

// Size Variants
export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div>
        <h3>Small</h3>
        <nr-label size="small">Small Label</nr-label>
      </div>
      <div>
        <h3>Medium (Default)</h3>
        <nr-label size="medium">Medium Label</nr-label>
      </div>
      <div>
        <h3>Large</h3>
        <nr-label size="large">Large Label</nr-label>
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
        <nr-label variant="default">Default Label</nr-label>
      </div>
      <div>
        <h3>Secondary</h3>
        <nr-label variant="secondary">Secondary Label</nr-label>
      </div>
      <div>
        <h3>Success</h3>
        <nr-label variant="success">Success Label</nr-label>
      </div>
      <div>
        <h3>Warning</h3>
        <nr-label variant="warning">Warning Label</nr-label>
      </div>
      <div>
        <h3>Error</h3>
        <nr-label variant="error">Error Label</nr-label>
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
        <nr-label>Email Address</nr-label>
      </div>
      <div>
        <h3>Required Field</h3>
        <nr-label required>Email Address</nr-label>
      </div>
      <div>
        <h3>Required + Error State</h3>
        <nr-label required variant="error">Email Address</nr-label>
      </div>
    </div>
  `,
};

// Form Integration Example
export const FormIntegration: Story = {
  render: () => html`
    <form style="display: flex; flex-direction: column; gap: 16px; max-width: 300px;">
      <div>
        <nr-label for="username" required>Username</nr-label>
        <input id="username" type="text" style="width: 100%; padding: 8px; margin-top: 4px;" />
      </div>
      
      <div>
        <nr-label for="email" required>Email Address</nr-label>
        <input id="email" type="email" style="width: 100%; padding: 8px; margin-top: 4px;" />
      </div>
      
      <div>
        <nr-label for="phone" variant="secondary">Phone Number (Optional)</nr-label>
        <input id="phone" type="tel" style="width: 100%; padding: 8px; margin-top: 4px;" />
      </div>
      
      <div>
        <nr-label for="bio">Bio</nr-label>
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
          <nr-label size="small">Default Small</nr-label>
          <nr-label size="small" required>Required Small</nr-label>
          <nr-label size="small" variant="error">Error Small</nr-label>
          <nr-label size="small" disabled>Disabled Small</nr-label>
        </div>
      </div>
      
      <!-- Medium Size Variants -->
      <div>
        <h4>Medium Size</h4>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <nr-label size="medium">Default Medium</nr-label>
          <nr-label size="medium" required>Required Medium</nr-label>
          <nr-label size="medium" variant="warning">Warning Medium</nr-label>
          <nr-label size="medium" disabled>Disabled Medium</nr-label>
        </div>
      </div>
      
      <!-- Large Size Variants -->
      <div>
        <h4>Large Size</h4>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <nr-label size="large">Default Large</nr-label>
          <nr-label size="large" required>Required Large</nr-label>
          <nr-label size="large" variant="success">Success Large</nr-label>
          <nr-label size="large" disabled>Disabled Large</nr-label>
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
          <nr-label>Default Label</nr-label>
          <nr-label required>Required Label</nr-label>
          <nr-label variant="error">Error Label</nr-label>
          <nr-label variant="success">Success Label</nr-label>
          <nr-label disabled>Disabled Label</nr-label>
        </div>
      </div>
      
      <div data-theme="carbon-light" style="padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h4>Carbon Light Theme</h4>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <nr-label>Default Label</nr-label>
          <nr-label required>Required Label</nr-label>
          <nr-label variant="error">Error Label</nr-label>
          <nr-label variant="success">Success Label</nr-label>
          <nr-label disabled>Disabled Label</nr-label>
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
      <nr-label 
        size=${args.size} 
        variant=${args.variant}
        ?required=${args.required}
        ?disabled=${args.disabled}
        for=${args.for || ''}
      >
        Interactive Label (Try changing props above)
      </nr-label>
      
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