import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './index.js';
import '../../shared/themes/carbon/index.css';
import '../../shared/themes/default/index.css';

const meta: Meta = {
  title: 'Data Display/Tag',
  component: 'nr-tag',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    color: { control: 'text' },
    bordered: { control: 'boolean' },
    size: { control: { type: 'select' }, options: ['default', 'small'] },
    closable: { control: 'boolean' },
    checkable: { control: 'boolean' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () => html`<nr-tag>Tag</nr-tag>`,
};

export const Colors: Story = {
  render: () => html`
    <div style="display:flex; gap:8px; flex-wrap:wrap;">
      ${['magenta','red','volcano','orange','gold','lime','green','cyan','blue','geekblue','purple'].map(c => html`<nr-tag color=${c}>${c}</nr-tag>`)}
      <nr-tag color="#1677ff">custom</nr-tag>
    </div>
  `,
};

export const Closable: Story = {
  render: () => html`<nr-tag closable @nr-tag-close=${() => console.log('closed')}>Closable</nr-tag>`,
};

export const Checkable: Story = {
  render: () => html`
    <nr-tag checkable>Toggle me</nr-tag>
    <nr-tag checkable checked>Checked</nr-tag>
  `,
};

export const Small: Story = {
  render: () => html`<nr-tag size="small">Small</nr-tag>`,
};
