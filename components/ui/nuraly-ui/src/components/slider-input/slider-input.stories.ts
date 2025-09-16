import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './slider-input.component.js';

const meta: Meta = {
  title: 'Components/SliderInput',
  component: 'hy-slider-input',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The SliderInput component provides an interactive slider for selecting numeric values within a specified range. 
It supports theming, size variants, state indicators, and accessibility features.

## Features
- **Range Selection**: Set min, max, step, and initial values
- **Theme Support**: Works with both Carbon and Default design systems
- **Size Variants**: Small, medium, and large sizes
- **State Variants**: Error, warning, and success states
- **Accessibility**: Full keyboard navigation and screen reader support
- **Responsive**: Adapts to container width
        `,
      },
    },
  },
  argTypes: {
    value: {
      control: { type: 'number', min: 0, max: 100, step: 1 },
      description: 'Current value of the slider',
    },
    min: {
      control: { type: 'number' },
      description: 'Minimum value',
    },
    max: {
      control: { type: 'number' },
      description: 'Maximum value',
    },
    step: {
      control: { type: 'number', min: 1 },
      description: 'Step increment',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the slider',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Size variant',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'error', 'warning', 'success'],
      description: 'State variant',
    },
  },
  args: {
    value: 50,
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
    size: 'medium',
    variant: 'default',
  },
};

export default meta;
type Story = StoryObj;

// Helper function to create slider stories
const createSliderStory = (args: any) => html`
  <div style="width: 300px;">
    <hy-slider-input
      .value=${args.value}
      .min=${args.min}
      .max=${args.max}
      .step=${args.step}
      ?disabled=${args.disabled}
      size=${args.size || ''}
      .class=${args.variant !== 'default' ? args.variant : ''}
      @change=${(e: Event) => {
        console.log('Slider changed:', (e.target as any).value);
      }}
    ></hy-slider-input>
    <div style="margin-top: 8px; font-size: 12px; color: #666;">
      Value: ${args.value}
    </div>
  </div>
`;

export const Default: Story = {
  render: (args) => createSliderStory(args),
};

export const WithCustomRange: Story = {
  args: {
    value: 25,
    min: 10,
    max: 50,
    step: 5,
  },
  render: (args) => createSliderStory(args),
};

export const Disabled: Story = {
  args: {
    value: 30,
    disabled: true,
  },
  render: (args) => createSliderStory(args),
};

export const SmallSize: Story = {
  args: {
    value: 40,
    size: 'small',
  },
  render: (args) => createSliderStory(args),
};

export const LargeSize: Story = {
  args: {
    value: 60,
    size: 'large',
  },
  render: (args) => createSliderStory(args),
};

export const ErrorState: Story = {
  args: {
    value: 80,
    variant: 'error',
  },
  render: (args) => html`
    <div style="width: 300px;">
      <hy-slider-input
        .value=${args.value}
        .min=${args.min}
        .max=${args.max}
        .step=${args.step}
        ?disabled=${args.disabled}
        size=${args.size || ''}
        error
      ></hy-slider-input>
      <div style="margin-top: 8px; font-size: 12px; color: #ff4d4f;">
        Error: Value is too high
      </div>
    </div>
  `,
};

export const WarningState: Story = {
  args: {
    value: 75,
    variant: 'warning',
  },
  render: (args) => html`
    <div style="width: 300px;">
      <hy-slider-input
        .value=${args.value}
        .min=${args.min}
        .max=${args.max}
        .step=${args.step}
        ?disabled=${args.disabled}
        size=${args.size || ''}
        warning
      ></hy-slider-input>
      <div style="margin-top: 8px; font-size: 12px; color: #faad14;">
        Warning: Value is approaching limit
      </div>
    </div>
  `,
};

export const SuccessState: Story = {
  args: {
    value: 25,
    variant: 'success',
  },
  render: (args) => html`
    <div style="width: 300px;">
      <hy-slider-input
        .value=${args.value}
        .min=${args.min}
        .max=${args.max}
        .step=${args.step}
        ?disabled=${args.disabled}
        size=${args.size || ''}
        success
      ></hy-slider-input>
      <div style="margin-top: 8px; font-size: 12px; color: #52c41a;">
        Success: Optimal value selected
      </div>
    </div>
  `,
};

export const SizeComparison: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px; width: 300px;">
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Small</label>
        <hy-slider-input value="20" size="small"></hy-slider-input>
      </div>
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Medium (Default)</label>
        <hy-slider-input value="50"></hy-slider-input>
      </div>
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Large</label>
        <hy-slider-input value="80" size="large"></hy-slider-input>
      </div>
    </div>
  `,
};

export const StateComparison: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px; width: 300px;">
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Default</label>
        <hy-slider-input value="50"></hy-slider-input>
      </div>
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #52c41a;">Success</label>
        <hy-slider-input value="30" success></hy-slider-input>
      </div>
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #faad14;">Warning</label>
        <hy-slider-input value="75" warning></hy-slider-input>
      </div>
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #ff4d4f;">Error</label>
        <hy-slider-input value="90" error></hy-slider-input>
      </div>
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #8c8c8c;">Disabled</label>
        <hy-slider-input value="40" disabled></hy-slider-input>
      </div>
    </div>
  `,
};

export const ThemeComparison: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 32px;">
      <div>
        <h3 style="margin: 0 0 16px 0;">Carbon Theme (Sharp Corners)</h3>
        <div data-theme="carbon" style="padding: 16px; background: #f4f4f4; border-radius: 4px;">
          <div style="display: flex; flex-direction: column; gap: 16px; width: 300px;">
            <hy-slider-input value="30"></hy-slider-input>
            <hy-slider-input value="60" size="large"></hy-slider-input>
            <hy-slider-input value="40" disabled></hy-slider-input>
          </div>
        </div>
      </div>
      
      <div>
        <h3 style="margin: 0 0 16px 0;">Default Theme (Rounded Corners)</h3>
        <div data-theme="default" style="padding: 16px; background: #fafafa; border-radius: 8px;">
          <div style="display: flex; flex-direction: column; gap: 16px; width: 300px;">
            <hy-slider-input value="30"></hy-slider-input>
            <hy-slider-input value="60" size="large"></hy-slider-input>
            <hy-slider-input value="40" disabled></hy-slider-input>
          </div>
        </div>
      </div>
    </div>
  `,
};

export const Interactive: Story = {
  render: () => {
    let value = 50;
    
    const handleChange = (e: Event) => {
      value = (e.target as any).value;
      const display = document.getElementById('value-display');
      if (display) {
        display.textContent = value.toString();
      }
    };

    return html`
      <div style="width: 400px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <label style="font-weight: 500;">Volume Control</label>
          <span style="font-family: monospace; background: #f5f5f5; padding: 4px 8px; border-radius: 4px;">
            <span id="value-display">${value}</span>%
          </span>
        </div>
        
        <hy-slider-input
          .value=${value}
          .min=${0}
          .max=${100}
          .step=${1}
          @change=${handleChange}
        ></hy-slider-input>
        
        <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px; color: #666;">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
        
        <div style="margin-top: 16px; padding: 12px; background: #f9f9f9; border-radius: 6px;">
          <strong>Instructions:</strong>
          <ul style="margin: 8px 0 0 16px; font-size: 14px;">
            <li>Drag the slider thumb to adjust the value</li>
            <li>Use arrow keys for fine control when focused</li>
            <li>Value updates in real-time</li>
          </ul>
        </div>
      </div>
    `;
  },
};

export const CustomStyling: Story = {
  render: () => html`
    <style>
      .custom-slider {
        --nuraly-slider-input-local-track-filled-color: linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3);
        --nuraly-slider-input-local-thumb-color: #ffffff;
        --nuraly-slider-input-local-thumb-border-color: #333;
        --nuraly-slider-input-local-track-height: 8px;
        --nuraly-slider-input-local-thumb-diameter: 20px;
      }
      
      .minimal-slider {
        --nuraly-slider-input-local-track-filled-color: #333;
        --nuraly-slider-input-local-track-color: #eee;
        --nuraly-slider-input-local-thumb-color: #333;
        --nuraly-slider-input-local-thumb-border-color: #333;
        --nuraly-slider-input-local-track-height: 2px;
        --nuraly-slider-input-local-thumb-diameter: 12px;
      }
    </style>
    
    <div style="display: flex; flex-direction: column; gap: 24px; width: 300px;">
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Rainbow Gradient</label>
        <hy-slider-input value="70" class="custom-slider"></hy-slider-input>
      </div>
      
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Minimal Style</label>
        <hy-slider-input value="30" class="minimal-slider"></hy-slider-input>
      </div>
      
      <div>
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Default Style</label>
        <hy-slider-input value="50"></hy-slider-input>
      </div>
    </div>
  `,
};