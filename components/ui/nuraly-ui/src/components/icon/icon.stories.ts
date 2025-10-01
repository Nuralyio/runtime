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
      description: 'The FontAwesome icon name',
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
    name: 'envelope',
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
    name: 'envelope',
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
        <nr-icon name="home" style="font-size: 2rem;"></nr-icon>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">home</p>
      </div>
      <div>
        <nr-icon name="user" style="font-size: 2rem;"></nr-icon>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">user</p>
      </div>
      <div>
        <nr-icon name="envelope" style="font-size: 2rem;"></nr-icon>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">envelope</p>
      </div>
      <div>
        <nr-icon name="phone" style="font-size: 2rem;"></nr-icon>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">phone</p>
      </div>
      <div>
        <nr-icon name="search" style="font-size: 2rem;"></nr-icon>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">search</p>
      </div>
      <div>
        <nr-icon name="settings" style="font-size: 2rem;"></nr-icon>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">settings</p>
      </div>
      <div>
        <nr-icon name="heart" style="font-size: 2rem;"></nr-icon>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">heart</p>
      </div>
      <div>
        <nr-icon name="star" style="font-size: 2rem;"></nr-icon>
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
        <nr-icon name="heart" type="solid" style="font-size: 3rem; color: #e74c3c;"></nr-icon>
        <p style="margin: 0.5rem 0 0 0;">Solid</p>
      </div>
      <div style="text-align: center;">
        <nr-icon name="heart" type="regular" style="font-size: 3rem; color: #e74c3c;"></nr-icon>
        <p style="margin: 0.5rem 0 0 0;">Regular</p>
      </div>
    </div>
  `,
};

export const ClickableIcons: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center;">
      <nr-icon name="edit" clickable style="font-size: 1.5rem; cursor: pointer;"></nr-icon>
      <nr-icon name="trash" clickable style="font-size: 1.5rem; cursor: pointer; color: #e74c3c;"></nr-icon>
      <nr-icon name="download" clickable style="font-size: 1.5rem; cursor: pointer; color: #27ae60;"></nr-icon>
      <nr-icon name="settings" clickable disabled style="font-size: 1.5rem; opacity: 0.5;"></nr-icon>
    </div>
  `,
};
