import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../dist/components/icon/index.js';
import '../../dist/components/input/index.js';

const meta: Meta = {
  title: 'Components/Input',
  component: 'nr-input',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'password', 'email', 'number', 'tel', 'url', 'search'],
      description: 'Input type',
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text',
    },
    label: {
      control: { type: 'text' },
      description: 'Label text',
    },
    value: {
      control: { type: 'text' },
      description: 'Input value',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the input is disabled',
    },
    readonly: {
      control: { type: 'boolean' },
      description: 'Whether the input is readonly',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether the input is required',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Input size',
    },
  },
  args: {
    type: 'text',
    placeholder: 'Enter text...',
    label: 'Input Label',
    value: '',
    disabled: false,
    readonly: false,
    required: false,
    size: 'medium',
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    label: 'Default Input',
    placeholder: 'Type something...',
  },
  render: (args) => html`
    <nr-input
      type="${args.type}"
      placeholder="${args.placeholder}"
      label="${args.label}"
      value="${args.value}"
      size="${args.size}"
      ?disabled="${args.disabled}"
      ?readonly="${args.readonly}"
      ?required="${args.required}"
    ></nr-input>
  `,
};

export const WithValue: Story = {
  args: {
    label: 'Input with Value',
    value: 'Predefined value',
    placeholder: 'Type something...',
  },
  render: (args) => html`
    <nr-input
      type="${args.type}"
      placeholder="${args.placeholder}"
      label="${args.label}"
      value="${args.value}"
      size="${args.size}"
      ?disabled="${args.disabled}"
      ?readonly="${args.readonly}"
      ?required="${args.required}"
    ></nr-input>
  `,
};

export const Password: Story = {
  args: {
    type: 'password',
    label: 'Password',
    placeholder: 'Enter your password',
  },
  render: (args) => html`
    <nr-input
      type="${args.type}"
      placeholder="${args.placeholder}"
      label="${args.label}"
      value="${args.value}"
      size="${args.size}"
      ?disabled="${args.disabled}"
      ?readonly="${args.readonly}"
      ?required="${args.required}"
    ></nr-input>
  `,
};

export const Email: Story = {
  args: {
    type: 'email',
    label: 'Email Address',
    placeholder: 'Enter your email',
    required: true,
  },
  render: (args) => html`
    <nr-input
      type="${args.type}"
      placeholder="${args.placeholder}"
      label="${args.label}"
      value="${args.value}"
      size="${args.size}"
      ?disabled="${args.disabled}"
      ?readonly="${args.readonly}"
      ?required="${args.required}"
    ></nr-input>
  `,
};

export const Number: Story = {
  args: {
    type: 'number',
    label: 'Number Input',
    placeholder: 'Enter a number',
  },
  render: (args) => html`
    <nr-input
      type="${args.type}"
      placeholder="${args.placeholder}"
      label="${args.label}"
      value="${args.value}"
      size="${args.size}"
      ?disabled="${args.disabled}"
      ?readonly="${args.readonly}"
      ?required="${args.required}"
    ></nr-input>
  `,
};

export const Search: Story = {
  args: {
    type: 'search',
    label: 'Search',
    placeholder: 'Search...',
  },
  render: (args) => html`
    <nr-input
      type="${args.type}"
      placeholder="${args.placeholder}"
      label="${args.label}"
      value="${args.value}"
      size="${args.size}"
      ?disabled="${args.disabled}"
      ?readonly="${args.readonly}"
      ?required="${args.required}"
    ></nr-input>
  `,
};

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem; width: 300px;">
      <nr-input size="small" label="Small Input" placeholder="Small size"></nr-input>
      <nr-input size="medium" label="Medium Input" placeholder="Medium size"></nr-input>
      <nr-input size="large" label="Large Input" placeholder="Large size"></nr-input>
    </div>
  `,
};

export const States: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem; width: 300px;">
      <nr-input label="Normal" placeholder="Normal input"></nr-input>
      <nr-input label="Disabled" placeholder="Disabled input" disabled></nr-input>
      <nr-input label="Readonly" value="Readonly value" readonly></nr-input>
      <nr-input label="Required" placeholder="Required input" required></nr-input>
    </div>
  `,
};

export const FormExample: Story = {
  render: () => html`
    <form style="display: flex; flex-direction: column; gap: 1rem; width: 300px; padding: 1rem; border: 1px solid #ccc; border-radius: 8px;">
      <h3>User Registration</h3>
      <nr-input type="text" label="Full Name" placeholder="Enter your full name" required></nr-input>
      <nr-input type="email" label="Email" placeholder="Enter your email" required></nr-input>
      <nr-input type="password" label="Password" placeholder="Create a password" required></nr-input>
      <nr-input type="tel" label="Phone" placeholder="Enter your phone number"></nr-input>
      <nr-input type="url" label="Website" placeholder="Your website URL"></nr-input>
    </form>
  `,
};
