import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../shared/themes/default/index.css';
import '../../shared/themes/carbon/index.css';
import '../../shared/themes/polaris/index.css';
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

// Theme demonstration stories
export const DefaultTheme: Story = {
  render: () => html`
    <div data-theme="default" style="padding: 2rem; background: var(--color-background-primary); min-height: 300px;">
      <h3 style="color: var(--color-text-primary); margin-bottom: 1rem;">Default Theme</h3>
      <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; margin-bottom: 2rem;">
        <nr-button>Default</nr-button>
        <nr-button type="primary">Primary</nr-button>
        <nr-button type="secondary">Secondary</nr-button>
        <nr-button type="ghost">Ghost</nr-button>
        <nr-button type="danger">Danger</nr-button>
        <nr-button type="text">Text</nr-button>
      </div>
      
      <div style="margin-top: 2rem;">
        <button 
          onclick="this.parentElement.parentElement.setAttribute('data-theme', this.parentElement.parentElement.getAttribute('data-theme') === 'default-light' ? 'default-dark' : 'default-light')"
          style="padding: 0.5rem 1rem; background: var(--color-primary); color: var(--color-primary-contrast); border: none; border-radius: 4px; cursor: pointer;"
        >
          Toggle Light/Dark
        </button>
      </div>
    </div>
  `,
};

export const CarbonTheme: Story = {
  render: () => html`
    <div data-theme="carbon-light" style="padding: 2rem; background: var(--color-background-primary); min-height: 300px;">
      <h3 style="color: var(--color-text-primary); margin-bottom: 1rem;">Carbon Theme</h3>
      <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; margin-bottom: 2rem;">
        <nr-button>Default</nr-button>
        <nr-button type="primary">Primary</nr-button>
        <nr-button type="secondary">Secondary</nr-button>
        <nr-button type="ghost">Ghost</nr-button>
        <nr-button type="danger">Danger</nr-button>
        <nr-button type="text">Text</nr-button>
      </div>
      
      <div style="margin-top: 2rem;">
        <button 
          onclick="this.parentElement.parentElement.setAttribute('data-theme', this.parentElement.parentElement.getAttribute('data-theme') === 'carbon-light' ? 'carbon-dark' : 'carbon-light')"
          style="padding: 0.5rem 1rem; background: var(--color-primary); color: var(--color-primary-contrast); border: none; border-radius: 4px; cursor: pointer;"
        >
          Toggle Light/Dark
        </button>
      </div>
    </div>
  `,
};

export const PolarisTheme: Story = {
  render: () => html`
    <div data-theme="polaris-light" style="padding: 2rem; background: var(--color-background-primary); min-height: 300px;">
      <h3 style="color: var(--color-text-primary); margin-bottom: 1rem;">Polaris Theme</h3>
      <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; margin-bottom: 2rem;">
        <nr-button>Default</nr-button>
        <nr-button type="primary">Primary</nr-button>
        <nr-button type="secondary">Secondary</nr-button>
        <nr-button type="ghost">Ghost</nr-button>
        <nr-button type="danger">Danger</nr-button>
        <nr-button type="text">Text</nr-button>
      </div>
      
      <div style="margin-top: 2rem;">
        <button 
          onclick="this.parentElement.parentElement.setAttribute('data-theme', this.parentElement.parentElement.getAttribute('data-theme') === 'polaris-light' ? 'polaris-dark' : 'polaris-light')"
          style="padding: 0.5rem 1rem; background: var(--color-primary); color: var(--color-primary-contrast); border: none; border-radius: 4px; cursor: pointer;"
        >
          Toggle Light/Dark
        </button>
      </div>
    </div>
  `,
};

export const ThemeComparison: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2rem; padding: 1rem;">
      <!-- Default Theme -->
      <div data-theme="default-light" style="padding: 1.5rem; background: var(--color-background-primary); border: 1px solid var(--color-border-primary); border-radius: 8px;">
        <h4 style="color: var(--color-text-primary); margin-bottom: 1rem; text-align: center;">Default</h4>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <nr-button type="primary" size="small">Primary</nr-button>
          <nr-button type="secondary" size="small">Secondary</nr-button>
          <nr-button type="ghost" size="small">Ghost</nr-button>
        </div>
      </div>
      
      <!-- Carbon Theme -->
      <div data-theme="carbon-light" style="padding: 1.5rem; background: var(--color-background-primary); border: 1px solid var(--color-border-primary); border-radius: 8px;">
        <h4 style="color: var(--color-text-primary); margin-bottom: 1rem; text-align: center;">Carbon</h4>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <nr-button type="primary" size="small">Primary</nr-button>
          <nr-button type="secondary" size="small">Secondary</nr-button>
          <nr-button type="ghost" size="small">Ghost</nr-button>
        </div>
      </div>
      
      <!-- Polaris Theme -->
      <div data-theme="polaris-light" style="padding: 1.5rem; background: var(--color-background-primary); border: 1px solid var(--color-border-primary); border-radius: 8px;">
        <h4 style="color: var(--color-text-primary); margin-bottom: 1rem; text-align: center;">Polaris</h4>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <nr-button type="primary" size="small">Primary</nr-button>
          <nr-button type="secondary" size="small">Secondary</nr-button>
          <nr-button type="ghost" size="small">Ghost</nr-button>
        </div>
      </div>
    </div>
  `,
};

export const DarkModeComparison: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2rem; padding: 1rem;">
      <!-- Default Dark Theme -->
      <div data-theme="default-dark" style="padding: 1.5rem; background: var(--color-background-primary); border: 1px solid var(--color-border-primary); border-radius: 8px;">
        <h4 style="color: var(--color-text-primary); margin-bottom: 1rem; text-align: center;">Default Dark</h4>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <nr-button type="primary" size="small">Primary</nr-button>
          <nr-button type="secondary" size="small">Secondary</nr-button>
          <nr-button type="ghost" size="small">Ghost</nr-button>
        </div>
      </div>
      
      <!-- Carbon Dark Theme -->
      <div data-theme="carbon-dark" style="padding: 1.5rem; background: var(--color-background-primary); border: 1px solid var(--color-border-primary); border-radius: 8px;">
        <h4 style="color: var(--color-text-primary); margin-bottom: 1rem; text-align: center;">Carbon Dark</h4>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <nr-button type="primary" size="small">Primary</nr-button>
          <nr-button type="secondary" size="small">Secondary</nr-button>
          <nr-button type="ghost" size="small">Ghost</nr-button>
        </div>
      </div>
      
      <!-- Polaris Dark Theme -->
      <div data-theme="polaris-dark" style="padding: 1.5rem; background: var(--color-background-primary); border: 1px solid var(--color-border-primary); border-radius: 8px;">
        <h4 style="color: var(--color-text-primary); margin-bottom: 1rem; text-align: center;">Polaris Dark</h4>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <nr-button type="primary" size="small">Primary</nr-button>
          <nr-button type="secondary" size="small">Secondary</nr-button>
          <nr-button type="ghost" size="small">Ghost</nr-button>
        </div>
      </div>
    </div>
  `,
};

export const InteractiveThemeSwitcher: Story = {
  render: () => html`
    <div id="theme-demo" data-theme="default-light" style="padding: 2rem; background: var(--color-background-primary); min-height: 400px; transition: all 0.3s ease;">
      <div style="margin-bottom: 2rem;">
        <h3 style="color: var(--color-text-primary); margin-bottom: 1rem;">Interactive Theme Switcher</h3>
        
        <!-- Theme Selection -->
        <div style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
          <button onclick="document.getElementById('theme-demo').setAttribute('data-theme', 'default-light')" 
                  style="padding: 0.5rem 1rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Default Light
          </button>
          <button onclick="document.getElementById('theme-demo').setAttribute('data-theme', 'default-dark')" 
                  style="padding: 0.5rem 1rem; background: #1a1a1a; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Default Dark
          </button>
          <button onclick="document.getElementById('theme-demo').setAttribute('data-theme', 'carbon-light')" 
                  style="padding: 0.5rem 1rem; background: #0f62fe; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Carbon Light
          </button>
          <button onclick="document.getElementById('theme-demo').setAttribute('data-theme', 'carbon-dark')" 
                  style="padding: 0.5rem 1rem; background: #161616; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Carbon Dark
          </button>
          <button onclick="document.getElementById('theme-demo').setAttribute('data-theme', 'polaris-light')" 
                  style="padding: 0.5rem 1rem; background: #008060; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Polaris Light
          </button>
          <button onclick="document.getElementById('theme-demo').setAttribute('data-theme', 'polaris-dark')" 
                  style="padding: 0.5rem 1rem; background: #202020; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Polaris Dark
          </button>
        </div>
      </div>
      
      <!-- Button Showcase -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
        <nr-button type="primary">Primary</nr-button>
        <nr-button type="secondary">Secondary</nr-button>
        <nr-button type="ghost">Ghost</nr-button>
        <nr-button type="danger">Danger</nr-button>
        <nr-button type="text">Text</nr-button>
        <nr-button type="link" href="#">Link</nr-button>
      </div>
      
      <!-- Different Sizes -->
      <div style="margin-top: 2rem;">
        <h4 style="color: var(--color-text-primary); margin-bottom: 1rem;">Sizes</h4>
        <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
          <nr-button type="primary" size="small">Small</nr-button>
          <nr-button type="primary" size="medium">Medium</nr-button>
          <nr-button type="primary" size="large">Large</nr-button>
        </div>
      </div>
      
      <!-- States -->
      <div style="margin-top: 2rem;">
        <h4 style="color: var(--color-text-primary); margin-bottom: 1rem;">States</h4>
        <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
          <nr-button type="primary">Normal</nr-button>
          <nr-button type="primary" loading>Loading</nr-button>
          <nr-button type="primary" disabled>Disabled</nr-button>
        </div>
      </div>
    </div>
  `,
};
