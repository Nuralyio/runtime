import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './index.js';
import '../../shared/themes/default/index.css';
import '../../shared/themes/carbon/index.css';
import '../icon/index.js';
import type { ButtonIconConfig } from './button.types.js';


/**
 * ## Button
 * 
 * Buttons are clickable elements that are used to trigger actions. They communicate calls to action 
 * to the user and allow users to interact with pages in a variety of ways. Button labels express 
 * what action will occur when the user interacts with it.
 * 
 * ### When to use
 * - Use buttons to communicate actions users can take and to allow users to interact with the page
 * - Each page should have only one primary button
 * - Any remaining calls to action should be represented as lower emphasis buttons
 * 
 * ### When not to use
 * - Do not use buttons as navigational elements. Instead, use links when the desired action is to take the user to a new page
 * 
 * ### Variants
 * Each button variant has a particular function and its design signals that function to the user. 
 * It is important that the different variants are implemented consistently across products.
 * 
 * - **Primary**: For the principal call to action on the page
 * - **Secondary**: For secondary actions on each page. Can only be used in conjunction with a primary button
 * - **Tertiary**: For less prominent, and sometimes independent, actions
 * - **Ghost**: For the least pronounced actions; often used in conjunction with a primary button
 * - **Danger**: For actions that could have destructive effects on the user's data
 */
const meta: Meta = {
  title: 'Components/Button',
  component: 'nr-button',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Buttons are clickable elements that are used to trigger actions. They communicate calls to action to the user and allow users to interact with pages in a variety of ways. Button labels express what action will occur when the user interacts with it. This component follows IBM Carbon Design System patterns and specifications.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    // Core Properties
    type: {
      control: { type: 'select' },
      options: ['default', 'primary', 'secondary', 'danger', 'ghost', 'text', 'link'],
      description: 'Button variant that determines the visual style and semantic meaning',
      table: {
        category: 'Appearance',
        defaultValue: { summary: 'default' },
      },
    },
    size: {
      control: { type: 'select' },
      options: ['', 'small', 'medium', 'large'],
      description: 'Button size following Carbon Design System specifications',
      table: {
        category: 'Appearance',
        defaultValue: { summary: 'medium (default)' },
      },
    },
    shape: {
      control: { type: 'select' },
      options: ['default', 'circle', 'round'],
      description: 'Button shape for different use cases',
      table: {
        category: 'Appearance',
        defaultValue: { summary: 'default' },
      },
    },
    
    // State Properties
    disabled: {
      control: { type: 'boolean' },
      description: 'Disables the button and prevents interaction',
      table: {
        category: 'State',
        defaultValue: { summary: 'false' },
      },
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Shows loading spinner and disables interaction',
      table: {
        category: 'State',
        defaultValue: { summary: 'false' },
      },
    },
    
    // Layout Properties
    block: {
      control: { type: 'boolean' },
      description: 'Makes button full width of its container',
      table: {
        category: 'Layout',
        defaultValue: { summary: 'false' },
      },
    },
    dashed: {
      control: { type: 'boolean' },
      description: 'Applies dashed border style',
      table: {
        category: 'Appearance',
        defaultValue: { summary: 'false' },
      },
    },
    
    // Icon Properties
    icon: {
      control: { type: 'object' },
      description: 'Array of icons (strings or enhanced icon config objects) - supports 1-2 icons',
      table: {
        category: 'Icons',
        defaultValue: { summary: '[]' },
      },
    },
    iconPosition: {
      control: { type: 'select' },
      options: ['left', 'right'],
      description: 'Position of icons relative to text content',
      table: {
        category: 'Icons',
        defaultValue: { summary: 'left' },
      },
    },
    
    // Link Properties
    href: {
      control: { type: 'text' },
      description: 'URL for link-type buttons (automatically set to example.com when type is "link")',
      table: {
        category: 'Link',
        defaultValue: { summary: '""' },
      },
    },
    target: {
      control: { type: 'text' },
      description: 'Target attribute for link buttons',
      table: {
        category: 'Link',
        defaultValue: { summary: '""' },
      },
    },
    
    // Accessibility Properties
    buttonAriaLabel: {
      control: { type: 'text' },
      description: 'Custom aria-label for improved accessibility',
      table: {
        category: 'Accessibility',
        defaultValue: { summary: '""' },
      },
    },
    ariaDescribedBy: {
      control: { type: 'text' },
      description: 'References to elements that describe the button',
      table: {
        category: 'Accessibility',
        defaultValue: { summary: '""' },
      },
    },
    
    // Technical Properties
    htmlType: {
      control: { type: 'select' },
      options: ['button', 'submit', 'reset'],
      description: 'HTML button type attribute',
      table: {
        category: 'Technical',
        defaultValue: { summary: 'button' },
      },
    },
    ripple: {
      control: { type: 'boolean' },
      description: 'Enables ripple effect on click',
      table: {
        category: 'Interaction',
        defaultValue: { summary: 'true' },
      },
    },
    
    // Slot
    default: {
      control: { type: 'text' },
      description: 'Button text content',
      table: {
        category: 'Content',
      },
    },
  },
  args: {
    type: 'default',
    size: 'medium',
    shape: 'default',
    disabled: false,
    loading: false,
    block: false,
    dashed: false,
    icon: [],
    iconPosition: 'left',
    href: '',
    target: '',
    buttonAriaLabel: '',
    ariaDescribedBy: '',
    htmlType: 'button',
    ripple: true,
    default: 'Button',
  },
};

export default meta;
type Story = StoryObj;

/**
 * The default button provides a neutral appearance for general actions.
 * Use this for standard actions that don't require strong visual emphasis.
 * This is the most common button variant in software products.
 */
export const Default: Story = {
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story: 'The default button variant for standard actions and interactions.',
      },
    },
  },
  args: {
    default: 'Default',
  },
  render: (args: any) => html`
    <nr-button
      type="${args.type}"
      size="${args.size}"
      shape="${args.shape}"
      ?disabled="${args.disabled}"
      ?loading="${args.loading}"
      ?block="${args.block}"
      ?dashed="${args.dashed}"
      .icon="${args.icon}"
      icon-position="${args.iconPosition}"
      href="${args.type === 'link' ? (args.href || 'https://example.com') : args.href}"
      target="${args.target}"
      button-aria-label="${args.buttonAriaLabel}"
      aria-described-by="${args.ariaDescribedBy}"
      html-type="${args.htmlType}"
      ?ripple="${args.ripple}"
    >
      ${args.default}
    </nr-button>
  `,
};

/**
 * ## Button Variants
 * 
 * Each button variant has a particular function and its design signals that function to the user.
 * It is important that the different variants are implemented consistently across products.
 */
export const AllVariants: Story = {
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story: 'All available button variants following Carbon Design System hierarchy and emphasis patterns.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 2rem; align-items: flex-start;">
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <h3 style="margin: 0; font-size: 1.125rem; font-weight: 600;">Primary Actions</h3>
        <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
          <nr-button type="primary">Primary</nr-button>
          <span style="font-size: 0.875rem; color: #6f6f6f;">Principal call to action - use once per screen</span>
        </div>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <h3 style="margin: 0; font-size: 1.125rem; font-weight: 600;">Secondary Actions</h3>
        <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
          <nr-button type="secondary">Secondary</nr-button>
          <span style="font-size: 0.875rem; color: #6f6f6f;">Use with primary - negative actions like Cancel/Back</span>
        </div>
        <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
          <nr-button type="default">Tertiary</nr-button>
          <span style="font-size: 0.875rem; color: #6f6f6f;">Less prominent actions - can be independent</span>
        </div>
        <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
          <nr-button type="ghost">Ghost</nr-button>
          <span style="font-size: 0.875rem; color: #6f6f6f;">Least pronounced - subtle supplementary actions</span>
        </div>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <h3 style="margin: 0; font-size: 1.125rem; font-weight: 600;">Specialized Actions</h3>
        <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
          <nr-button type="danger">Danger</nr-button>
          <span style="font-size: 0.875rem; color: #6f6f6f;">Destructive actions - delete, remove, stop</span>
        </div>
        <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
          <nr-button type="text">Text</nr-button>
          <span style="font-size: 0.875rem; color: #6f6f6f;">Text-only actions</span>
        </div>
        <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
          <nr-button type="link" href="https://example.com">Link</nr-button>
          <span style="font-size: 0.875rem; color: #6f6f6f;">Navigation actions</span>
        </div>
      </div>
    </div>
  `,
};

/**
 * Primary buttons are for the principal call to action on the page.
 * Primary buttons should only appear once per screen (not including the application header, modal dialog, or side panel).
 * This high-emphasis button commands the most attention.
 */
export const Primary: Story = {
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story: 'For the principal call to action on the page. Should only appear once per screen.',
      },
    },
  },
  args: {
    type: 'primary',
    default: 'Primary',
  },
  render: (args: any) => html`
    <nr-button
      type="${args.type}"
      size="${args.size}"
      ?disabled="${args.disabled}"
      ?loading="${args.loading}"
    >
      ${args.default}
    </nr-button>
  `,
};

/**
 * Secondary buttons are for secondary actions on each page.
 * Secondary buttons can only be used in conjunction with a primary button. 
 * As part of a pair, the secondary button's function is to perform the negative action of the set, such as "Cancel" or "Back".
 */
export const Secondary: Story = {
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story: 'For secondary actions on each page. Can only be used in conjunction with a primary button.',
      },
    },
  },
  args: {
    type: 'secondary',
    default: 'Secondary',
  },
  render: (args: any) => html`
    <nr-button
      type="${args.type}"
      size="${args.size}"
      ?disabled="${args.disabled}"
      ?loading="${args.loading}"
    >
      ${args.default}
    </nr-button>
  `,
};

/**
 * Tertiary buttons are for less prominent, and sometimes independent, actions.
 * Tertiary buttons can be used in isolation or paired with a primary button when there are multiple calls to action.
 * They can also be used for sub-tasks on a page where a primary button for the main and final action is present.
 */
export const Tertiary: Story = {
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story: 'For less prominent actions. Can be used independently or with primary buttons.',
      },
    },
  },
  args: {
    type: 'default', // Using 'default' as our tertiary equivalent
    default: 'Tertiary',
  },
  render: (args: any) => html`
    <nr-button
      type="${args.type}"
      size="${args.size}"
      ?disabled="${args.disabled}"
      ?loading="${args.loading}"
    >
      ${args.default}
    </nr-button>
  `,
};

/**
 * Ghost buttons are for the least pronounced actions; often used in conjunction with a primary button.
 * In a situation such as a progress flow, a ghost button may be paired with a primary and secondary button set,
 * where the primary button is for forward action, the secondary button is for "Back", and the ghost button is for "Cancel".
 */
export const Ghost: Story = {
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story: 'For the least pronounced actions. Often used for cancel or back actions.',
      },
    },
  },
  args: {
    type: 'ghost',
    default: 'Ghost',
  },
  render: (args: any) => html`
    <nr-button
      type="${args.type}"
      size="${args.size}"
      ?disabled="${args.disabled}"
      ?loading="${args.loading}"
    >
      ${args.default}
    </nr-button>
  `,
};

/**
 * Danger buttons are for actions that could have destructive effects on the user's data (for example, delete or remove).
 * Determining which danger button style to use will depend on the level of emphasis you want to give to the destructive action.
 */
export const Danger: Story = {
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story: 'For actions that could have destructive effects on the user\'s data.',
      },
    },
  },
  args: {
    type: 'danger',
    default: 'Delete',
  },
  render: (args: any) => html`
    <nr-button
      type="${args.type}"
      size="${args.size}"
      ?disabled="${args.disabled}"
      ?loading="${args.loading}"
    >
      ${args.default}
    </nr-button>
  `,
};

/**
 * Icon buttons can be placed next to labels to clarify an action and call attention to a button.
 * Icons should be used sparingly, as overuse can create visual noise. Icons must match the color value of the label within a button.
 * Icons should always appear to the right of the label.
 */
export const IconButton: Story = {
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story: 'Buttons with icons to clarify actions. Icons appear to the right of the label.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
      <nr-button type="primary" .icon="${['plus']}">Add item</nr-button>
      <nr-button type="secondary" .icon="${['pen']}">Edit</nr-button>
      <nr-button type="default" .icon="${['download']}">Download</nr-button>
      <nr-button type="danger" .icon="${['trash']}">Delete</nr-button>
      <nr-button type="ghost" .icon="${['external-link']}">Launch</nr-button>
    </div>
  `,
};

/**
 * ## Button Groups
 * 
 * Button groups are useful for aligning buttons that have a relationship. Group buttons logically 
 * into sets based on usage and importance. Follow Carbon's guidelines for proper button combinations.
 */
export const ButtonGroups: Story = {
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story: 'Proper button group combinations following Carbon Design System guidelines.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 3rem; align-items: flex-start;">
      <div>
        <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">✅ Recommended Combinations</h4>
        
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div>
            <p style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #6f6f6f;">Primary + Secondary (for cancel/back actions)</p>
            <div style="display: flex; gap: 1rem;">
              <nr-button type="primary">Save</nr-button>
              <nr-button type="secondary">Cancel</nr-button>
            </div>
          </div>
          
          <div>
            <p style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #6f6f6f;">Primary + Tertiary (for alternative actions)</p>
            <div style="display: flex; gap: 1rem;">
              <nr-button type="primary">Continue</nr-button>
              <nr-button type="default">Save as Draft</nr-button>
            </div>
          </div>
          
          <div>
            <p style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #6f6f6f;">Primary + Ghost (for less prominent alternatives)</p>
            <div style="display: flex; gap: 1rem;">
              <nr-button type="primary">Submit</nr-button>
              <nr-button type="ghost">Preview</nr-button>
            </div>
          </div>
          
          <div>
            <p style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #6f6f6f;">Multiple Tertiary buttons (without primary)</p>
            <div style="display: flex; gap: 1rem;">
              <nr-button type="default">Filter</nr-button>
              <nr-button type="default">Sort</nr-button>
              <nr-button type="default">Export</nr-button>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600; color: #d63939;">❌ Avoid These Combinations</h4>
        
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <p style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #6f6f6f;">Multiple primary buttons (confusing hierarchy)</p>
            <div style="display: flex; gap: 1rem; opacity: 0.6;">
              <nr-button type="primary">Save</nr-button>
              <nr-button type="primary">Publish</nr-button>
            </div>
          </div>
          
          <div>
            <p style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #6f6f6f;">Secondary without primary (secondary needs primary context)</p>
            <div style="display: flex; gap: 1rem; opacity: 0.6;">
              <nr-button type="secondary">Cancel</nr-button>
              <nr-button type="default">Close</nr-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};

/**
 * ## Enhanced Icon Features
 * 
 * The button component supports enhanced icon configuration beyond simple icon names.
 * You can pass detailed icon configuration objects with properties like type, size, color, and custom styles.
 */
export const EnhancedIcons: Story = {
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story: 'Demonstrate enhanced icon capabilities with custom sizes, colors, and types.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 2rem;">
      <div>
        <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">Simple String Icons (Backward Compatible)</h4>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <nr-button type="primary" .icon="${['plus']}">Add Simple</nr-button>
          <nr-button type="secondary" .icon="${['pen']}">Edit Simple</nr-button>
        </div>
      </div>
      
      <div>
        <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">Enhanced Icon Configuration with New Properties</h4>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <nr-button type="primary" .icon="${[{name: 'add', type: 'solid', size: '1.2em', color: '#ffffff'} as ButtonIconConfig]}">Add Enhanced</nr-button>
          <nr-button type="secondary" .icon="${[{name: 'edit', type: 'regular', size: '1.1em', color: '#0056ff'} as ButtonIconConfig]}">Edit Regular</nr-button>
          <nr-button type="default" .icon="${[{name: 'download', type: 'solid', color: '#28a745'} as ButtonIconConfig]}">Custom Color</nr-button>
          <nr-button type="danger" .icon="${[{name: 'trash', type: 'solid', size: '1.3em'} as ButtonIconConfig]}">Large Icon</nr-button>
        </div>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #6f6f6f;">
          Icons now accept size and color properties directly, no need for CSS overrides!
        </p>
      </div>
      
      <div>
        <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">Mixed Icon Types</h4>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <nr-button type="primary" .icon="${['home', {name: 'external-link', type: 'solid', size: '0.9em'} as ButtonIconConfig]}">Home & Link</nr-button>
          <nr-button type="secondary" .icon="${[{name: 'user', type: 'regular'} as ButtonIconConfig, 'settings']}">User & Settings</nr-button>
        </div>
      </div>
      
      <div>
        <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">Icon-only Buttons with Enhanced Properties</h4>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <nr-button type="primary" shape="circle" .icon="${[{name: 'plus', type: 'solid', color: '#ffffff', alt: 'Add new item'} as ButtonIconConfig]}" button-aria-label="Add"></nr-button>
          <nr-button type="secondary" shape="circle" .icon="${[{name: 'edit', type: 'regular', size: '1.1em', alt: 'Edit item'} as ButtonIconConfig]}" button-aria-label="Edit"></nr-button>
          <nr-button type="danger" shape="circle" .icon="${[{name: 'trash', type: 'solid', size: '1.2em', alt: 'Delete item'} as ButtonIconConfig]}" button-aria-label="Delete"></nr-button>
        </div>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #6f6f6f;">
          Icon-only buttons with enhanced size, color, and accessibility properties
        </p>
      </div>
      
      <div>
        <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">Advanced Icon Styling Examples</h4>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <nr-button type="primary" .icon="${[{name: 'star', type: 'solid', color: '#ffd700', size: '1.2em'} as ButtonIconConfig]}">Gold Star</nr-button>
          <nr-button type="secondary" .icon="${[{name: 'heart', type: 'regular', color: '#ff6b6b', size: '1.1em'} as ButtonIconConfig]}">Love It</nr-button>
          <nr-button type="default" .icon="${[{name: 'shield', type: 'solid', color: '#28a745', size: '1.15em'} as ButtonIconConfig]}">Secure</nr-button>
          <nr-button type="ghost" .icon="${[{name: 'lightning-bolt', type: 'solid', color: '#6f42c1', size: '1.25em'} as ButtonIconConfig]}">Fast</nr-button>
        </div>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #6f6f6f;">
          Custom colors and sizes showcase the flexibility of the enhanced icon system
        </p>
      </div>
    </div>
  `,
};

/**
 * ## Alternative Icon APIs
 * 
 * Multiple intuitive ways to specify icons with enhanced properties (size, color, type, alt text) 
 * without relying on arrays for better developer experience and more precise control.
 */
export const AlternativeIconAPIs: Story = {
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story: 'Demonstrate alternative APIs for icon positioning that are more intuitive than arrays.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 2rem;">
      <div>
        <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">1. Separate Properties (Most Intuitive)</h4>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <nr-button type="primary" iconLeft="home">Home Only</nr-button>
          <nr-button type="secondary" iconRight="arrow-right">Next</nr-button>
          <nr-button type="default" iconLeft="home" iconRight="arrow-right">Navigate</nr-button>
        </div>
      </div>
      
      <div>
        <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">2. Enhanced Separate Properties</h4>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <nr-button type="primary" .iconLeft="${{name: 'user', type: 'solid', color: '#ffffff', size: '1.1em'} as ButtonIconConfig}">Enhanced Profile</nr-button>
          <nr-button type="secondary" .iconRight="${{name: 'external-link', type: 'regular', size: '0.9em', color: '#0056ff'} as ButtonIconConfig}">Launch App</nr-button>
          <nr-button type="default" 
            .iconLeft="${{name: 'download', type: 'solid', color: '#28a745'} as ButtonIconConfig}" 
            .iconRight="${{name: 'check', type: 'regular', color: '#28a745', size: '0.9em'} as ButtonIconConfig}">
            Download & Verify
          </nr-button>
        </div>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #6f6f6f;">
          Individual icon properties with enhanced styling - size and color per icon!
        </p>
      </div>
      
      <div>
        <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">3. Object-based Configuration</h4>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <nr-button type="primary" .icons="${{left: 'home'}}">Home Only</nr-button>
          <nr-button type="secondary" .icons="${{right: 'arrow-right'}}">Next</nr-button>
          <nr-button type="default" .icons="${{left: 'search', right: 'filter'}}">Search & Filter</nr-button>
        </div>
      </div>
      
      <div>
        <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">4. Enhanced Object Configuration</h4>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <nr-button type="primary" .icons="${{
            left: {name: 'star', type: 'solid', color: '#ffd700', size: '1.1em'} as ButtonIconConfig,
            right: {name: 'arrow-right', type: 'regular', size: '0.9em'} as ButtonIconConfig
          }}">Star & Go</nr-button>
          <nr-button type="danger" .icons="${{
            left: {name: 'warning', type: 'solid', size: '1.1em', color: '#ffc107'} as ButtonIconConfig,
            right: {name: 'trash', type: 'solid', color: '#dc3545', size: '1.1em'} as ButtonIconConfig
          }}">Warn & Delete</nr-button>
        </div>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #6f6f6f;">
          Object configuration with custom colors and sizes for both left and right icons
        </p>
      </div>
      
      <div>
        <h4 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600;">5. Priority Demonstration & Complete Feature Showcase</h4>
        <p style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #6f6f6f;">
          When multiple icon properties are set, priority is: iconLeft/iconRight > icons.left/right > icon[0]/icon[1]
        </p>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <nr-button type="primary" 
            .icon="${['background-left', 'background-right']}" 
            iconLeft="priority-left" 
            .icons="${{right: 'priority-right'}}">
            Priority Test
          </nr-button>
        </div>
        <p style="margin: 1rem 0 0.5rem 0; font-size: 0.875rem; color: #6f6f6f; font-weight: 600;">
          Complete Icon Feature Showcase:
        </p>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <nr-button type="primary" 
            .iconLeft="${{name: 'rocket', type: 'solid', color: '#ffffff', size: '1.2em', alt: 'Launch rocket'} as ButtonIconConfig}"
            .iconRight="${{name: 'star', type: 'regular', color: '#ffd700', size: '1.1em', alt: 'Favorite'} as ButtonIconConfig}">
            Full Featured
          </nr-button>
          <nr-button type="secondary" 
            .icons="${{
              left: {name: 'shield', type: 'solid', color: '#28a745', size: '1.15em', alt: 'Security'} as ButtonIconConfig,
              right: {name: 'lightning-bolt', type: 'solid', color: '#6f42c1', size: '1.1em', alt: 'Fast'} as ButtonIconConfig
            }}">
            Secure & Fast
          </nr-button>
        </div>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #6f6f6f;">
          Complete control: name, type, size, color, and alt text for each icon
        </p>
      </div>
    </div>
  `,
};

/**
 * ## Button Sizes
 * 
 * Carbon Design System defines three button sizes: small (32px), medium (40px), and large (48px).
 * Choose the appropriate size based on your UI density and context. Medium is the default size for most interfaces.
 */
export const AllSizes: Story = {
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story: 'Button sizes following Carbon Design System specifications. Medium is the default size.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 2rem; align-items: flex-start;">
      <div style="display: flex; gap: 1rem; align-items: center;">
        <nr-button type="primary" size="small">Small (32px)</nr-button>
        <span style="font-size: 0.875rem; color: #6f6f6f;">Use when vertical space is limited or in areas with a confined layout</span>
      </div>
      <div style="display: flex; gap: 1rem; align-items: center;">
        <nr-button type="primary" size="medium">Medium (40px)</nr-button>
        <span style="font-size: 0.875rem; color: #6f6f6f;">Default size - most common button size in software products</span>
      </div>
      <div style="display: flex; gap: 1rem; align-items: center;">
        <nr-button type="primary" size="large">Large (48px)</nr-button>
        <span style="font-size: 0.875rem; color: #6f6f6f;">Use for mobile interfaces and when buttons need more prominence</span>
      </div>
    </div>
  `,
};

/**
 * ## Button States
 * 
 * Buttons can exist in different states to provide feedback and prevent unwanted interactions.
 * Use appropriate states to enhance user experience and provide clear feedback.
 */
export const AllStates: Story = {
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story: 'Different button states for various interaction scenarios.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1.5rem; align-items: center;">
      <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
        <nr-button type="primary">Normal</nr-button>
        <span style="font-size: 0.875rem; color: #6f6f6f;">Default interactive state</span>
      </div>
      <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
        <nr-button type="primary" disabled>Disabled</nr-button>
        <span style="font-size: 0.875rem; color: #6f6f6f;">Cannot be interacted with</span>
      </div>
      <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
        <nr-button type="primary" loading>Loading</nr-button>
        <span style="font-size: 0.875rem; color: #6f6f6f;">Processing state with spinner</span>
      </div>
    </div>
  `,
};

/**
 * ## Layout and Shapes
 * 
 * Buttons can be configured for different layout needs and visual styles.
 * Choose appropriate shapes and layouts based on your design requirements.
 */
export const LayoutVariations: Story = {
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story: 'Different button layouts and shapes for various design contexts.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 2rem; align-items: center;">
      <div>
        <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem;">Block buttons (full width):</h4>
        <div style="width: 300px;">
          <nr-button type="primary" block>Block Primary Button</nr-button>
          <br><br>
          <nr-button type="secondary" block>Block Secondary Button</nr-button>
        </div>
      </div>
      <div>
        <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem;">Button shapes:</h4>
        <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
          <nr-button type="primary" shape="default">Default</nr-button>
          <nr-button type="primary" shape="round">Round</nr-button>
          <nr-button type="primary" shape="circle" .icon="${['plus']}" button-aria-label="Add"></nr-button>
        </div>
      </div>
      <div>
        <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem;">Dashed border style:</h4>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <nr-button type="primary" dashed>Dashed Primary</nr-button>
          <nr-button type="secondary" dashed>Dashed Secondary</nr-button>
          <nr-button type="default" dashed>Dashed Default</nr-button>
        </div>
      </div>
    </div>
  `,
};