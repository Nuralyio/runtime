import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../shared/themes/carbon/index.css';
import '../../shared/themes/default/index.css';
import './index.js';

const meta: Meta = {
  title: 'Components/Checkbox',
  component: 'nr-checkbox',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: { type: 'boolean' },
      description: 'Whether the checkbox is checked',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the checkbox is disabled',
    },
    indeterminate: {
      control: { type: 'boolean' },
      description: 'Whether the checkbox is in an indeterminate state',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'The size of the checkbox',
    },
    value: {
      control: { type: 'text' },
      description: 'The value of the checkbox',
    },
    name: {
      control: { type: 'text' },
      description: 'The name attribute of the checkbox',
    },
    label: {
      control: { type: 'text' },
      description: 'The label text for the checkbox',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether the checkbox is required',
    },
    autoFocus: {
      control: { type: 'boolean' },
      description: 'Whether the checkbox should be focused when mounted',
    },
    title: {
      control: { type: 'text' },
      description: 'The title attribute (tooltip) of the checkbox',
    },
    id: {
      control: { type: 'text' },
      description: 'The ID attribute of the checkbox',
    },
    tabIndex: {
      control: { type: 'number' },
      description: 'The tab index of the checkbox',
    },
  },
  args: {
    checked: false,
    disabled: false,
    indeterminate: false,
    size: 'medium',
    value: 'checkbox-value',
    name: 'checkbox-name',
    label: 'Checkbox Label',
    required: false,
    autoFocus: false,
    title: '',
    id: '',
    tabIndex: 0,
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    label: 'Default Checkbox',
  },
  render: (args) => html`
    <nr-checkbox
      ?checked="${args.checked}"
      ?disabled="${args.disabled}"
      ?indeterminate="${args.indeterminate}"
      value="${args.value}"
      name="${args.name}"
    >
      ${args.label}
    </nr-checkbox>
  `,
};

export const Checked: Story = {
  args: {
    checked: true,
    label: 'Checked Checkbox',
  },
  render: (args) => html`
    <nr-checkbox
      ?checked="${args.checked}"
      ?disabled="${args.disabled}"
      ?indeterminate="${args.indeterminate}"
      value="${args.value}"
      name="${args.name}"
    >
      ${args.label}
    </nr-checkbox>
  `,
};

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
    label: 'Indeterminate Checkbox',
  },
  render: (args) => html`
    <nr-checkbox
      ?checked="${args.checked}"
      ?disabled="${args.disabled}"
      ?indeterminate="${args.indeterminate}"
      value="${args.value}"
      name="${args.name}"
    >
      ${args.label}
    </nr-checkbox>
  `,
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Disabled Checkbox',
  },
  render: (args) => html`
    <nr-checkbox
      ?checked="${args.checked}"
      ?disabled="${args.disabled}"
      ?indeterminate="${args.indeterminate}"
      value="${args.value}"
      name="${args.name}"
    >
      ${args.label}
    </nr-checkbox>
  `,
};

export const DisabledChecked: Story = {
  args: {
    checked: true,
    disabled: true,
    label: 'Disabled Checked Checkbox',
  },
  render: (args) => html`
    <nr-checkbox
      ?checked="${args.checked}"
      ?disabled="${args.disabled}"
      ?indeterminate="${args.indeterminate}"
      value="${args.value}"
      name="${args.name}"
    >
      ${args.label}
    </nr-checkbox>
  `,
};

// Size variations
export const SmallSize: Story = {
  args: {
    size: 'small',
    label: 'Small Checkbox',
  },
  render: (args) => html`
    <nr-checkbox
      size="${args.size}"
      ?checked="${args.checked}"
      ?disabled="${args.disabled}"
      ?indeterminate="${args.indeterminate}"
      value="${args.value}"
      name="${args.name}"
    >
      ${args.label}
    </nr-checkbox>
  `,
};

export const MediumSize: Story = {
  args: {
    size: 'medium',
    label: 'Medium Checkbox (Default)',
  },
  render: (args) => html`
    <nr-checkbox
      size="${args.size}"
      ?checked="${args.checked}"
      ?disabled="${args.disabled}"
      ?indeterminate="${args.indeterminate}"
      value="${args.value}"
      name="${args.name}"
    >
      ${args.label}
    </nr-checkbox>
  `,
};

export const LargeSize: Story = {
  args: {
    size: 'large',
    label: 'Large Checkbox',
  },
  render: (args) => html`
    <nr-checkbox
      size="${args.size}"
      ?checked="${args.checked}"
      ?disabled="${args.disabled}"
      ?indeterminate="${args.indeterminate}"
      value="${args.value}"
      name="${args.name}"
    >
      ${args.label}
    </nr-checkbox>
  `,
};

// Combined states
export const DisabledIndeterminate: Story = {
  args: {
    disabled: true,
    indeterminate: true,
    label: 'Disabled Indeterminate Checkbox',
  },
  render: (args) => html`
    <nr-checkbox
      ?checked="${args.checked}"
      ?disabled="${args.disabled}"
      ?indeterminate="${args.indeterminate}"
      value="${args.value}"
      name="${args.name}"
    >
      ${args.label}
    </nr-checkbox>
  `,
};

// Form attributes
export const WithFormAttributes: Story = {
  args: {
    name: 'terms',
    value: 'accepted',
    required: true,
    label: 'I accept the terms and conditions (Required)',
  },
  render: (args) => html`
    <form style="display: flex; flex-direction: column; gap: 1rem;">
      <nr-checkbox
        ?checked="${args.checked}"
        ?disabled="${args.disabled}"
        ?indeterminate="${args.indeterminate}"
        ?required="${args.required}"
        name="${args.name}"
        value="${args.value}"
      >
        ${args.label}
      </nr-checkbox>
      <button type="submit" style="align-self: flex-start;">Submit</button>
    </form>
  `,
};

// AutoFocus
export const WithAutoFocus: Story = {
  args: {
    autoFocus: true,
    label: 'Auto-focused Checkbox',
  },
  render: (args) => html`
    <nr-checkbox
      ?checked="${args.checked}"
      ?disabled="${args.disabled}"
      ?indeterminate="${args.indeterminate}"
      ?autoFocus="${args.autoFocus}"
      value="${args.value}"
      name="${args.name}"
    >
      ${args.label}
    </nr-checkbox>
  `,
};

// Custom title and id
export const WithCustomAttributes: Story = {
  args: {
    id: 'custom-checkbox',
    title: 'This is a custom tooltip title',
    label: 'Checkbox with custom ID and title',
  },
  render: (args) => html`
    <nr-checkbox
      id="${args.id}"
      title="${args.title}"
      ?checked="${args.checked}"
      ?disabled="${args.disabled}"
      ?indeterminate="${args.indeterminate}"
      value="${args.value}"
      name="${args.name}"
    >
      ${args.label}
    </nr-checkbox>
  `,
};

// All sizes comparison
export const SizesComparison: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <h3>Size Comparison</h3>
      <div style="display: flex; align-items: center; gap: 2rem;">
        <nr-checkbox size="small" checked>Small</nr-checkbox>
        <nr-checkbox size="medium" checked>Medium (Default)</nr-checkbox>
        <nr-checkbox size="large" checked>Large</nr-checkbox>
      </div>
      <div style="display: flex; align-items: center; gap: 2rem;">
        <nr-checkbox size="small" indeterminate>Small</nr-checkbox>
        <nr-checkbox size="medium" indeterminate>Medium</nr-checkbox>
        <nr-checkbox size="large" indeterminate>Large</nr-checkbox>
      </div>
      <div style="display: flex; align-items: center; gap: 2rem;">
        <nr-checkbox size="small" disabled>Small</nr-checkbox>
        <nr-checkbox size="medium" disabled>Medium</nr-checkbox>
        <nr-checkbox size="large" disabled>Large</nr-checkbox>
      </div>
    </div>
  `,
};

// Theme variations (light/dark)
export const ThemeVariations: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 2rem;">
      <div data-theme="light" style="padding: 1rem; background: #ffffff; color: #000000; border: 1px solid #e5e7eb;">
        <h4>Light Theme</h4>
        <div style="display: flex; gap: 1rem;">
          <nr-checkbox checked>Checked</nr-checkbox>
          <nr-checkbox indeterminate>Indeterminate</nr-checkbox>
          <nr-checkbox>Unchecked</nr-checkbox>
          <nr-checkbox disabled checked>Disabled</nr-checkbox>
        </div>
      </div>
      <div data-theme="dark" style="padding: 1rem; background: #1f2937; color: #ffffff; border: 1px solid #374151;">
        <h4>Dark Theme</h4>
        <div style="display: flex; gap: 1rem;">
          <nr-checkbox checked>Checked</nr-checkbox>
          <nr-checkbox indeterminate>Indeterminate</nr-checkbox>
          <nr-checkbox>Unchecked</nr-checkbox>
          <nr-checkbox disabled checked>Disabled</nr-checkbox>
        </div>
      </div>
    </div>
  `,
};

export const CheckboxGroup: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <h3>Select your preferences:</h3>
      <nr-checkbox name="notifications" value="email">Email notifications</nr-checkbox>
      <nr-checkbox name="notifications" value="sms" checked>SMS notifications</nr-checkbox>
      <nr-checkbox name="notifications" value="push">Push notifications</nr-checkbox>
      <nr-checkbox name="notifications" value="newsletter" indeterminate>Newsletter subscription</nr-checkbox>
    </div>
  `,
};

// Interactive demo with event handling
export const InteractiveDemo: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <h3>Interactive Checkbox Demo</h3>
      <nr-checkbox 
        @nr-change=${(e: Event) => {
          const target = e.target as HTMLInputElement;
          const output = document.getElementById('event-output');
          if (output) {
            output.textContent = `Change event: checked=${target.checked}, value=${target.value}`;
          }
        }}
        @nr-focus=${() => {
          const output = document.getElementById('focus-output');
          if (output) {
            output.textContent = 'Checkbox focused';
          }
        }}
        @nr-blur=${() => {
          const output = document.getElementById('focus-output');
          if (output) {
            output.textContent = 'Checkbox blurred';
          }
        }}
        name="interactive"
        value="demo"
      >
        Click me to trigger events
      </nr-checkbox>
      <div style="padding: 0.5rem; background: #f3f4f6; border-radius: 4px;">
        <p><strong>Change events:</strong> <span id="event-output">No events yet</span></p>
        <p><strong>Focus events:</strong> <span id="focus-output">No focus events yet</span></p>
      </div>
    </div>
  `,
};