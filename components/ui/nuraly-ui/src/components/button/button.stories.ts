import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './index.js';
import '../icon/index.js';

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
      options: ['primary', 'secondary', 'ghost', 'danger', 'text', 'link', 'default'],
      description: 'Button type/variant',
    },
    shape: {
      control: { type: 'select' },
      options: ['default', 'circle', 'round'],
      description: 'Button shape',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable the button',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Show loading state',
    },
    block: {
      control: { type: 'boolean' },
      description: 'Make button full width',
    },
    href: {
      control: { type: 'text' },
      description: 'Link URL (for link buttons)',
    },
    target: {
      control: { type: 'select' },
      options: ['_self', '_blank', '_parent', '_top'],
      description: 'Link target',
    },
    ripple: {
      control: { type: 'boolean' },
      description: 'Enable ripple effect on click',
    },
    slot: {
      control: { type: 'text' },
      description: 'Button text content',
    },
  },
  args: {
    size: 'medium',
    type: 'default',
    shape: 'default',
    disabled: false,
    loading: false,
    block: false,
    ripple: true,
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
      shape="${args.shape}"
      ?disabled="${args.disabled}"
      ?loading="${args.loading}"
      ?block="${args.block}"
      ?ripple="${args.ripple}"
      href="${args.href || ''}"
      target="${args.target || ''}"
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
      shape="${args.shape}"
      ?disabled="${args.disabled}"
      ?loading="${args.loading}"
      ?block="${args.block}"
      ?ripple="${args.ripple}"
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
    <nr-button type="secondary">${args.slot}</nr-button>
  `,
};

export const AllVariants: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
      <nr-button>Default</nr-button>
      <nr-button type="primary">Primary</nr-button>
      <nr-button type="secondary">Secondary</nr-button>
      <nr-button type="ghost">Ghost</nr-button>
      <nr-button type="danger">Danger</nr-button>
      <nr-button type="text">Text</nr-button>
      <nr-button type="link" href="#">Link</nr-button>
    </div>
  `,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
      <nr-button type="primary" size="small">Small</nr-button>
      <nr-button type="primary" size="medium">Medium</nr-button>
      <nr-button type="primary" size="large">Large</nr-button>
    </div>
  `,
};

export const WithIcons: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
      <nr-button type="primary" .icon="${['home']}">Home</nr-button>
      <nr-button type="secondary" .icon="${['search']}">Search</nr-button>
      <nr-button type="ghost" .icon="${['settings']}">Settings</nr-button>
      <nr-button .icon="${['download']}" iconPosition="right">Download</nr-button>
    </div>
  `,
};

export const LoadingStates: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
      <nr-button loading>Loading</nr-button>
      <nr-button type="primary" loading>Primary Loading</nr-button>
      <nr-button type="secondary" loading>Secondary Loading</nr-button>
      <nr-button type="ghost" loading>Ghost Loading</nr-button>
    </div>
  `,
};

export const DisabledStates: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
      <nr-button disabled>Disabled</nr-button>
      <nr-button type="primary" disabled>Primary Disabled</nr-button>
      <nr-button type="secondary" disabled>Secondary Disabled</nr-button>
      <nr-button type="text" disabled>Text Disabled</nr-button>
      <nr-button type="link" disabled href="#">Link Disabled</nr-button>
    </div>
  `,
};
