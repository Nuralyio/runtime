import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './index.js';
import '../icon/index.js';

/**
 * ## Breadcrumb
 * 
 * Display the current location within a hierarchy and allow navigation back to higher levels.
 * Breadcrumbs show where you are in the site structure and make it easy to navigate up the hierarchy.
 * 
 * ### When to use
 * - When the system has more than two layers in a hierarchy
 * - When you need to inform the user of where they are
 * - When the user may need to navigate back to a higher level
 * - To provide quick navigation within a deep site structure
 * 
 * ### When not to use
 * - For single-level navigation - use tabs or menu instead
 * - When the path is not linear or hierarchical
 * - On mobile devices with limited space (consider hamburger menu)
 * 
 * ### Features
 * - Configurable separator styles (slash, arrow, chevron, etc.)
 * - Support for icons alongside text
 * - Dropdown menus for complex hierarchies
 * - Clickable links with href or custom click handlers
 * - RTL support
 * - Fully accessible with keyboard navigation
 * - Theme-aware styling
 */
const meta: Meta = {
  title: 'Navigation/Breadcrumb',
  component: 'nr-breadcrumb',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Breadcrumbs display the current location within a hierarchy and allow users to navigate back to higher levels. They provide context about where users are within an application and enable quick navigation.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: { type: 'object' },
      description: 'Array of breadcrumb items to display',
      table: {
        category: 'Content',
        type: { summary: 'BreadcrumbItem[]' },
      },
    },
    separator: {
      control: { type: 'select' },
      options: ['/', '>', '›', '-', '•'],
      description: 'Separator between breadcrumb items',
      table: {
        category: 'Appearance',
        defaultValue: { summary: '/' },
      },
    },
    separatorConfig: {
      control: { type: 'object' },
      description: 'Custom separator configuration for more control',
      table: {
        category: 'Appearance',
        type: { summary: 'BreadcrumbSeparatorConfig' },
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/**
 * Basic breadcrumb with simple navigation path
 */
export const Default: Story = {
  args: {
    items: [
      { title: 'Home', href: '/' },
      { title: 'Category', href: '/category' },
      { title: 'Product' },
    ],
  },
  render: (args) => html`
    <nr-breadcrumb .items=${args.items}></nr-breadcrumb>
  `,
};

/**
 * Breadcrumb with arrow separator
 */
export const WithArrowSeparator: Story = {
  args: {
    items: [
      { title: 'Home', href: '/' },
      { title: 'Products', href: '/products' },
      { title: 'Electronics', href: '/products/electronics' },
      { title: 'Laptops' },
    ],
    separator: '>',
  },
  render: (args) => html`
    <nr-breadcrumb .items=${args.items} separator=${args.separator}></nr-breadcrumb>
  `,
};

/**
 * Breadcrumb with chevron separator
 */
export const WithChevronSeparator: Story = {
  args: {
    items: [
      { title: 'Dashboard', href: '/dashboard' },
      { title: 'Settings', href: '/settings' },
      { title: 'Profile' },
    ],
    separator: '›',
  },
  render: (args) => html`
    <nr-breadcrumb .items=${args.items} separator=${args.separator}></nr-breadcrumb>
  `,
};

/**
 * Breadcrumb with icons for each item
 */
export const WithIcons: Story = {
  args: {
    items: [
      { title: 'Home', icon: 'home', href: '/' },
      { title: 'Settings', icon: 'settings', href: '/settings' },
      { title: 'Profile', icon: 'user' },
    ],
  },
  render: (args) => html`
    <nr-breadcrumb .items=${args.items}></nr-breadcrumb>
  `,
};

/**
 * Breadcrumb with icon separator
 */
export const WithIconSeparator: Story = {
  args: {
    items: [
      { title: 'Home', href: '/' },
      { title: 'Documents', href: '/documents' },
      { title: 'Projects', href: '/documents/projects' },
      { title: 'Current Project' },
    ],
    separatorConfig: {
      separator: 'chevron-right',
      isIcon: true,
      iconType: 'regular',
    },
  },
  render: (args) => html`
    <nr-breadcrumb .items=${args.items} .separatorConfig=${args.separatorConfig}></nr-breadcrumb>
  `,
};

/**
 * Breadcrumb with dropdown menu for complex navigation
 */
export const WithDropdownMenu: Story = {
  args: {
    items: [
      { title: 'Home', href: '/' },
      {
        title: 'Products',
        href: '/products',
        menu: [
          { label: 'Electronics', href: '/products/electronics' },
          { label: 'Clothing', href: '/products/clothing' },
          { label: 'Books', href: '/products/books' },
          { label: 'Home & Garden', href: '/products/home-garden' },
        ],
      },
      {
        title: 'Electronics',
        href: '/products/electronics',
        menu: [
          { label: 'Computers', href: '/products/electronics/computers' },
          { label: 'Phones', href: '/products/electronics/phones' },
          { label: 'Tablets', href: '/products/electronics/tablets' },
        ],
      },
      { title: 'Laptops' },
    ],
  },
  render: (args) => html`
    <nr-breadcrumb .items=${args.items}></nr-breadcrumb>
  `,
};

/**
 * Breadcrumb with click handlers
 */
export const WithClickHandlers: Story = {
  args: {
    items: [
      {
        title: 'Home',
        onClick: (e: MouseEvent) => {
          e.preventDefault();
          console.log('Home clicked');
        },
      },
      {
        title: 'Category',
        onClick: (e: MouseEvent) => {
          e.preventDefault();
          console.log('Category clicked');
        },
      },
      { title: 'Current Page' },
    ],
  },
  render: (args) => html`
    <nr-breadcrumb 
      .items=${args.items}
      @nr-breadcrumb-click=${(e: CustomEvent) => {
        console.log('Breadcrumb clicked:', e.detail.item);
      }}
    ></nr-breadcrumb>
  `,
};

/**
 * Long breadcrumb path showing many levels
 */
export const LongPath: Story = {
  args: {
    items: [
      { title: 'Home', href: '/' },
      { title: 'Level 1', href: '/level1' },
      { title: 'Level 2', href: '/level1/level2' },
      { title: 'Level 3', href: '/level1/level2/level3' },
      { title: 'Level 4', href: '/level1/level2/level3/level4' },
      { title: 'Level 5', href: '/level1/level2/level3/level4/level5' },
      { title: 'Current Page' },
    ],
  },
  render: (args) => html`
    <nr-breadcrumb .items=${args.items}></nr-breadcrumb>
  `,
};

/**
 * Breadcrumb with disabled items
 */
export const WithDisabledItems: Story = {
  args: {
    items: [
      { title: 'Home', href: '/' },
      { title: 'Disabled Category', href: '/category', disabled: true },
      { title: 'Product' },
    ],
  },
  render: (args) => html`
    <nr-breadcrumb .items=${args.items}></nr-breadcrumb>
  `,
};

/**
 * Minimal breadcrumb with just two items
 */
export const Minimal: Story = {
  args: {
    items: [
      { title: 'Home', href: '/' },
      { title: 'Current Page' },
    ],
  },
  render: (args) => html`
    <nr-breadcrumb .items=${args.items}></nr-breadcrumb>
  `,
};

/**
 * Breadcrumb in Carbon Dark theme
 */
export const CarbonDarkTheme: Story = {
  args: {
    items: [
      { title: 'Home', icon: 'home', href: '/' },
      { title: 'Products', href: '/products' },
      { title: 'Electronics', href: '/products/electronics' },
      { title: 'Laptops' },
    ],
    separator: '>',
  },
  render: (args) => html`
    <div data-theme="carbon-dark" style="padding: 2rem; background: #161616; min-width: 600px;">
      <nr-breadcrumb .items=${args.items} separator=${args.separator}></nr-breadcrumb>
    </div>
  `,
};

/**
 * Breadcrumb in Carbon Light theme
 */
export const CarbonLightTheme: Story = {
  args: {
    items: [
      { title: 'Home', icon: 'home', href: '/' },
      { title: 'Products', href: '/products' },
      { title: 'Electronics', href: '/products/electronics' },
      { title: 'Laptops' },
    ],
    separator: '>',
  },
  render: (args) => html`
    <div data-theme="carbon-light" style="padding: 2rem; background: #ffffff; min-width: 600px;">
      <nr-breadcrumb .items=${args.items} separator=${args.separator}></nr-breadcrumb>
    </div>
  `,
};

/**
 * Multiple breadcrumbs with different separators
 */
export const DifferentSeparators: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1.5rem; min-width: 600px;">
      <div>
        <h4 style="margin: 0 0 0.5rem 0;">Slash Separator (Default)</h4>
        <nr-breadcrumb
          .items=${[
            { title: 'Home', href: '/' },
            { title: 'Category', href: '/category' },
            { title: 'Product' },
          ]}
        ></nr-breadcrumb>
      </div>
      
      <div>
        <h4 style="margin: 0 0 0.5rem 0;">Arrow Separator</h4>
        <nr-breadcrumb
          separator=">"
          .items=${[
            { title: 'Home', href: '/' },
            { title: 'Category', href: '/category' },
            { title: 'Product' },
          ]}
        ></nr-breadcrumb>
      </div>
      
      <div>
        <h4 style="margin: 0 0 0.5rem 0;">Chevron Separator</h4>
        <nr-breadcrumb
          separator="›"
          .items=${[
            { title: 'Home', href: '/' },
            { title: 'Category', href: '/category' },
            { title: 'Product' },
          ]}
        ></nr-breadcrumb>
      </div>
      
      <div>
        <h4 style="margin: 0 0 0.5rem 0;">Dash Separator</h4>
        <nr-breadcrumb
          separator="-"
          .items=${[
            { title: 'Home', href: '/' },
            { title: 'Category', href: '/category' },
            { title: 'Product' },
          ]}
        ></nr-breadcrumb>
      </div>
      
      <div>
        <h4 style="margin: 0 0 0.5rem 0;">Dot Separator</h4>
        <nr-breadcrumb
          separator="•"
          .items=${[
            { title: 'Home', href: '/' },
            { title: 'Category', href: '/category' },
            { title: 'Product' },
          ]}
        ></nr-breadcrumb>
      </div>
    </div>
  `,
};
