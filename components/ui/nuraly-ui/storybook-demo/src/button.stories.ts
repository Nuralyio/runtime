import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../dist/components/button/index.js';

const meta: Meta = {
  title: 'Components/Button',
  component: 'nr-button',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Button size',
    },
    type: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost', 'danger', 'default'],
      description: 'Button type/variant',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable the button',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Show loading state',
    },
    slot: {
      control: { type: 'text' },
      description: 'Button text content',
    },
  },
  args: {
    size: 'medium',
    type: 'default',
    disabled: false,
    loading: false,
    slot: 'Button Text',
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    slot: 'Default Button',
  },
  render: (args) => html`
    <nr-button
      size="${args.size}"
      type="${args.type}"
      ?disabled="${args.disabled}"
      ?loading="${args.loading}"
    >
      ${args.slot}
    </nr-button>
  `,
};

export const Primary: Story = {
  args: {
    type: 'primary',
    slot: 'Primary Button',
  },
  render: (args) => html`
    <nr-button
      size="${args.size}"
      type="${args.type}"
      ?disabled="${args.disabled}"
      ?loading="${args.loading}"
    >
      ${args.slot}
    </nr-button>
  `,
};

export const Secondary: Story = {
  args: {
    type: 'secondary',
    slot: 'Secondary Button',
  },
  render: (args) => html`
    <nr-button
      size="${args.size}"
      type="${args.type}"
      ?disabled="${args.disabled}"
      ?loading="${args.loading}"
    >
      ${args.slot}
    </nr-button>
  `,
};

export const Ghost: Story = {
  args: {
    type: 'ghost',
    slot: 'Ghost Button',
  },
  render: (args) => html`
    <nr-button
      size="${args.size}"
      type="${args.type}"
      ?disabled="${args.disabled}"
      ?loading="${args.loading}"
    >
      ${args.slot}
    </nr-button>
  `,
};

export const Danger: Story = {
  args: {
    type: 'danger',
    slot: 'Danger Button',
  },
  render: (args) => html`
    <nr-button
      size="${args.size}"
      type="${args.type}"
      ?disabled="${args.disabled}"
      ?loading="${args.loading}"
    >
      ${args.slot}
    </nr-button>
  `,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center;">
      <nr-button size="small">Small</nr-button>
      <nr-button size="medium">Medium</nr-button>
      <nr-button size="large">Large</nr-button>
    </div>
  `,
};

export const WithIcons: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center; flex-direction: column;">
      <div style="display: flex; gap: 1rem; align-items: center;">
        <nr-button .icon="${['search']}">Search</nr-button>
        <nr-button .icon="${['plus']}">Add</nr-button>
        <nr-button .icon="${['download']}">Download</nr-button>
      </div>
      <div style="display: flex; gap: 1rem; align-items: center;">
        <nr-button .icon="${['search']}" size="small"></nr-button>
        <nr-button .icon="${['plus']}" size="medium"></nr-button>
        <nr-button .icon="${['download']}" size="large"></nr-button>
      </div>
    </div>
  `,
};

export const LoadingStates: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center;">
      <nr-button loading>Loading...</nr-button>
      <nr-button type="primary" loading>Primary Loading</nr-button>
      <nr-button type="secondary" loading>Secondary Loading</nr-button>
    </div>
  `,
};

export const DisabledStates: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center;">
      <nr-button disabled>Disabled</nr-button>
      <nr-button type="primary" disabled>Primary Disabled</nr-button>
      <nr-button type="secondary" disabled>Secondary Disabled</nr-button>
    </div>
  `,
};
