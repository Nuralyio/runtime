import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../dist/components/icon/index.js';
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
      shape="${args.shape}"
      ?disabled="${args.disabled}"
      ?loading="${args.loading}"
      ?block="${args.block}"
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
      shape="${args.shape}"
      ?disabled="${args.disabled}"
      ?loading="${args.loading}"
      ?block="${args.block}"
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
      shape="${args.shape}"
      ?disabled="${args.disabled}"
      ?loading="${args.loading}"
      ?block="${args.block}"
    >
      ${args.slot}
    </nr-button>
  `,
};

export const Text: Story = {
  args: {
    type: 'text',
    slot: 'Text Button',
  },
  render: (args) => html`
    <nr-button
      size="${args.size}"
      type="${args.type}"
      shape="${args.shape}"
      ?disabled="${args.disabled}"
      ?loading="${args.loading}"
      ?block="${args.block}"
    >
      ${args.slot}
    </nr-button>
  `,
};

export const Link: Story = {
  args: {
    type: 'link',
    slot: 'Link Button',
    href: 'https://example.com',
    target: '_blank',
  },
  render: (args) => html`
    <nr-button
      size="${args.size}"
      type="${args.type}"
      shape="${args.shape}"
      ?disabled="${args.disabled}"
      ?loading="${args.loading}"
      ?block="${args.block}"
      href="${args.href || ''}"
      target="${args.target || ''}"
    >
      ${args.slot}
    </nr-button>
  `,
};

export const AllTypes: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
      <nr-button type="default">Default</nr-button>
      <nr-button type="primary">Primary</nr-button>
      <nr-button type="secondary">Secondary</nr-button>
      <nr-button type="ghost">Ghost</nr-button>
      <nr-button type="danger">Danger</nr-button>
      <nr-button type="text">Text</nr-button>
      <nr-button type="link" href="#" target="_self">Link</nr-button>
    </div>
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

export const ButtonShapes: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center;">
      <nr-button shape="default">Default</nr-button>
      <nr-button shape="round">Round</nr-button>
      <nr-button shape="circle" .icon="${['plus']}"></nr-button>
    </div>
  `,
};

export const BlockButtons: Story = {
  render: () => html`
    <div style="width: 300px; display: flex; flex-direction: column; gap: 1rem;">
      <nr-button type="primary" block>Primary Block Button</nr-button>
      <nr-button type="secondary" block>Secondary Block Button</nr-button>
      <nr-button type="danger" block>Danger Block Button</nr-button>
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

export const CircleIcons: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center;">
      <nr-button shape="circle" .icon="${['plus']}" size="small"></nr-button>
      <nr-button shape="circle" .icon="${['plus']}" size="medium"></nr-button>
      <nr-button shape="circle" .icon="${['plus']}" size="large"></nr-button>
    </div>
  `,
};

export const LoadingStates: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
      <nr-button loading>Loading...</nr-button>
      <nr-button type="primary" loading>Primary Loading</nr-button>
      <nr-button type="secondary" loading>Secondary Loading</nr-button>
      <nr-button type="text" loading>Text Loading</nr-button>
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

export const AccessibilityExample: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center; flex-direction: column;">
      <div style="display: flex; gap: 1rem; align-items: center;">
        <nr-button aria-label="Close dialog" .icon="${['times']}" shape="circle"></nr-button>
        <nr-button aria-label="Edit item" .icon="${['edit']}">Edit</nr-button>
        <nr-button aria-label="Delete item" type="danger" .icon="${['trash']}">Delete</nr-button>
      </div>
      <div style="display: flex; gap: 1rem; align-items: center;">
        <nr-button loading aria-label="Processing request">Processing...</nr-button>
        <nr-button disabled aria-label="Action not available">Unavailable</nr-button>
      </div>
    </div>
  `,
};
