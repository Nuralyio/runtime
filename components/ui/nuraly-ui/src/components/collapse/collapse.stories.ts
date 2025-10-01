/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { CollapseSize } from './collapse.type.js';
import './index.js';
import '../button/index.js';
import '../icon/index.js';

const meta: Meta = {
  title: 'Data Display/Collapse',
  component: 'nr-collapse',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Collapse Component

A versatile collapse/accordion component with multiple modes, animations, and customization options.

## Features

- **Multiple modes**: Independent sections or accordion behavior
- **Animations**: Smooth expand/collapse with configurable timing
- **Keyboard navigation**: Full keyboard support with arrow keys
- **Sizes**: Small, medium, and large variants
- **Accessibility**: ARIA compliant with proper focus management

## Events

- \`section-toggled\` - Fired when a section is toggled

## Usage

\`\`\`html
<nr-collapse>
  <!-- Sections are defined via the sections property -->
</nr-collapse>
\`\`\`
        `
      }
    }
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Component size'
    },
    sections: {
      control: 'object',
      description: 'Array of collapse sections'
    }
  },
  args: {
    size: CollapseSize.Medium,
    sections: [
      {
        header: 'Getting Started',
        content: 'This section contains information about getting started with the component library.',
        open: false
      },
      {
        header: 'Configuration',
        content: 'Learn how to configure the components for your specific needs and customize their appearance.',
        open: true
      },
      {
        header: 'Advanced Usage',
        content: 'Explore advanced features and patterns for complex use cases.',
        open: false
      }
    ]
  }
};

export default meta;

type Story = StoryObj;

/**
 * Default collapse with basic sections
 */
export const Default: Story = {
  render: (args) => {
    const handleSectionToggled = (e: CustomEvent) => {
      console.log('Section toggled:', e.detail);
    };

    return html`
      <nr-collapse
        .sections=${args.sections}
        .size=${args.size}
        @section-toggled=${handleSectionToggled}
      ></nr-collapse>
    `;
  }
};

/**
 * Small size variant
 */
export const Small: Story = {
  args: {
    size: CollapseSize.Small,
    sections: [
      {
        header: 'Compact Section 1',
        content: 'Small size for dense layouts.',
        open: true
      },
      {
        header: 'Compact Section 2',
        content: 'Another section with minimal padding.',
        open: false
      }
    ]
  },
  render: Default.render
};

/**
 * Large size variant
 */
export const Large: Story = {
  args: {
    size: CollapseSize.Large,
    sections: [
      {
        header: 'Spacious Section 1',
        content: 'Large size for prominent content areas with generous spacing.',
        open: true
      },
      {
        header: 'Spacious Section 2',
        content: 'Another section with more comfortable padding.',
        open: false
      }
    ]
  },
  render: Default.render
};

/**
 * With disabled sections
 */
export const WithDisabledSections: Story = {
  args: {
    sections: [
      {
        header: 'Available Section',
        content: 'This section is enabled and can be toggled.',
        open: false
      },
      {
        header: 'Unavailable Section',
        content: 'This content is not accessible.',
        open: false,
        collapsible: false
      },
      {
        header: 'Another Available Section',
        content: 'This section is also enabled and interactive.',
        open: true
      }
    ]
  },
  render: Default.render
};

/**
 * FAQ example with multiple sections
 */
export const FAQ: Story = {
  args: {
    sections: [
      {
        header: 'What is this component library?',
        content: 'This is a hybrid UI library that works with both web components and React, providing consistent design and functionality across different frameworks.',
        open: false
      },
      {
        header: 'How do I install it?',
        content: 'You can install the library via npm: npm install @nuralyui/library. Make sure you have Node.js version 16 or higher.',
        open: false
      },
      {
        header: 'Is it production ready?',
        content: 'Yes, all components are thoroughly tested and follow accessibility guidelines. We use them in production applications.',
        open: false
      },
      {
        header: 'Can I customize the themes?',
        content: 'Absolutely! The library supports custom themes through CSS variables. You can override any theme variable to match your brand.',
        open: true
      },
      {
        header: 'What browsers are supported?',
        content: 'We support all modern browsers including Chrome, Firefox, Safari, and Edge. IE11 is not supported.',
        open: false
      }
    ]
  },
  render: Default.render
};

/**
 * Interactive example with external controls
 */
export const Interactive: Story = {
  render: () => {
    const sections = [
      {
        header: 'Dynamic Content 1',
        content: 'This content can be modified programmatically.',
        open: false
      },
      {
        header: 'Dynamic Content 2',
        content: 'The collapse state is managed externally.',
        open: false
      },
      {
        header: 'Dynamic Content 3',
        content: 'Events are logged to the console for debugging.',
        open: false
      }
    ];

    const handleToggleFirst = () => {
      const collapse = document.querySelector('#interactive-collapse') as any;
      if (collapse) {
        collapse.toggleSection(0);
      }
    };

    const handleToggleAll = () => {
      const collapse = document.querySelector('#interactive-collapse') as any;
      if (collapse) {
        // Use the component's toggle methods instead of direct property manipulation
        const firstSection = collapse.sections[0];
        if (firstSection.open) {
          // Close all sections
          collapse.sections.forEach((_: any, index: number) => {
            if (collapse.sections[index].open) {
              collapse.toggleSection(index);
            }
          });
        } else {
          // Open all sections
          collapse.sections.forEach((_: any, index: number) => {
            if (!collapse.sections[index].open) {
              collapse.toggleSection(index);
            }
          });
        }
      }
    };

    return html`
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="display: flex; gap: 1rem;">
          <nr-button @click=${handleToggleFirst}>Toggle First Section</nr-button>
          <nr-button @click=${handleToggleAll} variant="outline">Toggle All</nr-button>
        </div>
        
        <nr-collapse
          id="interactive-collapse"
          .sections=${sections}
          @section-toggled=${(e: CustomEvent) => console.log('Section toggled:', e.detail)}
        ></nr-collapse>
      </div>
    `;
  }
};

/**
 * Single section example with rich content
 */
export const SingleSection: Story = {
  render: () => {
    const sections = [
      {
        header: 'Single Expandable Section',
        content: html`
          <div>
            <p>This is a single section with rich content.</p>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
              <li>Item 3</li>
            </ul>
            <p>You can include any HTML content here.</p>
          </div>
        `,
        open: true
      }
    ];

    return html`
      <nr-collapse
        .sections=${sections}
        @section-toggled=${(e: CustomEvent) => console.log('Section toggled:', e.detail)}
      ></nr-collapse>
    `;
  }
};

/**
 * Rich content examples with HTML and components
 */
export const RichContent: Story = {
  render: () => {
    const sections = [
      {
        id: 'rich-1',
        header: html`
          <div style="display: flex; align-items: center; gap: 8px;">
            <nr-icon name="star" style="color: #f39c12;"></nr-icon>
            <span>Rich Header with Icon</span>
            <span style="background: #e74c3c; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px;">New</span>
          </div>
        `,
        content: html`
          <div style="padding: 16px; background: #f8f9fa; border-radius: 8px;">
            <h4 style="margin: 0 0 12px 0; color: #2c3e50;">Interactive Content Example</h4>
            <p>This section contains rich HTML content with interactive elements:</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0;">
              <div style="padding: 12px; background: white; border-radius: 6px; border: 1px solid #e9ecef;">
                <h5 style="margin: 0 0 8px 0;">Quick Stats</h5>
                <ul style="margin: 0; padding-left: 16px;">
                  <li>Total Users: <strong>1,234</strong></li>
                  <li>Active Sessions: <strong>456</strong></li>
                  <li>Growth Rate: <strong style="color: #28a745;">+12%</strong></li>
                </ul>
              </div>
              
              <div style="padding: 12px; background: white; border-radius: 6px; border: 1px solid #e9ecef;">
                <h5 style="margin: 0 0 8px 0;">Actions</h5>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <button style="width: 100%; padding: 6px 12px; border: none; background: #007bff; color: white; border-radius: 4px; cursor: pointer; font-size: 12px;">View Details</button>
                  <button style="width: 100%; padding: 6px 12px; border: 1px solid #007bff; background: white; color: #007bff; border-radius: 4px; cursor: pointer; font-size: 12px;">Export Data</button>
                </div>
              </div>
            </div>
            
            <div style="margin-top: 16px; padding: 12px; background: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 4px;">
              <p style="margin: 0;"><strong>Pro Tip:</strong> You can include any HTML content, components, forms, images, and interactive elements in collapse sections.</p>
            </div>
          </div>
        `,
        open: true,
        collapsible: true
      },
      {
        id: 'rich-2', 
        header: 'Form Example',
        content: html`
          <div style="padding: 16px;">
            <form @submit=${(e: Event) => { e.preventDefault(); console.log('Form submitted'); }}>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                <div>
                  <label style="display: block; margin-bottom: 4px; font-weight: 500;">Name:</label>
                  <input type="text" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" placeholder="Enter your name">
                </div>
                
                <div>
                  <label style="display: block; margin-bottom: 4px; font-weight: 500;">Email:</label>
                  <input type="email" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" placeholder="Enter your email">
                </div>
                
                <div>
                  <label style="display: block; margin-bottom: 4px; font-weight: 500;">Message:</label>
                  <textarea style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; min-height: 80px;" placeholder="Your message"></textarea>
                </div>
                
                <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px;">
                  <button type="button" style="padding: 8px 16px; border: 1px solid #ccc; background: white; border-radius: 4px; cursor: pointer;">Cancel</button>
                  <button type="submit" style="padding: 8px 16px; border: none; background: #007bff; color: white; border-radius: 4px; cursor: pointer;">Submit</button>
                </div>
              </div>
            </form>
          </div>
        `,
        open: false,
        collapsible: true
      }
    ];

    return html`
      <nr-collapse
        .sections=${sections}
        @section-toggled=${(e: CustomEvent) => console.log('Section toggled:', e.detail)}
      ></nr-collapse>
    `;
  },
  parameters: {
    docs: {
      description: {
        story: 'Example showing rich HTML content, forms, and interactive elements in collapse sections.'
      }
    }
  }
};

/**
 * Using slots for content (alternative to html templates)
 */
export const WithSlots: Story = {
  render: () => {
    const sections = [
      {
        id: 'slot-1',
        header: 'Section with Slotted Header',
        headerSlot: 'header-1',
        content: 'Content using string',
        contentSlot: 'content-1',
        open: true
      },
      {
        id: 'slot-2',
        header: 'Fallback Header',
        content: 'Fallback Content',
        headerSlot: 'header-2',
        contentSlot: 'content-2',
        open: false
      },
      {
        id: 'slot-3',
        header: 'Mixed Content',
        headerSlot: 'header-3',
        content: 'This uses a slot',
        contentSlot: 'content-3',
        open: false
      }
    ];

    return html`
      <nr-collapse .sections=${sections}>
        <!-- Slotted content for section 1 header -->
        <div slot="header-1" style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px;">📋</span>
          <strong>Custom Slotted Header</strong>
          <span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">Active</span>
        </div>
        
        <!-- Slotted content for section 1 content -->
        <div slot="content-1" style="padding: 16px; background: #f0f8ff; border-radius: 8px;">
          <h4 style="margin: 0 0 12px 0;">Slotted Content Example</h4>
          <p>This content is provided via a named slot instead of using <code>html\`\`</code> template literals.</p>
          <ul>
            <li>✅ Works with plain HTML</li>
            <li>✅ Great for server-side rendering</li>
            <li>✅ Easy to use from other frameworks</li>
            <li>✅ No need for lit-html imports</li>
          </ul>
          <button style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Slotted Button
          </button>
        </div>

        <!-- Slotted content for section 2 header -->
        <div slot="header-2" style="color: #6c757d; font-style: italic;">
          🎨 Styled Slot Header
        </div>
        
        <!-- Slotted content for section 2 content -->
        <div slot="content-2">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 16px;">
            <div style="padding: 16px; background: #ffe5e5; border-radius: 8px; text-align: center;">
              <div style="font-size: 32px;">🎯</div>
              <div style="font-weight: bold; margin-top: 8px;">Feature A</div>
            </div>
            <div style="padding: 16px; background: #e5f5ff; border-radius: 8px; text-align: center;">
              <div style="font-size: 32px;">⚡</div>
              <div style="font-weight: bold; margin-top: 8px;">Feature B</div>
            </div>
            <div style="padding: 16px; background: #e5ffe5; border-radius: 8px; text-align: center;">
              <div style="font-size: 32px;">🚀</div>
              <div style="font-weight: bold; margin-top: 8px;">Feature C</div>
            </div>
          </div>
        </div>

        <!-- Slotted content for section 3 header -->
        <span slot="header-3">
          <nr-icon name="folder" style="margin-right: 8px;"></nr-icon>
          Documents & Files
        </span>
        
        <!-- Slotted content for section 3 content -->
        <div slot="content-3" style="padding: 16px;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                <th style="padding: 8px; text-align: left;">File Name</th>
                <th style="padding: 8px; text-align: left;">Size</th>
                <th style="padding: 8px; text-align: left;">Modified</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #e9ecef;">
                <td style="padding: 8px;">📄 document.pdf</td>
                <td style="padding: 8px;">2.4 MB</td>
                <td style="padding: 8px;">2 days ago</td>
              </tr>
              <tr style="border-bottom: 1px solid #e9ecef;">
                <td style="padding: 8px;">📊 spreadsheet.xlsx</td>
                <td style="padding: 8px;">1.8 MB</td>
                <td style="padding: 8px;">5 days ago</td>
              </tr>
              <tr>
                <td style="padding: 8px;">🖼️ image.png</td>
                <td style="padding: 8px;">856 KB</td>
                <td style="padding: 8px;">1 week ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </nr-collapse>
    `;
  },
  parameters: {
    docs: {
      description: {
        story: 'Example using named slots for content instead of html`` templates. This approach works great for plain HTML and integrations with other frameworks.'
      }
    }
  }
};

/**
 * Header right content - add icons, badges, menus, or any custom content to the right side of headers
 */
export const WithHeaderRightContent: Story = {
  render: () => {
    const sections = [
      {
        id: 'header-right-1',
        header: 'Task Management',
        content: html`
          <div style="padding: 16px;">
            <p>Manage your tasks efficiently with our powerful tools.</p>
            <ul>
              <li>Create and organize tasks</li>
              <li>Set priorities and deadlines</li>
              <li>Track progress and completion</li>
            </ul>
          </div>
        `,
        open: true,
        headerRight: html`
          <span style="background: #28a745; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
            Active
          </span>
          <nr-icon name="more-vertical" style="color: #6c757d; cursor: pointer;"></nr-icon>
        `
      },
      {
        id: 'header-right-2',
        header: 'Notifications',
        content: html`
          <div style="padding: 16px;">
            <p><strong>No new notifications</strong></p>
            <p>You're all caught up! Check back later for updates.</p>
          </div>
        `,
        open: false,
        headerRight: html`
          <span style="background: #dc3545; color: white; padding: 4px 8px; border-radius: 50%; font-size: 11px; font-weight: 700; min-width: 20px; text-align: center;">
            3
          </span>
          <nr-icon name="bell" style="color: #ffc107;"></nr-icon>
        `
      },
      {
        id: 'header-right-3',
        header: 'User Settings',
        content: html`
          <div style="padding: 16px;">
            <p>Customize your preferences and account settings.</p>
            <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" checked />
                <span>Email notifications</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" />
                <span>Dark mode</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" checked />
                <span>Auto-save</span>
              </label>
            </div>
          </div>
        `,
        open: false,
        headerRight: html`
          <span style="color: #6c757d; font-size: 12px;">Modified 2h ago</span>
          <nr-icon name="settings" style="color: #6c757d;"></nr-icon>
        `
      },
      {
        id: 'header-right-4',
        header: 'Project Files',
        content: html`
          <div style="padding: 16px;">
            <div style="display: grid; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 6px;">
                <span style="font-size: 24px;">📄</span>
                <div style="flex: 1;">
                  <div style="font-weight: 600;">Project Brief.pdf</div>
                  <div style="font-size: 12px; color: #6c757d;">2.4 MB</div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 6px;">
                <span style="font-size: 24px;">📊</span>
                <div style="flex: 1;">
                  <div style="font-weight: 600;">Report.xlsx</div>
                  <div style="font-size: 12px; color: #6c757d;">1.8 MB</div>
                </div>
              </div>
            </div>
          </div>
        `,
        open: false,
        headerRight: html`
          <div style="display: flex; align-items: center; gap: 6px;">
            <nr-icon name="download" style="color: #007bff; cursor: pointer;" title="Download all"></nr-icon>
            <nr-icon name="share" style="color: #28a745; cursor: pointer;" title="Share"></nr-icon>
            <nr-icon name="trash" style="color: #dc3545; cursor: pointer;" title="Delete"></nr-icon>
          </div>
        `
      }
    ];

    return html`
      <div style="max-width: 800px;">
        <h3>Header Right Content Examples</h3>
        <p style="margin-bottom: 24px; color: #6c757d;">
          Demonstrate various use cases for adding content to the right side of collapse headers.
        </p>
        <nr-collapse .sections=${sections}></nr-collapse>
      </div>
    `;
  },
  parameters: {
    docs: {
      description: {
        story: 'Add custom content to the right side of collapse headers, such as badges, icons, menus, timestamps, or action buttons. The header right content area prevents click events from bubbling up, so interactive elements work independently of the collapse toggle.'
      }
    }
  }
};

/**
 * Header right content with slots - alternative approach using named slots
 */
export const WithHeaderRightSlots: Story = {
  render: () => {
    const sections = [
      {
        id: 'slot-right-1',
        header: 'Account Overview',
        headerRightSlot: 'account-actions',
        content: 'View and manage your account details, billing information, and preferences.',
        open: true
      },
      {
        id: 'slot-right-2',
        header: 'Security Settings',
        headerRightSlot: 'security-actions',
        content: 'Configure two-factor authentication, password requirements, and session management.',
        open: false
      },
      {
        id: 'slot-right-3',
        header: 'API Access',
        headerRightSlot: 'api-actions',
        content: 'Manage API keys, webhooks, and integration settings.',
        open: false
      }
    ];

    return html`
      <div style="max-width: 800px;">
        <h3>Header Right Content with Slots</h3>
        <p style="margin-bottom: 24px; color: #6c757d;">
          Use named slots for header right content - great for server-side rendering or framework integration.
        </p>
        
        <nr-collapse .sections=${sections}>
          <!-- Slotted header right content for Account Overview -->
          <div slot="account-actions" style="display: flex; align-items: center; gap: 8px;">
            <span style="background: #007bff; color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">
              Premium
            </span>
            <button style="padding: 4px 12px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; cursor: pointer; font-size: 12px;">
              Edit
            </button>
          </div>

          <!-- Slotted header right content for Security Settings -->
          <div slot="security-actions" style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #28a745; font-size: 20px;" title="Protected">🔒</span>
            <span style="background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">
              Enabled
            </span>
          </div>

          <!-- Slotted header right content for API Access -->
          <div slot="api-actions" style="display: flex; align-items: center; gap: 8px;">
            <span style="background: #6c757d; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px;">
              2 Keys
            </span>
            <button style="padding: 4px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
              + New Key
            </button>
          </div>
        </nr-collapse>
      </div>
    `;
  },
  parameters: {
    docs: {
      description: {
        story: 'Use named slots (`headerRightSlot`) for header right content. This approach is ideal when working with plain HTML, server-side rendering, or integrating with other frameworks.'
      }
    }
  }
};