import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../dist/components/checkbox/index.js';

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
  },
  args: {
    checked: false,
    disabled: false,
    indeterminate: false,
    value: 'checkbox-value',
    name: 'checkbox-name',
    label: 'Checkbox Label',
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
