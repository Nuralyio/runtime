import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './index.js';
import '../../shared/themes/carbon/index.css';
import '../../shared/themes/default/index.css';
import '../icon/index.js';
import '../dropdown/index.js';
import '../card/index.js';
import type { IMenu } from './menu.types.js';

/**
 * ## Menu
 * 
 * The Menu component provides hierarchical navigation with support for nested submenus, icons, 
 * status indicators, and interactive actions. It's designed for building side navigation, 
 * context menus, and complex menu structures.
 * 
 * ### When to use
 * - Use menus for navigation in applications with hierarchical structure
 * - Use for organizing related actions and commands
 * - Use when you need nested navigation with multiple levels
 * - Use when items need status indicators or contextual actions
 * 
 * ### When not to use
 * - Do not use for simple lists without hierarchy - use a list component instead
 * - Do not use for form selections - use select or dropdown instead
 * - Do not use for primary navigation on small screens - consider tabs or bottom navigation
 * 
 * ### Features
 * - **Hierarchical Structure**: Support for nested submenus with unlimited depth
 * - **Icons**: Optional icons for visual hierarchy and recognition
 * - **Status Indicators**: Show status with icon and label
 * - **Contextual Actions**: Dropdown actions for each menu item
 * - **Selection State**: Visual indication of selected items
 * - **Disabled State**: Individual items can be disabled
 * - **Theme Support**: Works with Carbon and Default design systems
 */
const meta: Meta = {
  title: 'Navigation/Menu',
  component: 'nr-menu',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile menu component for hierarchical navigation with support for nested submenus, icons, status indicators, and contextual actions. Perfect for side navigation, settings menus, and complex navigation structures.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: { type: 'object' },
      description: 'Array of menu items with support for nested children',
      table: {
        category: 'Data',
        type: { 
          summary: 'IMenu[]',
          detail: `{
  text: string;
  link?: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
  selected?: boolean;
  disabled?: boolean;
  menu?: { icon: string; actions: IAction[] };
  status?: { icon: string; label: string };
  children?: IMenu[];
}`
        },
      },
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Menu size variant - controls padding and spacing',
      table: {
        category: 'Appearance',
        type: { summary: 'string' },
        defaultValue: { summary: 'medium' },
      },
    },
  },
  args: {
    items: [],
    size: 'medium',
  },
};

export default meta;
type Story = StoryObj;

// Sample menu data
const simpleMenuItems: IMenu[] = [
  { text: 'Home', icon: 'home', selected: true },
  { text: 'Dashboard', icon: 'dashboard' },
  { text: 'Settings', icon: 'settings' },
  { text: 'Profile', icon: 'user' },
  { text: 'Logout', icon: 'sign-out' },
];

const menuWithIcons: IMenu[] = [
  { text: 'Dashboard', icon: 'dashboard', selected: true },
  { text: 'Analytics', icon: 'chart-line' },
  { text: 'Reports', icon: 'file-alt' },
  { text: 'Team', icon: 'users' },
  { text: 'Settings', icon: 'cog' },
];

const nestedMenuItems: IMenu[] = [
  { text: 'Dashboard', icon: 'dashboard', selected: true },
  {
    text: 'Products',
    icon: 'shopping-bag',
    children: [
      { text: 'All Products', link: '/products' },
      {
        text: 'Electronics',
        children: [
          { text: 'Phones', link: '/products/electronics/phones' },
          { text: 'Laptops', link: '/products/electronics/laptops' },
          { text: 'Tablets', link: '/products/electronics/tablets' },
        ],
      },
      {
        text: 'Clothing',
        children: [
          { text: 'Men', link: '/products/clothing/men' },
          { text: 'Women', link: '/products/clothing/women' },
          { text: 'Kids', link: '/products/clothing/kids' },
        ],
      },
      { text: 'Home & Garden', link: '/products/home' },
    ],
  },
  {
    text: 'Orders',
    icon: 'shopping-cart',
    children: [
      { text: 'All Orders', link: '/orders' },
      { text: 'Pending', link: '/orders/pending' },
      { text: 'Completed', link: '/orders/completed' },
      { text: 'Cancelled', link: '/orders/cancelled' },
    ],
  },
  { text: 'Customers', icon: 'users', link: '/customers' },
  { text: 'Settings', icon: 'cog', link: '/settings' },
];

const menuWithStatus: IMenu[] = [
  {
    text: 'Dashboard',
    icon: 'dashboard',
    selected: true,
    status: { icon: 'check-circle', label: 'Active' },
  },
  {
    text: 'Projects',
    icon: 'folder',
    status: { icon: 'clock', label: '3 pending' },
    children: [
      { text: 'Active Projects', link: '/projects/active' },
      { text: 'Archived', link: '/projects/archived' },
    ],
  },
  {
    text: 'Reports',
    icon: 'chart-bar',
    status: { icon: 'exclamation-triangle', label: 'Alert' },
  },
  {
    text: 'Messages',
    icon: 'envelope',
    status: { icon: 'bell', label: '5 new' },
  },
];

const menuWithActions: IMenu[] = [
  {
    text: 'Project Alpha',
    icon: 'folder',
    selected: true,
    menu: {
      icon: 'ellipsis-v',
      actions: [
        { label: 'Rename', value: 'rename' },
        { label: 'Share', value: 'share' },
        { label: 'Archive', value: 'archive' },
        { label: 'Delete', value: 'delete' },
      ],
    },
  },
  {
    text: 'Project Beta',
    icon: 'folder',
    menu: {
      icon: 'ellipsis-v',
      actions: [
        { label: 'Open', value: 'open' },
        { label: 'Duplicate', value: 'duplicate' },
        { label: 'Export', value: 'export' },
      ],
    },
  },
  {
    text: 'Documentation',
    icon: 'book',
    children: [
      {
        text: 'Getting Started',
        menu: {
          icon: 'ellipsis-v',
          actions: [
            { label: 'Edit', value: 'edit' },
            { label: 'Download', value: 'download' },
          ],
        },
      },
      { text: 'API Reference' },
      { text: 'Examples' },
    ],
  },
];

const menuWithDisabled: IMenu[] = [
  { text: 'Available Feature', icon: 'check-circle' },
  { text: 'Coming Soon', icon: 'clock', disabled: true },
  { text: 'Beta Feature', icon: 'flask' },
  {
    text: 'Advanced',
    icon: 'cog',
    children: [
      { text: 'Settings', link: '/settings' },
      { text: 'Premium Only', disabled: true },
      { text: 'API Access', link: '/api' },
    ],
  },
  { text: 'Deprecated', icon: 'ban', disabled: true },
];

const complexMenu: IMenu[] = [
  {
    text: 'Dashboard',
    icon: 'home',
    selected: true,
    status: { icon: 'check-circle', label: 'Online' },
  },
  {
    text: 'Workspace',
    icon: 'briefcase',
    menu: {
      icon: 'ellipsis-v',
      actions: [
        { label: 'Rename Workspace', value: 'rename' },
        { label: 'Workspace Settings', value: 'settings' },
        { label: 'Delete Workspace', value: 'delete' },
      ],
    },
    children: [
      {
        text: 'Projects',
        icon: 'folder-open',
        status: { icon: 'clock', label: '3 active' },
        children: [
          { text: 'Website Redesign', link: '/projects/1' },
          { text: 'Mobile App', link: '/projects/2' },
          { text: 'API Development', link: '/projects/3', disabled: true },
        ],
      },
      {
        text: 'Team',
        icon: 'users',
        status: { icon: 'user', label: '12 members' },
        children: [
          { text: 'Developers', link: '/team/dev' },
          { text: 'Designers', link: '/team/design' },
          { text: 'Managers', link: '/team/mgmt' },
        ],
      },
      {
        text: 'Files',
        icon: 'file',
        menu: {
          icon: 'ellipsis-v',
          actions: [
            { label: 'Upload', value: 'upload' },
            { label: 'Create Folder', value: 'create-folder' },
            { label: 'Sync', value: 'sync' },
          ],
        },
      },
    ],
  },
  {
    text: 'Analytics',
    icon: 'chart-line',
    status: { icon: 'arrow-up', label: '+12%' },
    children: [
      { text: 'Overview', link: '/analytics/overview' },
      { text: 'Traffic', link: '/analytics/traffic' },
      { text: 'Conversions', link: '/analytics/conversions' },
      { text: 'Reports', link: '/analytics/reports' },
    ],
  },
  {
    text: 'Settings',
    icon: 'cog',
    children: [
      { text: 'Profile', link: '/settings/profile' },
      { text: 'Preferences', link: '/settings/preferences' },
      { text: 'Security', link: '/settings/security' },
      { text: 'Billing', link: '/settings/billing', disabled: true },
    ],
  },
];

/**
 * Default menu with simple items
 */
export const Default: Story = {
  args: {
    items: simpleMenuItems,
  },
  render: (args) => html`
    <div style="width: 300px;">
      <nr-menu .items=${args.items}></nr-menu>
    </div>
  `,
};

/**
 * Menu with icons for better visual hierarchy
 */
export const WithIcons: Story = {
  args: {
    items: menuWithIcons,
  },
  render: (args) => html`
    <div style="width: 300px;">
      <nr-menu .items=${args.items}></nr-menu>
    </div>
  `,
};

/**
 * Nested menu with multiple levels of hierarchy
 */
export const NestedMenu: Story = {
  args: {
    items: nestedMenuItems,
  },
  render: (args) => html`
    <div style="width: 350px;">
      <nr-menu .items=${args.items}></nr-menu>
    </div>
  `,
};

/**
 * Menu items with status indicators
 */
export const WithStatus: Story = {
  args: {
    items: menuWithStatus,
  },
  render: (args) => html`
    <div style="width: 350px;">
      <nr-menu .items=${args.items}></nr-menu>
    </div>
  `,
};

/**
 * Menu items with contextual actions dropdown
 */
export const WithActions: Story = {
  args: {
    items: menuWithActions,
  },
  render: (args) => html`
    <div style="width: 350px;">
      <nr-menu 
        .items=${args.items}
        @action-click=${(e: CustomEvent) => {
          console.log('Action clicked:', e.detail);
          alert(`Action: ${e.detail.value} on item at path: ${e.detail.path.join(' > ')}`);
        }}
      ></nr-menu>
    </div>
  `,
};

/**
 * Menu with disabled items
 */
export const WithDisabled: Story = {
  args: {
    items: menuWithDisabled,
  },
  render: (args) => html`
    <div style="width: 350px;">
      <nr-menu .items=${args.items}></nr-menu>
    </div>
  `,
};

/**
 * Complex menu combining all features
 */
export const ComplexMenu: Story = {
  args: {
    items: complexMenu,
  },
  render: (args) => html`
    <div style="width: 380px;">
      <nr-menu 
        .items=${args.items}
        @change=${(e: CustomEvent) => {
          console.log('Menu selection changed:', e.detail);
        }}
        @action-click=${(e: CustomEvent) => {
          console.log('Action clicked:', e.detail);
        }}
      ></nr-menu>
    </div>
  `,
};

/**
 * Menu without icons (text only)
 */
export const TextOnly: Story = {
  args: {
    items: [
      { text: 'Home', selected: true },
      { text: 'About' },
      { text: 'Services', children: [
        { text: 'Web Development' },
        { text: 'Mobile Apps' },
        { text: 'Consulting' },
      ]},
      { text: 'Contact' },
    ],
  },
  render: (args) => html`
    <div style="width: 300px;">
      <nr-menu .items=${args.items}></nr-menu>
    </div>
  `,
};

/**
 * Menu with Carbon Dark theme
 */
export const CarbonDarkTheme: Story = {
  args: {
    items: complexMenu,
  },
  render: (args) => html`
    <div data-theme="carbon-dark" style="background: #161616; padding: 20px; width: 380px;">
      <nr-menu .items=${args.items}></nr-menu>
    </div>
  `,
};

/**
 * Menu with Carbon Light theme
 */
export const CarbonLightTheme: Story = {
  args: {
    items: complexMenu,
  },
  render: (args) => html`
    <div data-theme="carbon-light" style="background: #f4f4f4; padding: 20px; width: 380px;">
      <nr-menu .items=${args.items}></nr-menu>
    </div>
  `,
};

/**
 * Interactive example with event handling
 */
export const InteractiveExample: Story = {
  args: {
    items: menuWithActions,
  },
  render: (args) => html`
    <div style="width: 400px;">
      <h3 style="margin-top: 0;">Interactive Menu</h3>
      <p style="font-size: 14px; color: #666;">
        Click menu items or use the action buttons. Events are logged to console and shown as alerts.
      </p>
      <nr-menu 
        .items=${args.items}
        @change=${(e: CustomEvent) => {
          console.log('Menu changed:', e.detail);
          const pathStr = e.detail.path.join(' → ');
          alert(`Selected: ${e.detail.value}\nPath: [${pathStr}]`);
        }}
        @action-click=${(e: CustomEvent) => {
          console.log('Action clicked:', e.detail);
          const pathStr = e.detail.path.join(' → ');
          alert(`Action: ${e.detail.value}\nPath: [${pathStr}]`);
        }}
      ></nr-menu>
    </div>
  `,
};

/**
 * Side navigation example
 */
export const SideNavigation: Story = {
  render: () => html`
    <div style="display: flex; height: 600px; border: 1px solid #e0e0e0;">
      <div style="width: 280px; border-right: 1px solid #e0e0e0; background: #f9f9f9;">
        <div style="padding: 16px; border-bottom: 1px solid #e0e0e0;">
          <h2 style="margin: 0; font-size: 18px;">My Application</h2>
        </div>
        <nr-menu 
          .items=${[
            { text: 'Home', icon: 'home', selected: true },
            { text: 'Dashboard', icon: 'dashboard' },
            {
              text: 'Products',
              icon: 'shopping-bag',
              status: { icon: 'circle', label: '24' },
              children: [
                { text: 'All Products' },
                { text: 'Categories' },
                { text: 'Inventory' },
              ],
            },
            {
              text: 'Orders',
              icon: 'shopping-cart',
              status: { icon: 'bell', label: '3 new' },
              children: [
                { text: 'Pending' },
                { text: 'Processing' },
                { text: 'Completed' },
              ],
            },
            { text: 'Customers', icon: 'users' },
            { text: 'Analytics', icon: 'chart-line' },
            { text: 'Settings', icon: 'cog' },
          ]}
        ></nr-menu>
      </div>
      <div style="flex: 1; padding: 24px;">
        <h1 style="margin-top: 0;">Main Content Area</h1>
        <p>This demonstrates a typical side navigation layout.</p>
      </div>
    </div>
  `,
};

/**
 * File browser example
 */
export const FileBrowser: Story = {
  render: () => html`
    <nr-card 
      header="File Browser"
      style="width: 400px;">
      <div slot="content">
        <nr-menu 
          .items=${[
            {
              text: 'Documents',
              icon: 'folder',
              opened: true,
              menu: {
                icon: 'ellipsis-v',
                actions: [
                  { label: 'New File', value: 'new-file' },
                  { label: 'New Folder', value: 'new-folder' },
                  { label: 'Upload', value: 'upload' },
                ],
              },
              children: [
                {
                  text: 'Projects',
                  icon: 'folder',
                  menu: {
                    icon: 'ellipsis-v',
                    actions: [
                      { label: 'Rename', value: 'rename' },
                      { label: 'Share', value: 'share' },
                      { label: 'Delete', value: 'delete' },
                    ],
                  },
                  children: [
                    { text: 'README.md', icon: 'file-alt' },
                    { text: 'index.html', icon: 'file-code' },
                    { text: 'styles.css', icon: 'file-code' },
                  ],
                },
                { text: 'report.pdf', icon: 'file-pdf' },
                { text: 'presentation.pptx', icon: 'file-powerpoint' },
              ],
            },
            {
              text: 'Images',
              icon: 'folder',
              status: { icon: 'images', label: '142' },
              children: [
                { text: 'logo.png', icon: 'file-image' },
                { text: 'banner.jpg', icon: 'file-image' },
              ],
            },
            {
              text: 'Downloads',
              icon: 'folder',
              children: [
                { text: 'setup.exe', icon: 'file' },
                { text: 'data.zip', icon: 'file-archive' },
              ],
            },
          ]}
          @action-click=${(e: CustomEvent) => {
            console.log('File action:', e.detail);
          }}
        ></nr-menu>
      </div>
    </nr-card>
  `,
};

/**
 * Small size menu - compact spacing for dense layouts
 */
export const SmallSize: Story = {
  args: {
    items: menuWithIcons,
  },
  render: (args) => html`
    <div style="width: 300px;">
      <nr-menu .items=${args.items} size="small"></nr-menu>
    </div>
  `,
};

/**
 * Medium size menu (default) - balanced spacing
 */
export const MediumSize: Story = {
  args: {
    items: menuWithIcons,
  },
  render: (args) => html`
    <div style="width: 300px;">
      <nr-menu .items=${args.items} size="medium"></nr-menu>
    </div>
  `,
};

/**
 * Large size menu - generous spacing for better touch targets
 */
export const LargeSize: Story = {
  args: {
    items: menuWithIcons,
  },
  render: (args) => html`
    <div style="width: 300px;">
      <nr-menu .items=${args.items} size="large"></nr-menu>
    </div>
  `,
};

/**
 * Size comparison - all three sizes side by side
 */
export const SizeComparison: Story = {
  args: {
    items: menuWithIcons,
  },
  render: (args) => html`
    <div style="display: flex; gap: 24px;">
      <div>
        <h4 style="margin-top: 0; margin-bottom: 16px;">Small</h4>
        <div style="width: 250px;">
          <nr-menu .items=${args.items} size="small"></nr-menu>
        </div>
      </div>
      <div>
        <h4 style="margin-top: 0; margin-bottom: 16px;">Medium (Default)</h4>
        <div style="width: 250px;">
          <nr-menu .items=${args.items} size="medium"></nr-menu>
        </div>
      </div>
      <div>
        <h4 style="margin-top: 0; margin-bottom: 16px;">Large</h4>
        <div style="width: 250px;">
          <nr-menu .items=${args.items} size="large"></nr-menu>
        </div>
      </div>
    </div>
  `,
};
