import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { action } from '@storybook/addon-actions';
import './index.js';
import '../../shared/themes/carbon/index.css';
import '../../shared/themes/default/index.css';

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

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <nr-radio name="size-demo" value="small" size="small" checked>Small</nr-radio>
        <nr-radio name="size-demo" value="medium" size="medium">Medium</nr-radio>
        <nr-radio name="size-demo" value="large" size="large">Large</nr-radio>
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
