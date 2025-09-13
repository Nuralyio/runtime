import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './index.js';

const meta: Meta = {
  title: 'Components/Icon',
  component: 'hy-icon',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: { type: 'text' },
      description: 'The FontAwesome icon name',
    },
    type: {
      control: { type: 'select' },
      options: ['solid', 'regular'],
      description: 'The icon type (solid or regular)',
    },
    alt: {
      control: { type: 'text' },
      description: 'Alternative text for accessibility',
    },
    clickable: {
      control: { type: 'boolean' },
      description: 'Makes the icon clickable and focusable',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disables the icon when clickable is true',
    },
  },
  args: {
    name: 'envelope',
    type: 'solid',
    alt: '',
    clickable: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    name: 'envelope',
  },
  render: (args: any) => html`
    <hy-icon
      name="${args.name}"
      type="${args.type}"
      alt="${args.alt}"
      ?clickable="${args.clickable}"
      ?disabled="${args.disabled}"
    ></hy-icon>
  `,
};

export const CommonIcons: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; text-align: center;">
      <div>
        <hy-icon name="home" style="font-size: 2rem;"></hy-icon>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">home</p>
      </div>
      <div>
        <hy-icon name="user" style="font-size: 2rem;"></hy-icon>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">user</p>
      </div>
      <div>
        <hy-icon name="envelope" style="font-size: 2rem;"></hy-icon>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">envelope</p>
      </div>
      <div>
        <hy-icon name="phone" style="font-size: 2rem;"></hy-icon>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">phone</p>
      </div>
      <div>
        <hy-icon name="search" style="font-size: 2rem;"></hy-icon>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">search</p>
      </div>
      <div>
        <hy-icon name="settings" style="font-size: 2rem;"></hy-icon>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">settings</p>
      </div>
      <div>
        <hy-icon name="heart" style="font-size: 2rem;"></hy-icon>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">heart</p>
      </div>
      <div>
        <hy-icon name="star" style="font-size: 2rem;"></hy-icon>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">star</p>
      </div>
    </div>
  `,
};

export const IconTypes: Story = {
  render: () => html`
    <div style="display: flex; gap: 2rem; align-items: center;">
      <div style="text-align: center;">
        <hy-icon name="heart" type="solid" style="font-size: 3rem; color: #e74c3c;"></hy-icon>
        <p style="margin: 0.5rem 0 0 0;">Solid</p>
      </div>
      <div style="text-align: center;">
        <hy-icon name="heart" type="regular" style="font-size: 3rem; color: #e74c3c;"></hy-icon>
        <p style="margin: 0.5rem 0 0 0;">Regular</p>
      </div>
    </div>
  `,
};

export const ClickableIcons: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center;">
      <hy-icon name="edit" clickable style="font-size: 1.5rem; cursor: pointer;"></hy-icon>
      <hy-icon name="trash" clickable style="font-size: 1.5rem; cursor: pointer; color: #e74c3c;"></hy-icon>
      <hy-icon name="download" clickable style="font-size: 1.5rem; cursor: pointer; color: #27ae60;"></hy-icon>
      <hy-icon name="settings" clickable disabled style="font-size: 1.5rem; opacity: 0.5;"></hy-icon>
    </div>
  `,
};
