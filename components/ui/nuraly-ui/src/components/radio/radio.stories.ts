import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { action } from '@storybook/addon-actions';
import './index.js';

const meta: Meta = {
  title: 'Data Entry/Radio',
  component: 'nr-radio',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: { type: 'boolean' },
      description: 'Whether the radio button is checked',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the radio button is disabled',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Radio button size',
    },
    name: {
      control: { type: 'text' },
      description: 'Radio group name (used to group radio buttons)',
    },
    value: {
      control: { type: 'text' },
      description: 'Radio button value',
    },
  },
  args: {
    checked: false,
    disabled: false,
    size: 'medium',
    name: 'radio-group',
    value: 'option',
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: (args) => html`
    <nr-radio
      ?checked=${args.checked}
      ?disabled=${args.disabled}
      size=${args.size}
      name=${args.name}
      value=${args.value}
      @change=${action('change')}
    >
      Radio Button
    </nr-radio>
  `,
};

/**
 * ## Radio Button Sizes
 * 
 * Radio buttons come in three sizes: small (16px), medium (20px - default), and large (24px).
 * Each size maintains consistent proportions while adapting to different design contexts.
 */
export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive comparison of radio button sizes. Small (16px), Medium (20px - default), and Large (24px). Label text size also adjusts accordingly.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 2rem;">
      <!-- Small Size -->
      <div>
        <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">Small (16px)</h4>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; gap: 16px; flex-wrap: wrap;">
            <nr-radio name="small-demo" value="option1" size="small" checked>Option 1</nr-radio>
            <nr-radio name="small-demo" value="option2" size="small">Option 2</nr-radio>
            <nr-radio name="small-demo" value="option3" size="small">Option 3</nr-radio>
          </div>
          <div style="margin-top: 8px;">
            <nr-radio name="small-disabled" value="d1" size="small" disabled>Disabled</nr-radio>
            <span style="margin-left: 16px;">
              <nr-radio name="small-disabled" value="d2" size="small" disabled checked>Disabled Checked</nr-radio>
            </span>
          </div>
        </div>
        <p style="font-size: 0.875rem; color: #6f6f6f; margin-top: 12px;">
          Use in compact layouts, sidebars, or when space is limited
        </p>
      </div>

      <!-- Medium Size (Default) -->
      <div>
        <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">Medium (20px) - Default</h4>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; gap: 16px; flex-wrap: wrap;">
            <nr-radio name="medium-demo" value="option1" size="medium" checked>Option 1</nr-radio>
            <nr-radio name="medium-demo" value="option2" size="medium">Option 2</nr-radio>
            <nr-radio name="medium-demo" value="option3" size="medium">Option 3</nr-radio>
          </div>
          <div style="margin-top: 8px;">
            <nr-radio name="medium-disabled" value="d1" size="medium" disabled>Disabled</nr-radio>
            <span style="margin-left: 16px;">
              <nr-radio name="medium-disabled" value="d2" size="medium" disabled checked>Disabled Checked</nr-radio>
            </span>
          </div>
        </div>
        <p style="font-size: 0.875rem; color: #6f6f6f; margin-top: 12px;">
          Default size - most common for forms and standard interfaces
        </p>
      </div>

      <!-- Large Size -->
      <div>
        <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">Large (24px)</h4>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; gap: 16px; flex-wrap: wrap;">
            <nr-radio name="large-demo" value="option1" size="large" checked>Option 1</nr-radio>
            <nr-radio name="large-demo" value="option2" size="large">Option 2</nr-radio>
            <nr-radio name="large-demo" value="option3" size="large">Option 3</nr-radio>
          </div>
          <div style="margin-top: 8px;">
            <nr-radio name="large-disabled" value="d1" size="large" disabled>Disabled</nr-radio>
            <span style="margin-left: 16px;">
              <nr-radio name="large-disabled" value="d2" size="large" disabled checked>Disabled Checked</nr-radio>
            </span>
          </div>
        </div>
        <p style="font-size: 0.875rem; color: #6f6f6f; margin-top: 12px;">
          Use for mobile interfaces, touch screens, or when radio buttons need more prominence
        </p>
      </div>

      <!-- Side-by-Side Comparison -->
      <div style="margin-top: 1rem;">
        <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">Side-by-Side Comparison</h4>
        <div style="display: flex; gap: 24px; align-items: center;">
          <nr-radio name="comparison" value="small" size="small" checked>Small</nr-radio>
          <nr-radio name="comparison" value="medium" size="medium">Medium</nr-radio>
          <nr-radio name="comparison" value="large" size="large">Large</nr-radio>
        </div>
      </div>

      <!-- Vertical Layout Comparison -->
      <div style="margin-top: 1rem;">
        <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">Vertical Layout</h4>
        <div style="display: flex; gap: 48px;">
          <div>
            <p style="margin: 0 0 8px 0; font-size: 0.875rem; font-weight: 500;">Small</p>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <nr-radio name="vertical-small" value="1" size="small" checked>First Option</nr-radio>
              <nr-radio name="vertical-small" value="2" size="small">Second Option</nr-radio>
              <nr-radio name="vertical-small" value="3" size="small">Third Option</nr-radio>
            </div>
          </div>
          <div>
            <p style="margin: 0 0 8px 0; font-size: 0.875rem; font-weight: 500;">Medium</p>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <nr-radio name="vertical-medium" value="1" size="medium" checked>First Option</nr-radio>
              <nr-radio name="vertical-medium" value="2" size="medium">Second Option</nr-radio>
              <nr-radio name="vertical-medium" value="3" size="medium">Third Option</nr-radio>
            </div>
          </div>
          <div>
            <p style="margin: 0 0 8px 0; font-size: 0.875rem; font-weight: 500;">Large</p>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <nr-radio name="vertical-large" value="1" size="large" checked>First Option</nr-radio>
              <nr-radio name="vertical-large" value="2" size="large">Second Option</nr-radio>
              <nr-radio name="vertical-large" value="3" size="large">Third Option</nr-radio>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <nr-radio name="disabled-demo" value="1" disabled>Disabled Unchecked</nr-radio>
      <nr-radio name="disabled-demo" value="2" checked disabled>Disabled Checked</nr-radio>
    </div>
  `,
};

export const WithLongLabel: Story = {
  render: () => html`
    <div style="max-width: 300px; display: flex; flex-direction: column; gap: 12px;">
      <nr-radio name="long-label" value="1" checked>
        This is a very long label that demonstrates how the radio button handles text wrapping and multi-line content
      </nr-radio>
      <nr-radio name="long-label" value="2">
        Another long option with detailed description that spans multiple lines to show layout behavior
      </nr-radio>
    </div>
  `,
};

export const Interactive: Story = {
  render: () => html`
    <div>
      <style>
        .demo-section {
          margin-bottom: 24px;
          padding: 16px;
          border: 1px solid #d9d9d9;
          border-radius: 8px;
        }
        .demo-section h4 {
          margin-top: 0;
          margin-bottom: 12px;
        }
        .radio-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .result {
          margin-top: 12px;
          padding: 12px;
          background: #f5f5f5;
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
        }
      </style>

      <div class="demo-section">
        <h4>Favorite Color</h4>
        <div class="radio-container">
          <nr-radio 
            name="color" 
            value="red" 
            @change=${(e: CustomEvent) => {
              const result = document.getElementById('color-result');
              if (result) result.textContent = `Selected: ${e.detail.value}`;
            }}
          >
            Red
          </nr-radio>
          <nr-radio 
            name="color" 
            value="blue" 
            checked
            @change=${(e: CustomEvent) => {
              const result = document.getElementById('color-result');
              if (result) result.textContent = `Selected: ${e.detail.value}`;
            }}
          >
            Blue
          </nr-radio>
          <nr-radio 
            name="color" 
            value="green"
            @change=${(e: CustomEvent) => {
              const result = document.getElementById('color-result');
              if (result) result.textContent = `Selected: ${e.detail.value}`;
            }}
          >
            Green
          </nr-radio>
        </div>
        <div id="color-result" class="result">Selected: blue</div>
      </div>

      <div class="demo-section">
        <h4>Size Preferences</h4>
        <div style="display: flex; gap: 16px;">
          <nr-radio 
            name="size-pref" 
            value="small" 
            size="small"
            @change=${(e: CustomEvent) => {
              const result = document.getElementById('size-result');
              if (result) result.textContent = `Selected: ${e.detail.value}`;
            }}
          >
            Small
          </nr-radio>
          <nr-radio 
            name="size-pref" 
            value="medium" 
            size="medium"
            checked
            @change=${(e: CustomEvent) => {
              const result = document.getElementById('size-result');
              if (result) result.textContent = `Selected: ${e.detail.value}`;
            }}
          >
            Medium
          </nr-radio>
          <nr-radio 
            name="size-pref" 
            value="large" 
            size="large"
            @change=${(e: CustomEvent) => {
              const result = document.getElementById('size-result');
              if (result) result.textContent = `Selected: ${e.detail.value}`;
            }}
          >
            Large
          </nr-radio>
        </div>
        <div id="size-result" class="result">Selected: medium</div>
      </div>
    </div>
  `,
};
