import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './index.js';
import '../icon/index.js';
import '../button/index.js';
import type { DropdownItem } from './dropdown.types.js';

/**
 * ## Dropdown
 * 
 * Flexible dropdown component with customizable trigger, content, and positioning.
 * The dropdown provides a floating panel that can be triggered by various interactions
 * (click, hover, focus) and positioned relative to its trigger element.
 * 
 * ### When to use
 * - Display additional options or content in a compact, space-efficient way
 * - Create contextual menus and action lists
 * - Show tooltips and informational content on demand
 * - Provide navigation options without taking up permanent screen space
 * 
 * ### When not to use
 * - For primary navigation that should always be visible
 * - When the content is critical and should not be hidden
 * - For form inputs (use select component instead)
 * 
 * ### Key Features
 * - Multiple trigger modes (click, hover, focus, manual)
 * - Flexible positioning with auto-placement
 * - Customizable content through slots
 * - Predefined item lists or completely custom content
 * - Theme-aware styling with size variants
 * - Keyboard navigation and accessibility support
 * - Animation options and arrow indicators
 */
const meta: Meta = {
  title: 'Navigation/Dropdown',
  component: 'nr-dropdown',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Flexible dropdown component with customizable trigger, content, and positioning. Supports multiple trigger modes, custom content through slots, and comprehensive accessibility features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    // Core Properties
    open: {
      control: { type: 'boolean' },
      description: 'Controls dropdown visibility state',
      table: {
        category: 'State',
        defaultValue: { summary: 'false' },
      },
    },
    placement: {
      control: { type: 'select' },
      options: ['bottom', 'top', 'bottom-start', 'bottom-end', 'top-start', 'top-end', 'auto'],
      description: 'Dropdown placement relative to trigger element',
      table: {
        category: 'Positioning',
        defaultValue: { summary: 'bottom' },
      },
    },
    trigger: {
      control: { type: 'select' },
      options: ['click', 'hover', 'focus', 'manual'],
      description: 'How the dropdown is triggered to open',
      table: {
        category: 'Interaction',
        defaultValue: { summary: 'click' },
      },
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Size variant affecting padding and font size',
      table: {
        category: 'Appearance',
        defaultValue: { summary: 'medium' },
      },
    },
    animation: {
      control: { type: 'select' },
      options: ['none', 'fade', 'slide', 'scale'],
      description: 'Animation type when opening/closing',
      table: {
        category: 'Animation',
        defaultValue: { summary: 'fade' },
      },
    },
    
    // Behavior Properties
    disabled: {
      control: { type: 'boolean' },
      description: 'Disables dropdown interaction',
      table: {
        category: 'State',
        defaultValue: { summary: 'false' },
      },
    },
    arrow: {
      control: { type: 'boolean' },
      description: 'Shows arrow pointing to trigger element',
      table: {
        category: 'Appearance',
        defaultValue: { summary: 'false' },
      },
    },
    autoClose: {
      control: { type: 'boolean' },
      description: 'Auto-close dropdown when item is selected',
      table: {
        category: 'Behavior',
        defaultValue: { summary: 'true' },
      },
    },
    closeOnOutsideClick: {
      control: { type: 'boolean' },
      description: 'Close dropdown when clicking outside',
      table: {
        category: 'Behavior',
        defaultValue: { summary: 'true' },
      },
    },
    closeOnEscape: {
      control: { type: 'boolean' },
      description: 'Close dropdown when pressing Escape key',
      table: {
        category: 'Behavior',
        defaultValue: { summary: 'true' },
      },
    },
    
    // Positioning Properties
    offset: {
      control: { type: 'number' },
      description: 'Offset from trigger element in pixels',
      table: {
        category: 'Positioning',
        defaultValue: { summary: '4' },
      },
    },
    delay: {
      control: { type: 'number' },
      description: 'Delay before opening on hover (ms)',
      table: {
        category: 'Interaction',
        defaultValue: { summary: '100' },
      },
    },
    maxHeight: {
      control: { type: 'text' },
      description: 'Maximum height of dropdown content',
      table: {
        category: 'Sizing',
        defaultValue: { summary: '300px' },
      },
    },
    minWidth: {
      control: { type: 'text' },
      description: 'Minimum width of dropdown',
      table: {
        category: 'Sizing',
        defaultValue: { summary: 'auto' },
      },
    },
    
    // Cascading Properties
    cascadeDirection: {
      control: { type: 'select' },
      options: ['right', 'left', 'auto'],
      description: 'Direction for cascading submenus',
      table: {
        category: 'Cascading',
        defaultValue: { summary: 'auto' },
      },
    },
    cascadeDelay: {
      control: { type: 'number' },
      description: 'Delay before showing submenu on hover (ms)',
      table: {
        category: 'Cascading',
        defaultValue: { summary: '300' },
      },
    },
    cascadeOnHover: {
      control: { type: 'boolean' },
      description: 'Whether to show cascading submenus on hover',
      table: {
        category: 'Cascading',
        defaultValue: { summary: 'true' },
      },
    },
  },
  args: {
    open: false,
    placement: 'bottom',
    trigger: 'hover',
    size: 'medium',
    animation: 'fade',
    disabled: false,
    arrow: false,
    autoClose: false,
    closeOnOutsideClick: false,
    closeOnEscape: true,
    offset: 4,
    delay: 50,
    maxHeight: '300px',
    minWidth: 'auto',
    cascadeDirection: 'auto',
    cascadeDelay: 300,
    cascadeOnHover: true,
  },
};

export default meta;
type Story = StoryObj;

/**
 * Basic dropdown with click trigger and custom content.
 * This is the most common dropdown configuration.
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Basic dropdown with click trigger and custom content. Click the button to toggle the dropdown.',
      },
    },
  },
  render: (args: any) => html`
    <nr-dropdown
      placement="${args.placement}"
      trigger="${args.trigger}"
      size="${args.size}"
      animation="${args.animation}"
      ?disabled="${args.disabled}"
      ?arrow="${args.arrow}"
      ?auto-close="${args.autoClose}"
      ?close-on-outside-click="${args.closeOnOutsideClick}"
      ?close-on-escape="${args.closeOnEscape}"
      offset="${args.offset}"
      delay="${args.delay}"
      max-height="${args.maxHeight}"
      min-width="${args.minWidth}"
    >
      <nr-button slot="trigger" >Toggle Dropdown</nr-button>
      <div slot="content" style="padding: 12px; min-width: 200px;">
        <h4 style="margin: 0 0 8px 0;">Dropdown Content</h4>
        <p style="margin: 0 0 12px 0; color: var(--nuraly-color-text-secondary);">
          This is custom content inside the dropdown panel.
        </p>
        <nr-button size="small" type="primary">Action</nr-button>
      </div>
    </nr-dropdown>
  `,
};

/**
 * Dropdown with predefined items list.
 * Perfect for menus and action lists.
 */
export const WithItems: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Dropdown using the items property to display a list of selectable options.',
      },
    },
  },
  args: {
    arrow: true,
  },
  render: (args: any) => html`
    <nr-dropdown
      placement="${args.placement}"
      trigger="${args.trigger}"
      size="${args.size}"
      animation="${args.animation}"
      ?disabled="${args.disabled}"
      ?arrow="${args.arrow}"
      ?auto-close="${args.autoClose}"
      ?close-on-outside-click="${args.closeOnOutsideClick}"
      ?close-on-escape="${args.closeOnEscape}"
      offset="${args.offset}"
      delay="${args.delay}"
      max-height="${args.maxHeight}"
      min-width="180px"
      .items="${[
        { id: '1', label: 'Edit', icon: 'edit', value: 'edit' },
        { id: '2', label: 'Copy', icon: 'copy', value: 'copy' },
        { id: '3', label: 'Share', icon: 'share', value: 'share' },
        { id: 'divider', label: '', divider: true },
        { id: '4', label: 'Delete', icon: 'delete', value: 'delete' },
      ]}"
      @nr-dropdown-item-click="${(e: CustomEvent) => {
        console.log('Item clicked:', e.detail.item);
      }}"
    >
      <nr-button slot="trigger" >
        Actions
        <nr-icon name="chevron-down" slot="icon-after"></nr-icon>
      </nr-button>
    </nr-dropdown>
  `,
};

/**
 * Hover-triggered dropdown for tooltips and quick info.
 * Opens automatically when hovering over the trigger.
 */
export const HoverTrigger: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Dropdown that opens on hover, perfect for tooltips and contextual information.',
      },
    },
  },
  args: {
    trigger: 'hover',
    arrow: true,
    delay: 200,
    placement: 'top',
  },
  render: (args: any) => html`
    <nr-dropdown
      placement="${args.placement}"
      trigger="${args.trigger}"
      size="${args.size}"
      animation="${args.animation}"
      ?disabled="${args.disabled}"
      ?arrow="${args.arrow}"
      ?auto-close="${args.autoClose}"
      ?close-on-outside-click="${args.closeOnOutsideClick}"
      ?close-on-escape="${args.closeOnEscape}"
      offset="${args.offset}"
      delay="${args.delay}"
      max-height="${args.maxHeight}"
      min-width="250px"
    >
      <span slot="trigger" style="cursor: help; text-decoration: underline dotted;">
        Hover for tooltip
      </span>
      <div slot="content" style="padding: 12px;">
        <strong>Tooltip Information</strong><br>
        This dropdown appears when you hover over the trigger element.
        It automatically closes when you move the mouse away.
      </div>
    </nr-dropdown>
  `,
};

/**
 * Dropdown with different size variants.
 * Shows small, medium, and large size options.
 */
export const SizeVariants: Story = {
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story: 'Dropdown components in different sizes showing how padding and typography scale.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; gap: 24px; align-items: flex-start;">
      <nr-dropdown size="small" min-width="160px">
        <nr-button slot="trigger" size="small">Small</nr-button>
        <div slot="content" style="padding: 8px;">
          <div>Small dropdown content with compact spacing and smaller text.</div>
        </div>
      </nr-dropdown>

      <nr-dropdown size="medium" min-width="180px">
        <nr-button slot="trigger" size="medium">Medium</nr-button>
        <div slot="content" style="padding: 12px;">
          <div>Medium dropdown content with standard spacing and text size.</div>
        </div>
      </nr-dropdown>

      <nr-dropdown size="large" min-width="200px">
        <nr-button slot="trigger" size="large">Large</nr-button>
        <div slot="content" style="padding: 16px;">
          <div>Large dropdown content with generous spacing and larger text.</div>
        </div>
      </nr-dropdown>
    </div>
  `,
};

/**
 * Dropdown with different placement options.
 * Demonstrates various positioning relative to the trigger.
 */
export const PlacementVariants: Story = {
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Different placement options for positioning the dropdown relative to its trigger.',
      },
    },
  },
  render: () => html`
    <div style="padding: 100px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; place-items: center;">
      <nr-dropdown placement="top" ?arrow="${true}">
        <nr-button slot="trigger">Top</nr-button>
        <div slot="content" style="padding: 12px; min-width: 120px;">Top placement</div>
      </nr-dropdown>

      <nr-dropdown placement="top-start" ?arrow="${true}">
        <nr-button slot="trigger">Top Start</nr-button>
        <div slot="content" style="padding: 12px; min-width: 120px;">Top start</div>
      </nr-dropdown>

      <nr-dropdown placement="top-end" ?arrow="${true}">
        <nr-button slot="trigger">Top End</nr-button>
        <div slot="content" style="padding: 12px; min-width: 120px;">Top end</div>
      </nr-dropdown>

      <nr-dropdown placement="bottom" ?arrow="${true}">
        <nr-button slot="trigger">Bottom</nr-button>
        <div slot="content" style="padding: 12px; min-width: 120px;">Bottom placement</div>
      </nr-dropdown>

      <nr-dropdown placement="bottom-start" ?arrow="${true}">
        <nr-button slot="trigger">Bottom Start</nr-button>
        <div slot="content" style="padding: 12px; min-width: 120px;">Bottom start</div>
      </nr-dropdown>

      <nr-dropdown placement="bottom-end" ?arrow="${true}">
        <nr-button slot="trigger">Bottom End</nr-button>
        <div slot="content" style="padding: 12px; min-width: 120px;">Bottom end</div>
      </nr-dropdown>
    </div>
  `,
};

/**
 * Dropdown with different animation types.
 * Shows fade, slide, scale, and no animation options.
 */
export const AnimationVariants: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Different animation types for dropdown open/close transitions.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; gap: 24px; align-items: flex-start;">
      <nr-dropdown animation="none">
        <nr-button slot="trigger">No Animation</nr-button>
        <div slot="content" style="padding: 12px; min-width: 150px;">
          Appears instantly without animation
        </div>
      </nr-dropdown>

      <nr-dropdown animation="fade">
        <nr-button slot="trigger">Fade</nr-button>
        <div slot="content" style="padding: 12px; min-width: 150px;">
          Fades in/out smoothly
        </div>
      </nr-dropdown>

      <nr-dropdown animation="slide">
        <nr-button slot="trigger">Slide</nr-button>
        <div slot="content" style="padding: 12px; min-width: 150px;">
          Slides in from above
        </div>
      </nr-dropdown>

      <nr-dropdown animation="scale">
        <nr-button slot="trigger">Scale</nr-button>
        <div slot="content" style="padding: 12px; min-width: 150px;">
          Scales up from small
        </div>
      </nr-dropdown>
    </div>
  `,
};

/**
 * Dropdown with complex content layout.
 * Shows how to use header, content, and footer slots.
 */
export const ComplexContent: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Dropdown with complex content using header, content, and footer slots.',
      },
    },
  },
  render: (args: any) => html`
    <nr-dropdown
      placement="bottom-start"
      min-width="280px"
      max-height="400px"
    >
      <nr-button slot="trigger" >
        User Profile
        <nr-icon name="user" slot="icon"></nr-icon>
      </nr-button>
      
      <div slot="header" style="padding: 16px; border-bottom: 1px solid var(--nuraly-color-border);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--nuraly-color-primary); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">
            JD
          </div>
          <div>
            <div style="font-weight: 600;">John Doe</div>
            <div style="font-size: 14px; color: var(--nuraly-color-text-secondary);">john.doe@example.com</div>
          </div>
        </div>
      </div>

      <div slot="content">
        <div style="padding: 8px 0;">
          <button style="display: flex; align-items: center; gap: 8px; width: 100%; padding: 12px 16px; border: none; background: none; cursor: pointer; font-size: 14px;">
            <nr-icon name="settings"></nr-icon>
            Account Settings
          </button>
          <button style="display: flex; align-items: center; gap: 8px; width: 100%; padding: 12px 16px; border: none; background: none; cursor: pointer; font-size: 14px;">
            <nr-icon name="help"></nr-icon>
            Help & Support
          </button>
          <button style="display: flex; align-items: center; gap: 8px; width: 100%; padding: 12px 16px; border: none; background: none; cursor: pointer; font-size: 14px;">
            <nr-icon name="document"></nr-icon>
            Documentation
          </button>
        </div>
      </div>

      <div slot="footer" style="padding: 12px 16px; border-top: 1px solid var(--nuraly-color-border);">
        <nr-button type="text" size="small" style="width: 100%;">
          <nr-icon name="logout" slot="icon"></nr-icon>
          Sign Out
        </nr-button>
      </div>
    </nr-dropdown>
  `,
};

/**
 * Interactive playground for testing all dropdown properties.
 * Use the controls panel to experiment with different configurations.
 */
export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground for experimenting with all dropdown properties and configurations.',
      },
    },
  },
  render: (args: any) => html`
    <nr-dropdown
      placement="${args.placement}"
      trigger="${args.trigger}"
      size="${args.size}"
      animation="${args.animation}"
      ?disabled="${args.disabled}"
      ?arrow="${args.arrow}"
      ?auto-close="${args.autoClose}"
      ?close-on-outside-click="${args.closeOnOutsideClick}"
      ?close-on-escape="${args.closeOnEscape}"
      offset="${args.offset}"
      delay="${args.delay}"
      max-height="${args.maxHeight}"
      min-width="${args.minWidth}"
    >
      <nr-button slot="trigger" >
        Playground Dropdown
      </nr-button>
      <div slot="content" style="padding: 16px; min-width: 200px;">
        <h4 style="margin: 0 0 12px 0;">Playground Content</h4>
        <p style="margin: 0 0 16px 0; color: var(--nuraly-color-text-secondary); font-size: 14px;">
          Use the controls panel to test different dropdown configurations and behaviors.
        </p>
        <div style="display: flex; gap: 8px;">
          <nr-button size="small" type="primary">Primary</nr-button>
          <nr-button size="small" >Secondary</nr-button>
        </div>
      </div>
    </nr-dropdown>
  `,
};

/**
 * Demonstrates dropdown behavior at viewport edges. Dropdowns automatically
 * adjust their position when there's insufficient space to display below the trigger.
 * This example shows dropdowns near the bottom of the viewport that flip upward.
 */
export const ViewportEdges: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Dropdowns positioned near viewport edges automatically adjust their placement to remain visible. Try scrolling to see how dropdowns adapt when space is limited.',
      },
    },
    layout: 'fullscreen',
  },
  render: () => html`
    <div style="height: 100vh; padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
      <!-- Top of viewport -->
      <div style="display: flex; gap: 20px; align-items: flex-start;">
        <nr-dropdown placement="bottom-start">
          <nr-button slot="trigger" >Top Left</nr-button>
          <div slot="content" style="padding: 16px; min-width: 200px;">
            <h4 style="margin: 0 0 8px 0;">Top Dropdown</h4>
            <p style="margin: 0 0 12px 0; color: var(--nuraly-color-text-secondary);">
              This dropdown appears below the trigger as there's plenty of space.
            </p>
            <nr-button size="small" type="primary">Action</nr-button>
          </div>
        </nr-dropdown>

        <nr-dropdown placement="bottom-end">
          <nr-button slot="trigger" >Top Right</nr-button>
          <div slot="content" style="padding: 16px; min-width: 200px;">
            <h4 style="margin: 0 0 8px 0;">Right-aligned Dropdown</h4>
            <p style="margin: 0 0 12px 0; color: var(--nuraly-color-text-secondary);">
              This dropdown is right-aligned to the trigger.
            </p>
            <nr-button size="small" type="primary">Action</nr-button>
          </div>
        </nr-dropdown>
      </div>

      <!-- Center of viewport -->
      <div style="display: flex; justify-content: center;">
        <nr-dropdown placement="bottom">
          <nr-button slot="trigger" >Center</nr-button>
          <div slot="content" style="padding: 16px; min-width: 250px;">
            <h4 style="margin: 0 0 8px 0;">Center Dropdown</h4>
            <p style="margin: 0 0 12px 0; color: var(--nuraly-color-text-secondary);">
              This dropdown appears in the center with normal positioning.
            </p>
            <div style="display: flex; gap: 8px;">
              <nr-button size="small" type="primary">Primary</nr-button>
              <nr-button size="small" >Secondary</nr-button>
            </div>
          </div>
        </nr-dropdown>
      </div>

      <!-- Bottom of viewport - these should flip upward when space is limited -->
      <div style="display: flex; gap: 20px; align-items: flex-end; justify-content: space-between;">
        <nr-dropdown placement="top-start">
          <nr-button slot="trigger" >Bottom Left (Manual Top)</nr-button>
          <div slot="content" style="padding: 16px; min-width: 200px;">
            <h4 style="margin: 0 0 8px 0;">Upward Dropdown</h4>
            <p style="margin: 0 0 12px 0; color: var(--nuraly-color-text-secondary);">
              This dropdown is manually set to appear above the trigger.
            </p>
            <nr-button size="small" type="primary">Action</nr-button>
          </div>
        </nr-dropdown>

        <nr-dropdown placement="bottom" class="edge-dropdown">
          <nr-button slot="trigger" >Bottom Center (Auto-flip)</nr-button>
          <div slot="content" style="padding: 16px; min-width: 220px; max-height: 200px; overflow-y: auto;">
            <h4 style="margin: 0 0 8px 0;">Smart Positioning</h4>
            <p style="margin: 0 0 12px 0; color: var(--nuraly-color-text-secondary);">
              This dropdown should automatically flip upward when there's insufficient space below.
            </p>
            <div style="margin-bottom: 8px;">
              <nr-button size="small" type="primary" style="width: 100%; margin-bottom: 4px;">Item 1</nr-button>
              <nr-button size="small"  style="width: 100%; margin-bottom: 4px;">Item 2</nr-button>
              <nr-button size="small"  style="width: 100%; margin-bottom: 4px;">Item 3</nr-button>
              <nr-button size="small"  style="width: 100%;">Item 4</nr-button>
            </div>
          </div>
        </nr-dropdown>

        <nr-dropdown placement="top-end">
          <nr-button slot="trigger" >Bottom Right (Manual Top)</nr-button>
          <div slot="content" style="padding: 16px; min-width: 200px;">
            <h4 style="margin: 0 0 8px 0;">Right-aligned Up</h4>
            <p style="margin: 0 0 12px 0; color: var(--nuraly-color-text-secondary);">
              This dropdown appears above and right-aligned.
            </p>
            <nr-button size="small" type="primary">Action</nr-button>
          </div>
        </nr-dropdown>
      </div>

      <!-- Extra content to ensure scrolling -->
      <div style="margin-top: 20px; padding: 20px; background: var(--nuraly-color-background-secondary); border-radius: 8px;">
        <h3 style="margin: 0 0 12px 0;">Scroll Testing Area</h3>
        <p style="margin: 0 0 16px 0; color: var(--nuraly-color-text-secondary);">
          Scroll up and down to see how dropdowns behave at different viewport positions. 
          The dropdown positioning should adapt based on available space.
        </p>
        
        <div style="display: flex; flex-wrap: wrap; gap: 12px; margin: 20px 0;">
          <nr-dropdown placement="bottom-start">
            <nr-button slot="trigger"  size="small">Test 1</nr-button>
            <div slot="content" style="padding: 12px; min-width: 150px;">
              <p style="margin: 0;">Small dropdown content</p>
            </div>
          </nr-dropdown>
        </div>
      </div>
    </div>
  `,
};

/**
 * Basic cascading dropdown demonstrating submenu functionality.
 * Items with 'options' property automatically show cascading submenus.
 */
export const CascadingBasic: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Basic cascading dropdown with submenus. Items with `options` property automatically show cascading submenus on hover or click.',
      },
    },
  },
  render: (args) => html`
    <nr-dropdown 
      .items="${[
        {
          id: 'file',
          label: 'File',
          icon: 'folder',
          options: [
            { id: 'new', label: 'New Document', icon: 'plus' },
            { id: 'open', label: 'Open...', icon: 'folder-open' },
            { id: 'divider1', label: '', divider: true },
            { id: 'save', label: 'Save', icon: 'save' },
            { id: 'save-as', label: 'Save As...', icon: 'save' }
          ]
        },
        {
          id: 'edit',
          label: 'Edit',
          icon: 'edit',
          options: [
            { id: 'copy', label: 'Copy', icon: 'copy' },
            { id: 'paste', label: 'Paste', icon: 'paste' },
            { id: 'cut', label: 'Cut', icon: 'scissors' },
            { id: 'divider-edit', label: '', divider: true },
            { id: 'select-all', label: 'Select All', icon: 'check-square' },
            { id: 'find', label: 'Find & Replace', icon: 'search' }
          ]
        },
        { id: 'divider2', label: '', divider: true },
        { id: 'settings', label: 'Settings', icon: 'settings' },
        { id: 'help', label: 'Help', icon: 'help-circle' }
      ]}"
      cascade-direction="${args.cascadeDirection}"
      cascade-delay="${args.cascadeDelay}"
      ?cascade-on-hover="${args.cascadeOnHover}"
      placement="${args.placement}"
      trigger="${args.trigger}">
      <nr-button slot="trigger">File Menu</nr-button>
    </nr-dropdown>
  `,
  args: {
    cascadeDirection: 'right',
    cascadeDelay: 200,
    cascadeOnHover: true,
  },
};

/**
 * Complex cascading dropdown with mixed content types.
 * Demonstrates regular items mixed with cascading items in the same dropdown.
 */
export const CascadingComplex: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Complex cascading dropdown mixing regular items with cascading submenus. Shows how different content types can coexist.',
      },
    },
  },
  render: (args) => html`
    <nr-dropdown 
      .items="${[
        { id: 'profile', label: 'My Profile', icon: 'user' },
        { id: 'notifications', label: 'Notifications', icon: 'bell' },
        { id: 'divider1', label: '', divider: true },
        {
          id: 'workspace',
          label: 'Workspace',
          icon: 'layers',
          options: [
            { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
            { id: 'projects', label: 'Projects', icon: 'folder' },
            { id: 'team', label: 'Team Members', icon: 'users' },
            { id: 'divider-workspace', label: '', divider: true },
            { id: 'analytics', label: 'Analytics', icon: 'bar-chart' }
          ]
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: 'settings',
          options: [
            { id: 'general', label: 'General', icon: 'sliders' },
            { id: 'security', label: 'Security & Privacy', icon: 'shield' },
            { id: 'notifications-settings', label: 'Notifications', icon: 'bell' },
            { id: 'billing', label: 'Billing', icon: 'credit-card' },
            { id: 'divider-settings', label: '', divider: true },
            { id: 'integrations', label: 'Integrations', icon: 'plug' }
          ]
        },
        { id: 'divider2', label: '', divider: true },
        { id: 'support', label: 'Help & Support', icon: 'help-circle' },
        { id: 'logout', label: 'Sign Out', icon: 'log-out' }
      ]}"
      cascade-direction="${args.cascadeDirection}"
      cascade-delay="${args.cascadeDelay}"
      ?cascade-on-hover="${args.cascadeOnHover}"
      placement="${args.placement}"
      trigger="${args.trigger}">
      <nr-button slot="trigger" type="primary">
        <nr-icon name="user" slot="prefix"></nr-icon>
        Account Menu
      </nr-button>
    </nr-dropdown>
  `,
  args: {
    cascadeDirection: 'right',
    cascadeDelay: 300,
    cascadeOnHover: true,
  },
};

/**
 * Cascading dropdown with different directions.
 * Demonstrates left, right, and auto cascade directions.
 */
export const CascadingDirections: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Cascading dropdowns with different cascade directions. Shows how submenus can cascade to the left, right, or auto-position.',
      },
    },
  },
  render: (args) => html`
    <div style="display: flex; gap: 20px; justify-content: center; align-items: center; min-height: 300px;">
      <!-- Left Cascade -->
      <nr-dropdown 
        .items="${[
          {
            id: 'tools',
            label: 'Tools',
            options: [
              { id: 'calculator', label: 'Calculator', icon: 'calculator' },
              { id: 'calendar', label: 'Calendar', icon: 'calendar' },
              { id: 'divider-tools', label: '', divider: true },
              { id: 'notes', label: 'Notes', icon: 'file-text' }
            ]
          },
          {
            id: 'utilities',
            label: 'Utilities',
            options: [
              { id: 'backup', label: 'Backup', icon: 'archive' },
              { id: 'restore', label: 'Restore', icon: 'refresh-cw' },
              { id: 'divider-utilities', label: '', divider: true },
              { id: 'cleanup', label: 'Cleanup', icon: 'trash-2' }
            ]
          }
        ]}"
        cascade-direction="left"
        cascade-delay="200">
        <nr-button slot="trigger" size="small">← Left Cascade</nr-button>
      </nr-dropdown>

      <!-- Auto Cascade -->
      <nr-dropdown 
        .items="${[
          {
            id: 'recent',
            label: 'Recent Files',
            options: [
              { id: 'doc1', label: 'Document 1.pdf' },
              { id: 'doc2', label: 'Presentation.pptx' },
              { id: 'doc3', label: 'Spreadsheet.xlsx' }
            ]
          },
          {
            id: 'templates',
            label: 'Templates',
            options: [
              { id: 'letter', label: 'Letter Template' },
              { id: 'invoice', label: 'Invoice Template' },
              { id: 'report', label: 'Report Template' }
            ]
          }
        ]}"
        cascade-direction="auto"
        cascade-delay="200">
        <nr-button slot="trigger" size="small">↕ Auto Cascade</nr-button>
      </nr-dropdown>

      <!-- Right Cascade -->
      <nr-dropdown 
        .items="${[
          {
            id: 'export',
            label: 'Export',
            options: [
              { id: 'pdf', label: 'Export as PDF', icon: 'file' },
              { id: 'word', label: 'Export as Word', icon: 'file-text' },
              { id: 'divider-export', label: '', divider: true },
              { id: 'excel', label: 'Export as Excel', icon: 'grid' }
            ]
          },
          {
            id: 'share',
            label: 'Share',
            options: [
              { id: 'email', label: 'Send via Email', icon: 'mail' },
              { id: 'link', label: 'Copy Link', icon: 'link' },
              { id: 'divider-share', label: '', divider: true },
              { id: 'embed', label: 'Embed Code', icon: 'code' }
            ]
          }
        ]}"
        cascade-direction="right"
        cascade-delay="200">
        <nr-button slot="trigger" size="small">Right Cascade →</nr-button>
      </nr-dropdown>
    </div>
  `,
};

/**
 * Cascading dropdown with click interaction.
 * Demonstrates cascading behavior when hover is disabled.
 */
export const CascadingClickOnly: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Cascading dropdown with click-only interaction. Submenus only open when clicked, not on hover.',
      },
    },
  },
  render: (args) => html`
    <nr-dropdown 
      .items="${[
        {
          id: 'development',
          label: 'Development',
          icon: 'code',
          options: [
            { id: 'frontend', label: 'Frontend', icon: 'monitor' },
            { id: 'backend', label: 'Backend', icon: 'server' },
            { id: 'mobile', label: 'Mobile', icon: 'smartphone' },
            { id: 'devops', label: 'DevOps', icon: 'cloud' }
          ]
        },
        {
          id: 'design',
          label: 'Design',
          icon: 'palette',
          options: [
            { id: 'ui', label: 'UI Design', icon: 'layout' },
            { id: 'ux', label: 'UX Research', icon: 'search' },
            { id: 'graphics', label: 'Graphics', icon: 'image' },
            { id: 'branding', label: 'Branding', icon: 'tag' }
          ]
        },
        {
          id: 'marketing',
          label: 'Marketing',
          icon: 'megaphone',
          options: [
            { id: 'social', label: 'Social Media', icon: 'share-2' },
            { id: 'email', label: 'Email Campaigns', icon: 'mail' },
            { id: 'seo', label: 'SEO', icon: 'trending-up' },
            { id: 'content', label: 'Content', icon: 'file-text' }
          ]
        }
      ]}"
      cascade-direction="right"
      cascade-delay="300"
      ?cascade-on-hover="${false}">
      <nr-button slot="trigger" >
        <nr-icon name="menu" slot="prefix"></nr-icon>
        Services (Click)
      </nr-button>
    </nr-dropdown>
  `,
  args: {
    cascadeOnHover: false,
  },
};

/**
 * Cascading dropdown with custom content in submenus.
 * Demonstrates using customContent property for complex submenu layouts.
 */
export const CascadingCustomContent: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Cascading dropdown with custom HTML content in submenus. Useful for forms, complex layouts, or rich content that goes beyond simple menu items.',
      },
    },
  },
  render: (args) => html`
    <nr-dropdown 
      .items="${[
        {
          id: 'user-profile',
          label: 'User Profile',
          icon: 'user',
          customContent: `
            <div style="padding: 12px; min-width: 250px;">
              <h4 style="margin: 0 0 8px 0; color: #333;">John Doe</h4>
              <p style="margin: 0 0 12px 0; color: #666; font-size: 0.875rem;">john.doe@example.com</p>
              <div style="margin-bottom: 12px;">
                <button type="button" style="width: 100%; padding: 8px; margin-bottom: 6px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Edit Profile</button>
                <button type="button" style="width: 100%; padding: 8px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Account Settings</button>
              </div>
            </div>
          `
        },
        {
          id: 'search',
          label: 'Advanced Search',
          icon: 'search',
          customContent: `
            <div style="padding: 16px; min-width: 280px;">
              <h4 style="margin: 0 0 12px 0;">Search Options</h4>
              <div style="margin-bottom: 12px;">
                <label style="display: block; margin-bottom: 4px; font-size: 0.875rem;">Search in:</label>
                <select style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;">
                  <option>All Files</option>
                  <option>Documents</option>
                  <option>Images</option>
                  <option>Videos</option>
                </select>
              </div>
              <div style="margin-bottom: 12px;">
                <label style="display: block; margin-bottom: 4px; font-size: 0.875rem;">Keywords:</label>
                <input type="text" placeholder="Enter keywords..." style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
              </div>
              <button type="button" style="width: 100%; padding: 8px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Search</button>
            </div>
          `
        },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: 'bell',
          customContent: `
            <div style="padding: 12px; min-width: 300px; max-height: 250px; overflow-y: auto;">
              <h4 style="margin: 0 0 12px 0;">Recent Notifications</h4>
              <div style="border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 8px;">
                <div style="font-weight: 500; font-size: 0.875rem;">New message received</div>
                <div style="color: #666; font-size: 0.75rem;">2 minutes ago</div>
              </div>
              <div style="border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 8px;">
                <div style="font-weight: 500; font-size: 0.875rem;">File upload completed</div>
                <div style="color: #666; font-size: 0.75rem;">15 minutes ago</div>
              </div>
              <div style="border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 8px;">
                <div style="font-weight: 500; font-size: 0.875rem;">System maintenance scheduled</div>
                <div style="color: #666; font-size: 0.75rem;">1 hour ago</div>
              </div>
              <div style="text-align: center; margin-top: 12px;">
                <button type="button" style="padding: 6px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem;">View All</button>
              </div>
            </div>
          `
        },
        { id: 'divider1', label: '', divider: true },
        {
          id: 'calculator',
          label: 'Quick Calculator',
          icon: 'calculator',
          customContent: `
            <div style="padding: 16px; min-width: 200px;">
              <h4 style="margin: 0 0 12px 0;">Calculator</h4>
              <input type="text" id="calc-display" readonly style="width: 100%; padding: 8px; margin-bottom: 8px; text-align: right; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px;">
                <button onclick="document.getElementById('calc-display').value=''" style="padding: 8px; border: 1px solid #ddd; background: #f8f9fa; cursor: pointer;">C</button>
                <button onclick="document.getElementById('calc-display').value+='/'" style="padding: 8px; border: 1px solid #ddd; background: #f8f9fa; cursor: pointer;">÷</button>
                <button onclick="document.getElementById('calc-display').value+='*'" style="padding: 8px; border: 1px solid #ddd; background: #f8f9fa; cursor: pointer;">×</button>
                <button onclick="document.getElementById('calc-display').value=document.getElementById('calc-display').value.slice(0,-1)" style="padding: 8px; border: 1px solid #ddd; background: #f8f9fa; cursor: pointer;">⌫</button>
                <button onclick="document.getElementById('calc-display').value+='7'" style="padding: 8px; border: 1px solid #ddd; background: white; cursor: pointer;">7</button>
                <button onclick="document.getElementById('calc-display').value+='8'" style="padding: 8px; border: 1px solid #ddd; background: white; cursor: pointer;">8</button>
                <button onclick="document.getElementById('calc-display').value+='9'" style="padding: 8px; border: 1px solid #ddd; background: white; cursor: pointer;">9</button>
                <button onclick="document.getElementById('calc-display').value+='-'" style="padding: 8px; border: 1px solid #ddd; background: #f8f9fa; cursor: pointer;">-</button>
              </div>
            </div>
          `
        },
        {
          id: 'regular-options',
          label: 'Standard Menu',
          icon: 'menu',
          options: [
            { id: 'option1', label: 'Option 1', icon: 'check' },
            { id: 'option2', label: 'Option 2', icon: 'star' },
            { id: 'divider-regular', label: '', divider: true },
            { id: 'option3', label: 'Option 3', icon: 'heart' }
          ]
        }
      ]}"
      cascade-direction="${args.cascadeDirection}"
      cascade-delay="${args.cascadeDelay}"
      ?cascade-on-hover="${args.cascadeOnHover}">
      <nr-button slot="trigger" type="primary">
        <nr-icon name="layers" slot="prefix"></nr-icon>
        Custom Content Menu
      </nr-button>
    </nr-dropdown>
  `,
  args: {
    cascadeDirection: 'right',
    cascadeDelay: 200,
    cascadeOnHover: true,
  },
};

/**
 * Interactive cascading dropdown with Lit templates.
 * Demonstrates fully interactive custom content with event handlers and state.
 */
export const CascadingInteractive: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Interactive cascading dropdown using Lit templates for fully functional custom content with event handlers, state management, and real interactivity.',
      },
    },
  },
  render: (args) => html`
    <nr-dropdown 
      trigger="hover"
      .items="${[
        {
          id: 'interactive-profile',
          label: 'User Profile',
          icon: 'user',
          customContent: html`
            <div style="padding: 16px; min-width: 280px;">
              <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; margin-right: 12px;">
                  JD
                </div>
                <div>
                  <div style="font-weight: 600; color: #333;">John Doe</div>
                  <div style="font-size: 0.875rem; color: #666;">Senior Developer</div>
                </div>
              </div>
              <div style="background: #f8f9fa; padding: 8px; border-radius: 4px; margin-bottom: 12px; font-size: 0.875rem;">
                <strong>Status:</strong> <span style="color: #28a745;">● Online</span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <nr-button size="small" type="primary" @click="${() => alert('Edit Profile clicked!')}">
                  Edit Profile
                </nr-button>
                <nr-button size="small" type="secondary" @click="${() => alert('Settings clicked!')}">
                  Settings
                </nr-button>
              </div>
              <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #eee;">
                <nr-button size="small" style="width: 100%;" @click="${() => alert('Logout clicked!')}">
                  <nr-icon name="log-out" slot="prefix"></nr-icon>
                  Sign Out
                </nr-button>
              </div>
            </div>
          `
        },
        {
          id: 'interactive-form',
          label: 'Contact Form',
          icon: 'mail',
          customContent: html`
            <div style="padding: 16px; min-width: 300px;">
              <h4 style="margin: 0 0 12px 0;">Quick Contact</h4>
              <div style="margin-bottom: 12px;">
                <label style="display: block; margin-bottom: 4px; font-size: 0.875rem; font-weight: 500;">Name:</label>
                <input 
                  type="text" 
                  id="contact-name"
                  placeholder="Your name" 
                  style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;"
                >
              </div>
              <div style="margin-bottom: 12px;">
                <label style="display: block; margin-bottom: 4px; font-size: 0.875rem; font-weight: 500;">Email:</label>
                <input 
                  type="email" 
                  id="contact-email"
                  placeholder="your@email.com" 
                  style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;"
                >
              </div>
              <div style="margin-bottom: 12px;">
                <label style="display: block; margin-bottom: 4px; font-size: 0.875rem; font-weight: 500;">Message:</label>
                <textarea 
                  id="contact-message"
                  placeholder="Your message..." 
                  rows="3"
                  style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical; box-sizing: border-box;"
                ></textarea>
              </div>
              <div style="display: flex; gap: 8px;">
                <nr-button size="small" type="primary" style="flex: 1;" @click="${() => {
                  const nameEl = document.querySelector('#contact-name') as HTMLInputElement;
                  const emailEl = document.querySelector('#contact-email') as HTMLInputElement;
                  const messageEl = document.querySelector('#contact-message') as HTMLTextAreaElement;
                  const name = nameEl?.value || '';
                  const email = emailEl?.value || '';
                  const message = messageEl?.value || '';
                  if (name && email && message) {
                    alert('Message sent from: ' + name + ' (' + email + ')\\nMessage: ' + message);
                    if (nameEl) nameEl.value = '';
                    if (emailEl) emailEl.value = '';
                    if (messageEl) messageEl.value = '';
                  } else {
                    alert('Please fill in all fields');
                  }
                }}">
                  <nr-icon name="send" slot="prefix"></nr-icon>
                  Send
                </nr-button>
                <nr-button size="small" type="secondary" @click="${() => {
                  const nameEl = document.querySelector('#contact-name') as HTMLInputElement;
                  const emailEl = document.querySelector('#contact-email') as HTMLInputElement;
                  const messageEl = document.querySelector('#contact-message') as HTMLTextAreaElement;
                  if (nameEl) nameEl.value = '';
                  if (emailEl) emailEl.value = '';
                  if (messageEl) messageEl.value = '';
                }}">
                  Clear
                </nr-button>
              </div>
            </div>
          `
        }
      ] as DropdownItem[]}"
      cascade-direction="${args.cascadeDirection}"
      cascade-delay="${args.cascadeDelay}"
      ?cascade-on-hover="${args.cascadeOnHover}"
      ?auto-close="${args.autoClose}"
      ?close-on-outside-click="${args.closeOnOutsideClick}">
      <nr-button slot="trigger" type="primary">
        <nr-icon name="zap" slot="prefix"></nr-icon>
        Interactive Menu
      </nr-button>
    </nr-dropdown>
  `,
  args: {
    cascadeDirection: 'right',
    cascadeDelay: 200,
    cascadeOnHover: true,
    autoClose: false,
    closeOnOutsideClick: false,
  },
};