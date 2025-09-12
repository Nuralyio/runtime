import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { action } from '@storybook/addon-actions';
import '../../dist/components/button/index.js';
import '../../dist/components/icon/index.js';

const meta: Meta = {
  title: 'Components/Button/Carbon Design System',
  component: 'nr-button',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Button component following Carbon Design System specifications with proper colors, sizing, and interaction patterns.'
      }
    }
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'danger', 'danger-tertiary', 'ghost'],
      description: 'Button variant following Carbon Design System'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Button size following Carbon scale'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button'
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state'
    },
    block: {
      control: 'boolean',
      description: 'Make button full width'
    },
    icon: {
      control: 'object',
      description: 'Icon array (max 2 icons)'
    },
    iconPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Icon position relative to text'
    }
  },
};

export default meta;
type Story = StoryObj;

/**
 * Carbon Design System Button Variants
 * Showcase of all button variants following Carbon specifications
 */
export const CarbonVariants: Story = {
  render: () => {
    const handleClick = action('button-clicked');

    return html`
      <div style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
        <h2 style="margin-bottom: 2rem; color: #393939;">Carbon Design System Button Variants</h2>
        
        <!-- Primary Buttons -->
        <div style="margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1rem; color: #525252;">Primary Buttons</h3>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
            <nr-button type="primary" @button-clicked="${handleClick}">Primary</nr-button>
            <nr-button type="primary" icon='["add"]' @button-clicked="${handleClick}">Add item</nr-button>
            <nr-button type="primary" loading @button-clicked="${handleClick}">Loading</nr-button>
            <nr-button type="primary" disabled @button-clicked="${handleClick}">Disabled</nr-button>
          </div>
        </div>

        <!-- Secondary Buttons -->
        <div style="margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1rem; color: #525252;">Secondary Buttons</h3>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
            <nr-button type="secondary" @button-clicked="${handleClick}">Secondary</nr-button>
            <nr-button type="secondary" icon='["edit"]' @button-clicked="${handleClick}">Edit</nr-button>
            <nr-button type="secondary" loading @button-clicked="${handleClick}">Loading</nr-button>
            <nr-button type="secondary" disabled @button-clicked="${handleClick}">Disabled</nr-button>
          </div>
        </div>

        <!-- Tertiary/Ghost Buttons -->
        <div style="margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1rem; color: #525252;">Tertiary Buttons</h3>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
            <nr-button type="tertiary" @button-clicked="${handleClick}">Tertiary</nr-button>
            <nr-button type="ghost" @button-clicked="${handleClick}">Ghost (alias)</nr-button>
            <nr-button type="tertiary" icon='["download"]' @button-clicked="${handleClick}">Download</nr-button>
            <nr-button type="tertiary" disabled @button-clicked="${handleClick}">Disabled</nr-button>
          </div>
        </div>

        <!-- Danger Buttons -->
        <div style="margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1rem; color: #525252;">Danger Buttons</h3>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
            <nr-button type="danger" @button-clicked="${handleClick}">Delete</nr-button>
            <nr-button type="danger-tertiary" @button-clicked="${handleClick}">Delete (outline)</nr-button>
            <nr-button type="danger" icon='["trash"]' @button-clicked="${handleClick}">Remove</nr-button>
            <nr-button type="danger" disabled @button-clicked="${handleClick}">Disabled</nr-button>
          </div>
        </div>

        <!-- Button Sizes -->
        <div style="margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1rem; color: #525252;">Button Sizes</h3>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: end;">
            <nr-button type="primary" size="sm" @button-clicked="${handleClick}">Small (32px)</nr-button>
            <nr-button type="primary" size="md" @button-clicked="${handleClick}">Medium (40px)</nr-button>
            <nr-button type="primary" size="lg" @button-clicked="${handleClick}">Large (48px)</nr-button>
            <nr-button type="primary" size="xl" @button-clicked="${handleClick}">Extra Large (64px)</nr-button>
          </div>
        </div>

        <!-- Icon Positioning -->
        <div style="margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1rem; color: #525252;">Icon Positioning</h3>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
            <nr-button type="primary" icon='["arrow-left"]' @button-clicked="${handleClick}">Previous</nr-button>
            <nr-button type="primary" icon='["arrow-right"]' iconPosition="right" @button-clicked="${handleClick}">Next</nr-button>
            <nr-button type="secondary" icon='["save"]' @button-clicked="${handleClick}">Save</nr-button>
            <nr-button type="tertiary" icon='["external-link"]' iconPosition="right" @button-clicked="${handleClick}">Open link</nr-button>
          </div>
        </div>

        <!-- Full Width Buttons -->
        <div style="margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1rem; color: #525252;">Full Width Buttons</h3>
          <div style="display: flex; flex-direction: column; gap: 0.5rem; max-width: 400px;">
            <nr-button type="primary" block @button-clicked="${handleClick}">Primary full width</nr-button>
            <nr-button type="secondary" block @button-clicked="${handleClick}">Secondary full width</nr-button>
            <nr-button type="tertiary" block @button-clicked="${handleClick}">Tertiary full width</nr-button>
          </div>
        </div>

        <!-- Interactive Demo -->
        <div style="margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1rem; color: #525252;">Interactive Demo</h3>
          <div style="padding: 1rem; border: 1px solid #e5e5e5; border-radius: 4px; background: #f4f4f4;">
            <p style="margin-bottom: 1rem; color: #525252;">Try hovering, focusing, and clicking these buttons to see Carbon's interaction patterns:</p>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
              <nr-button type="primary" @button-clicked="${handleClick}">Hover me</nr-button>
              <nr-button type="secondary" @button-clicked="${handleClick}">Focus me</nr-button>
              <nr-button type="tertiary" @button-clicked="${handleClick}">Click me</nr-button>
              <nr-button type="danger" @button-clicked="${handleClick}">Danger action</nr-button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};

/**
 * Carbon Color Comparison
 * Shows the exact Carbon Design System colors being used
 */
export const CarbonColors: Story = {
  render: () => html`
    <div style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
      <h2 style="margin-bottom: 2rem; color: #393939;">Carbon Design System Colors</h2>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
        <!-- Primary Color -->
        <div style="padding: 1rem; border: 1px solid #e5e5e5; border-radius: 4px;">
          <h4 style="margin-bottom: 0.5rem; color: #393939;">Primary (Blue 60)</h4>
          <div style="width: 100%; height: 40px; background: #0f62fe; border-radius: 4px; margin-bottom: 0.5rem;"></div>
          <code style="font-size: 12px; color: #525252;">#0f62fe</code>
        </div>

        <!-- Secondary Color -->
        <div style="padding: 1rem; border: 1px solid #e5e5e5; border-radius: 4px;">
          <h4 style="margin-bottom: 0.5rem; color: #393939;">Secondary (Gray 100)</h4>
          <div style="width: 100%; height: 40px; background: #393939; border-radius: 4px; margin-bottom: 0.5rem;"></div>
          <code style="font-size: 12px; color: #525252;">#393939</code>
        </div>

        <!-- Danger Color -->
        <div style="padding: 1rem; border: 1px solid #e5e5e5; border-radius: 4px;">
          <h4 style="margin-bottom: 0.5rem; color: #393939;">Danger (Red 60)</h4>
          <div style="width: 100%; height: 40px; background: #da1e28; border-radius: 4px; margin-bottom: 0.5rem;"></div>
          <code style="font-size: 12px; color: #525252;">#da1e28</code>
        </div>

        <!-- Disabled Color -->
        <div style="padding: 1rem; border: 1px solid #e5e5e5; border-radius: 4px;">
          <h4 style="margin-bottom: 0.5rem; color: #393939;">Disabled (Gray 40)</h4>
          <div style="width: 100%; height: 40px; background: #c6c6c6; border-radius: 4px; margin-bottom: 0.5rem;"></div>
          <code style="font-size: 12px; color: #525252;">#c6c6c6</code>
        </div>
      </div>

      <div style="margin-top: 2rem;">
        <h3 style="margin-bottom: 1rem; color: #525252;">Button Samples</h3>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
          <nr-button type="primary">Primary Blue</nr-button>
          <nr-button type="secondary">Secondary Gray</nr-button>
          <nr-button type="tertiary">Tertiary/Ghost</nr-button>
          <nr-button type="danger">Danger Red</nr-button>
          <nr-button type="primary" disabled>Disabled</nr-button>
        </div>
      </div>
    </div>
  `
};

/**
 * Button with all sizes to demonstrate Carbon's sizing scale
 */
export const CarbonSizing: Story = {
  render: () => html`
    <div style="max-width: 800px; margin: 0 auto; padding: 2rem;">
      <h2 style="margin-bottom: 2rem; color: #393939;">Carbon Design System Button Sizing</h2>
      
      <div style="display: flex; flex-direction: column; gap: 1rem; align-items: start;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <nr-button type="primary" size="sm">Small (32px)</nr-button>
          <code style="color: #525252;">height: 2rem (32px)</code>
        </div>
        
        <div style="display: flex; align-items: center; gap: 1rem;">
          <nr-button type="primary" size="md">Medium (40px)</nr-button>
          <code style="color: #525252;">height: 2.5rem (40px)</code>
        </div>
        
        <div style="display: flex; align-items: center; gap: 1rem;">
          <nr-button type="primary" size="lg">Large (48px)</nr-button>
          <code style="color: #525252;">height: 3rem (48px) - Default</code>
        </div>
        
        <div style="display: flex; align-items: center; gap: 1rem;">
          <nr-button type="primary" size="xl">Extra Large (64px)</nr-button>
          <code style="color: #525252;">height: 4rem (64px)</code>
        </div>
      </div>
      
      <div style="margin-top: 2rem; padding: 1rem; background: #f4f4f4; border-radius: 4px;">
        <h4 style="margin-bottom: 0.5rem; color: #393939;">Typography Scale</h4>
        <p style="color: #525252; margin: 0;">All sizes use 14px (0.875rem) font size following Carbon's body-compact-01 type token.</p>
      </div>
    </div>
  `
};
