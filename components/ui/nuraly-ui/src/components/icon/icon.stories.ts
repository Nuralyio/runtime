import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './index.js';

const meta: Meta = {
  title: 'General/Icon',
  component: 'nr-icon',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: { type: 'text' },
      description: 'The Lucide icon name',
    },
    type: {
      control: { type: 'select' },
      options: ['solid', 'regular'],
      description: 'The icon type (solid or regular)',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large', 'xlarge', 'xxlarge'],
      description: 'Icon size (small, medium, large, xlarge, xxlarge)',
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
    name: 'mail',
    type: 'solid',
    size: 'medium',
    alt: '',
    clickable: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    name: 'mail',
  },
  render: (args: any) => html`
    <nr-icon
      name="${args.name}"
      type="${args.type}"
      size="${args.size}"
      alt="${args.alt}"
      ?clickable="${args.clickable}"
      ?disabled="${args.disabled}"
    ></nr-icon>
  `,
};

export const CommonIcons: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; text-align: center;">
      <div>
        <nr-icon name="home" size="xlarge"></nr-icon>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">home</p>
      </div>
      <div>
        <nr-icon name="user" size="xlarge"></nr-icon>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">user</p>
      </div>
      <div>
        <nr-icon name="mail" size="xlarge"></nr-icon>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">mail</p>
      </div>
      <div>
        <nr-icon name="phone" size="xlarge"></nr-icon>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">phone</p>
      </div>
      <div>
        <nr-icon name="search" size="xlarge"></nr-icon>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">search</p>
      </div>
      <div>
        <nr-icon name="settings" size="xlarge"></nr-icon>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">settings</p>
      </div>
      <div>
        <nr-icon name="heart" size="xlarge"></nr-icon>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">heart</p>
      </div>
      <div>
        <nr-icon name="star" size="xlarge"></nr-icon>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">star</p>
      </div>
    </div>
  `,
};

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 2rem; align-items: center; flex-wrap: wrap;">
      <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
        <nr-icon name="star" size="small"></nr-icon>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">Small (16px)</p>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
        <nr-icon name="star" size="medium"></nr-icon>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">Medium (20px)</p>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
        <nr-icon name="star" size="large"></nr-icon>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">Large (24px)</p>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
        <nr-icon name="star" size="xlarge"></nr-icon>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">XLarge (32px)</p>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
        <nr-icon name="star" size="xxlarge"></nr-icon>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">XXLarge (40px)</p>
      </div>
    </div>
  `,
};

export const IconTypes: Story = {
  render: () => html`
    <div style="display: flex; gap: 2rem; align-items: center;">
      <div style="text-align: center;">
        <nr-icon name="heart" type="solid" size="xxlarge" color="#e74c3c"></nr-icon>
        <p style="margin: 0.5rem 0 0 0;">Solid</p>
      </div>
      <div style="text-align: center;">
        <nr-icon name="heart" type="regular" size="xxlarge" color="#e74c3c"></nr-icon>
        <p style="margin: 0.5rem 0 0 0;">Regular</p>
      </div>
    </div>
  `,
};

export const ClickableIcons: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center;">
      <nr-icon name="edit" clickable size="large"></nr-icon>
      <nr-icon name="trash-2" clickable size="large" color="#e74c3c"></nr-icon>
      <nr-icon name="download" clickable size="large" color="#27ae60"></nr-icon>
      <nr-icon name="settings" clickable disabled size="large"></nr-icon>
    </div>
  `,
};
