import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../dist/components/icon/index.js';

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
  render: (args) => html`
    <hy-icon 
      name="${args.name}"
      type="${args.type}"
      alt="${args.alt || ''}"
      ?clickable="${args.clickable}"
      ?disabled="${args.disabled}">
    </hy-icon>
  `,
};

export const Regular: Story = {
  args: {
    name: 'envelope',
    type: 'regular',
  },
  render: (args) => html`
    <hy-icon 
      name="${args.name}"
      type="${args.type}"
      alt="${args.alt || ''}"
      ?clickable="${args.clickable}"
      ?disabled="${args.disabled}">
    </hy-icon>
  `,
};

export const Clickable: Story = {
  args: {
    name: 'thumbs-up',
    clickable: true,
    alt: 'Like button',
  },
  render: (args) => html`
    <hy-icon 
      name="${args.name}"
      type="${args.type}"
      alt="${args.alt || ''}"
      ?clickable="${args.clickable}"
      ?disabled="${args.disabled}"
      @icon-click="${(e: CustomEvent) => {
        console.log('Icon clicked:', e.detail);
        // Show a visual feedback in Storybook
        const icon = e.target as HTMLElement;
        icon.style.transform = 'scale(1.2)';
        setTimeout(() => {
          icon.style.transform = 'scale(1)';
        }, 150);
      }}">
    </hy-icon>
  `,
};

export const Disabled: Story = {
  args: {
    name: 'bookmark',
    clickable: true,
    disabled: true,
    alt: 'Disabled bookmark button',
  },
  render: (args) => html`
    <hy-icon 
      name="${args.name}"
      type="${args.type}"
      alt="${args.alt || ''}"
      ?clickable="${args.clickable}"
      ?disabled="${args.disabled}">
    </hy-icon>
  `,
};

export const CommonIcons: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A collection of commonly used icons in both solid and regular variants.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; gap: 20px; flex-wrap: wrap; align-items: center;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <hy-icon name="envelope"></hy-icon>
        <small>envelope</small>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <hy-icon name="check"></hy-icon>
        <small>check</small>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <hy-icon name="warning"></hy-icon>
        <small>warning</small>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <hy-icon name="bug"></hy-icon>
        <small>bug</small>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <hy-icon name="heart"></hy-icon>
        <small>heart</small>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <hy-icon name="star"></hy-icon>
        <small>star</small>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <hy-icon name="exclamation-triangle"></hy-icon>
        <small>exclamation-triangle</small>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <hy-icon name="check-circle"></hy-icon>
        <small>check-circle</small>
      </div>
    </div>
  `,
};

export const SolidVsRegular: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Comparison between solid and regular versions of the same icons.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; gap: 30px; flex-wrap: wrap;">
      <div style="display: flex; flex-direction: column; gap: 15px;">
        <h4 style="margin: 0;">Solid Icons</h4>
        <div style="display: flex; gap: 15px; align-items: center;">
          <hy-icon name="envelope" type="solid"></hy-icon>
          <hy-icon name="heart" type="solid"></hy-icon>
          <hy-icon name="star" type="solid"></hy-icon>
          <hy-icon name="bookmark" type="solid"></hy-icon>
          <hy-icon name="user" type="solid"></hy-icon>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 15px;">
        <h4 style="margin: 0;">Regular Icons</h4>
        <div style="display: flex; gap: 15px; align-items: center;">
          <hy-icon name="envelope" type="regular"></hy-icon>
          <hy-icon name="heart" type="regular"></hy-icon>
          <hy-icon name="star" type="regular"></hy-icon>
          <hy-icon name="bookmark" type="regular"></hy-icon>
          <hy-icon name="user" type="regular"></hy-icon>
        </div>
      </div>
    </div>
  `,
};

export const InteractiveIcons: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Interactive icons that can be clicked and provide feedback. Try clicking on them!',
      },
    },
  },
  render: () => html`
    <div style="display: flex; gap: 20px; flex-wrap: wrap; align-items: center;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <hy-icon 
          name="thumbs-up" 
          clickable 
          alt="Like button"
          @icon-click="${(e: CustomEvent) => {
            console.log('Thumbs up clicked:', e.detail);
            const icon = e.target as HTMLElement;
            icon.style.color = '#28a745';
            icon.style.transform = 'scale(1.2)';
            setTimeout(() => {
              icon.style.transform = 'scale(1)';
            }, 150);
          }}">
        </hy-icon>
        <small>Like (clickable)</small>
      </div>
      
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <hy-icon 
          name="heart" 
          clickable 
          alt="Favorite button"
          @icon-click="${(e: CustomEvent) => {
            console.log('Heart clicked:', e.detail);
            const icon = e.target as HTMLElement;
            icon.style.color = '#dc3545';
            icon.style.transform = 'scale(1.2)';
            setTimeout(() => {
              icon.style.transform = 'scale(1)';
            }, 150);
          }}">
        </hy-icon>
        <small>Favorite (clickable)</small>
      </div>
      
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <hy-icon 
          name="share" 
          clickable 
          alt="Share button"
          @icon-click="${(e: CustomEvent) => {
            console.log('Share clicked:', e.detail);
            const icon = e.target as HTMLElement;
            icon.style.color = '#007bff';
            icon.style.transform = 'scale(1.2)';
            setTimeout(() => {
              icon.style.transform = 'scale(1)';
            }, 150);
          }}">
        </hy-icon>
        <small>Share (clickable)</small>
      </div>
      
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <hy-icon 
          name="bookmark" 
          clickable 
          disabled
          alt="Disabled bookmark button">
        </hy-icon>
        <small>Bookmark (disabled)</small>
      </div>
    </div>
    
    <div style="margin-top: 20px; padding: 10px; background: #f8f9fa; border-radius: 4px; font-size: 12px;">
      <strong>Note:</strong> Open the browser console to see click event details. Interactive icons show visual feedback when clicked.
    </div>
  `,
};

export const CustomStyling: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Examples of custom styling using CSS custom properties.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; gap: 30px; flex-wrap: wrap; align-items: center;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <hy-icon 
          name="exclamation-triangle" 
          style="--hybrid-icon-local-color: #dc3545;">
        </hy-icon>
        <small>Custom red color</small>
      </div>
      
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <hy-icon 
          name="star" 
          style="--hybrid-icon-local-width: 32px; --hybrid-icon-local-height: 32px;">
        </hy-icon>
        <small>Custom size (32px)</small>
      </div>
      
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <hy-icon 
          name="check-circle" 
          style="--hybrid-icon-local-width: 24px; --hybrid-icon-local-height: 24px; --hybrid-icon-local-color: #28a745;">
        </hy-icon>
        <small>Custom size + color</small>
      </div>
      
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <hy-icon 
          name="heart" 
          style="--hybrid-icon-local-color: #ff6b6b; transform: rotate(15deg);">
        </hy-icon>
        <small>Rotated + colored</small>
      </div>
    </div>
    
    <div style="margin-top: 20px; padding: 10px; background: #f8f9fa; border-radius: 4px; font-size: 12px;">
      <strong>CSS Custom Properties:</strong><br>
      • <code>--hybrid-icon-local-color</code>: Changes the icon color<br>
      • <code>--hybrid-icon-local-width</code>: Changes the icon width<br>
      • <code>--hybrid-icon-local-height</code>: Changes the icon height
    </div>
  `,
};

export const WithAccessibility: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Examples showing proper accessibility practices with icons.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div style="display: flex; gap: 20px; align-items: center;">
        <span>Decorative icon (no alt text):</span>
        <hy-icon name="star"></hy-icon>
        <span>This is just decoration</span>
      </div>
      
      <div style="display: flex; gap: 20px; align-items: center;">
        <span>Informative icon (with alt text):</span>
        <hy-icon name="exclamation-triangle" alt="Warning"></hy-icon>
        <span>Important message</span>
      </div>
      
      <div style="display: flex; gap: 20px; align-items: center;">
        <span>Interactive icon (with alt text):</span>
        <hy-icon 
          name="trash" 
          clickable 
          alt="Delete item"
          @icon-click="${(e: CustomEvent) => console.log('Delete clicked:', e.detail)}">
        </hy-icon>
        <span>Clickable delete button</span>
      </div>
      
      <div style="display: flex; gap: 20px; align-items: center;">
        <span>Disabled interactive icon:</span>
        <hy-icon 
          name="edit" 
          clickable 
          disabled 
          alt="Edit item (disabled)">
        </hy-icon>
        <span>Edit not available</span>
      </div>
    </div>
    
    <div style="margin-top: 20px; padding: 10px; background: #e7f3ff; border-radius: 4px; font-size: 12px;">
      <strong>Accessibility Tips:</strong><br>
      • Use <code>alt</code> attribute for informative icons<br>
      • Omit <code>alt</code> for purely decorative icons<br>
      • Interactive icons automatically get proper ARIA roles<br>
      • Disabled icons are marked with <code>aria-disabled="true"</code>
    </div>
  `,
};
