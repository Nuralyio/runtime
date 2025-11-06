/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { PanelMode, PanelSize, PanelPosition, MaximizePosition } from './panel.types.js';
import './panel.component.js';
import '../icon/index.js';

const meta: Meta = {
  title: 'Layout/Panel',
  component: 'nr-panel',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Panel Component

A versatile panel component that can transform between docked panel and floating window modes. Perfect for tool palettes, settings panels, chat windows, and any UI that needs flexible positioning.

## Features

- **Dual Mode**: Transform between panel (docked) and window (floating) modes
- **Draggable**: Drag windows around the screen (window mode)
- **Resizable**: Resize panels dynamically with drag handles
- **Collapsible**: Collapse/expand panel content
- **Minimizable**: Minimize to compact view
- **Multiple positions**: Dock to left, right, top, or bottom (panel mode)
- **Size presets**: Small, medium, large, or custom dimensions
- **Theme support**: Light and dark mode compatible
- **Customizable**: Header, footer, and body slots

## Use Cases

- Tool windows and palettes
- Settings panels
- Chat interfaces
- Property inspectors
- Notification centers
- Command palettes
- Documentation viewers

## Best Practices

1. Use **panel mode** for primary navigation or persistent tools
2. Use **window mode** for secondary, non-blocking interfaces
3. Enable **draggable** for windows that users might want to reposition
4. Enable **resizable** when content might vary in size
5. Use **minimize** for temporary panel hiding without losing state
6. Provide clear **titles** for better accessibility
        `
      }
    }
  },
  argTypes: {
    mode: {
      control: 'select',
      options: Object.values(PanelMode),
      description: 'Panel display mode'
    },
    size: {
      control: 'select',
      options: Object.values(PanelSize),
      description: 'Panel size preset'
    },
    position: {
      control: 'select',
      options: Object.values(PanelPosition),
      description: 'Panel position (panel mode only)'
    },
    maximizePosition: {
      control: 'select',
      options: Object.values(MaximizePosition),
      description: 'Position where the window appears when maximizing from embedded mode'
    },
    draggable: {
      control: 'boolean',
      description: 'Whether the panel can be dragged (window mode only)'
    },
    resizable: {
      control: 'boolean',
      description: 'Whether the panel is resizable'
    },
    collapsible: {
      control: 'boolean',
      description: 'Whether the panel content can be collapsed'
    },
    minimizable: {
      control: 'boolean',
      description: 'Whether the panel can be minimized'
    },
    closable: {
      control: 'boolean',
      description: 'Whether the panel can be closed'
    },
    animated: {
      control: 'boolean',
      description: 'Whether to enable smooth animations for position/mode changes'
    },
    title: {
      control: 'text',
      description: 'Panel title'
    },
    icon: {
      control: 'text',
      description: 'Header icon name'
    },
    width: {
      control: 'text',
      description: 'Custom width (CSS value)'
    },
    height: {
      control: 'text',
      description: 'Custom height (CSS value)'
    },
    open: {
      control: 'boolean',
      description: 'Whether the panel is visible'
    }
  }
};

export default meta;
type Story = StoryObj;

/**
 * Default panel docked to the right side
 */
export const Default: Story = {
  args: {
    title: 'Settings Panel',
    icon: 'settings',
    mode: PanelMode.Panel,
    position: PanelPosition.Right,
    size: PanelSize.Medium,
    open: true,
    collapsible: true,
    closable: true
  },
  render: (args) => html`
    <nr-panel
      .mode=${args.mode}
      .position=${args.position}
      .size=${args.size}
      .title=${args.title}
      .icon=${args.icon}
      .open=${args.open}
      .collapsible=${args.collapsible}
      .closable=${args.closable}>
      <div style="padding: 1rem;">
        <h3>Panel Content</h3>
        <p>This is a docked panel that stays attached to the edge of the screen.</p>
        <p>Click the pop-out button to transform it into a floating window.</p>
        
        <div style="margin-top: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem;">
            <input type="checkbox" /> Enable notifications
          </label>
          <label style="display: block; margin-bottom: 0.5rem;">
            <input type="checkbox" checked /> Auto-save
          </label>
          <label style="display: block; margin-bottom: 0.5rem;">
            <input type="checkbox" /> Dark mode
          </label>
        </div>
      </div>
    </nr-panel>
  `
};

/**
 * Floating draggable window
 */
export const FloatingWindow: Story = {
  args: {
    title: 'Tool Window',
    icon: 'tool',
    mode: PanelMode.Window,
    size: PanelSize.Medium,
    draggable: true,
    resizable: false,
    minimizable: true,
    open: true
  },
  render: (args) => html`
    <div style="min-height: 600px; background: #f5f5f5; position: relative;">
      <nr-panel
        .mode=${args.mode}
        .size=${args.size}
        .title=${args.title}
        .icon=${args.icon}
        .draggable=${args.draggable}
        .resizable=${args.resizable}
        .minimizable=${args.minimizable}
        .open=${args.open}>
        <div style="padding: 1rem;">
          <h3>Floating Window</h3>
          <p>This window floats above the content and can be dragged around.</p>
          <p><strong>Try it:</strong> Click and drag the header to move this window!</p>
          
          <div style="margin-top: 1rem; padding: 1rem; background: #e3f2fd; border-radius: 4px;">
            <strong>Window Features:</strong>
            <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
              <li>Drag to reposition</li>
              <li>Minimize to compact view</li>
              <li>Transform to docked panel</li>
              <li>Close when done</li>
            </ul>
          </div>
        </div>
      </nr-panel>
    </div>
  `
};

/**
 * Resizable window with drag handles
 */
export const ResizableWindow: Story = {
  args: {
    title: 'Resizable Panel',
    icon: 'maximize',
    mode: PanelMode.Window,
    size: PanelSize.Medium,
    draggable: true,
    resizable: true,
    open: true
  },
  render: (args) => html`
    <div style="min-height: 700px; background: #f5f5f5; position: relative;">
      <nr-panel
        .mode=${args.mode}
        .size=${args.size}
        .title=${args.title}
        .icon=${args.icon}
        .draggable=${args.draggable}
        .resizable=${args.resizable}
        .open=${args.open}>
        <div style="padding: 1rem;">
          <h3>Resizable Content</h3>
          <p>This panel can be resized by dragging the edges and corners.</p>
          
          <div style="margin-top: 1rem; padding: 1rem; background: #fff3cd; border-radius: 4px;">
            <strong>💡 Resize Tips:</strong>
            <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
              <li>Drag edges to resize in one direction</li>
              <li>Drag corners to resize in both directions</li>
              <li>Look for the resize indicator in the bottom-right corner</li>
            </ul>
          </div>
          
          <div style="margin-top: 1rem;">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          </div>
        </div>
      </nr-panel>
    </div>
  `
};

/**
 * Left-docked panel
 */
export const LeftPanel: Story = {
  args: {
    title: 'Navigation',
    icon: 'menu',
    mode: PanelMode.Panel,
    position: PanelPosition.Left,
    size: PanelSize.Small,
    open: true
  },
  render: (args) => html`
    <nr-panel
      .mode=${args.mode}
      .position=${args.position}
      .size=${args.size}
      .title=${args.title}
      .icon=${args.icon}
      .open=${args.open}>
      <nav style="padding: 1rem;">
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="padding: 0.75rem; margin-bottom: 0.25rem; background: #e3f2fd; border-radius: 4px; cursor: pointer;">
            Dashboard
          </li>
          <li style="padding: 0.75rem; margin-bottom: 0.25rem; cursor: pointer;">
            Projects
          </li>
          <li style="padding: 0.75rem; margin-bottom: 0.25rem; cursor: pointer;">
            Tasks
          </li>
          <li style="padding: 0.75rem; margin-bottom: 0.25rem; cursor: pointer;">
            Calendar
          </li>
          <li style="padding: 0.75rem; margin-bottom: 0.25rem; cursor: pointer;">
            Settings
          </li>
        </ul>
      </nav>
    </nr-panel>
  `
};

/**
 * Top-docked panel
 */
export const TopPanel: Story = {
  args: {
    title: 'Announcements',
    icon: 'bell',
    mode: PanelMode.Panel,
    position: PanelPosition.Top,
    size: PanelSize.Small,
    collapsible: true,
    open: true
  },
  render: (args) => html`
    <nr-panel
      .mode=${args.mode}
      .position=${args.position}
      .size=${args.size}
      .title=${args.title}
      .icon=${args.icon}
      .collapsible=${args.collapsible}
      .open=${args.open}>
      <div style="padding: 1rem;">
        <div style="padding: 1rem; background: #e8f5e9; border-left: 4px solid #4caf50; margin-bottom: 1rem;">
          <strong>System Update</strong>
          <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">New features available! Check the changelog.</p>
        </div>
        <div style="padding: 1rem; background: #fff3cd; border-left: 4px solid #ffc107;">
          <strong>Maintenance Scheduled</strong>
          <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">System will be down on Sunday at 2 AM.</p>
        </div>
      </div>
    </nr-panel>
  `
};

/**
 * Bottom-docked panel
 */
export const BottomPanel: Story = {
  args: {
    title: 'Console Output',
    icon: 'terminal',
    mode: PanelMode.Panel,
    position: PanelPosition.Bottom,
    size: PanelSize.Medium,
    collapsible: true,
    open: true
  },
  render: (args) => html`
    <nr-panel
      .mode=${args.mode}
      .position=${args.position}
      .size=${args.size}
      .title=${args.title}
      .icon=${args.icon}
      .collapsible=${args.collapsible}
      .open=${args.open}>
      <div style="padding: 1rem; font-family: monospace; font-size: 0.875rem; background: #1e1e1e; color: #d4d4d4; height: 100%; overflow-y: auto;">
        <div style="color: #4ec9b0;">[INFO]</div>
        <div>Build started...</div>
        <div>Compiling TypeScript files...</div>
        <div style="color: #4ec9b0;">[SUCCESS]</div>
        <div>Build completed in 2.3s</div>
        <div style="color: #569cd6;">></div>
      </div>
    </nr-panel>
  `
};

/**
 * Chat panel example
 */
export const ChatPanel: Story = {
  args: {
    title: 'Team Chat',
    icon: 'message-circle',
    mode: PanelMode.Panel,
    position: PanelPosition.Right,
    size: PanelSize.Small,
    open: true
  },
  render: (args) => html`
    <nr-panel
      .mode=${args.mode}
      .position=${args.position}
      .size=${args.size}
      .title=${args.title}
      .icon=${args.icon}
      .open=${args.open}>
      <div style="display: flex; flex-direction: column; height: 100%;">
        <div style="flex: 1; padding: 1rem; overflow-y: auto;">
          <div style="margin-bottom: 1rem;">
            <div style="font-weight: 600; font-size: 0.875rem; margin-bottom: 0.25rem;">Alice</div>
            <div style="background: #e3f2fd; padding: 0.75rem; border-radius: 8px; font-size: 0.9rem;">
              Hey team! How's the project going?
            </div>
          </div>
          <div style="margin-bottom: 1rem;">
            <div style="font-weight: 600; font-size: 0.875rem; margin-bottom: 0.25rem;">Bob</div>
            <div style="background: #f3e5f5; padding: 0.75rem; border-radius: 8px; font-size: 0.9rem;">
              Great! Just finished the new panel component.
            </div>
          </div>
          <div style="margin-bottom: 1rem;">
            <div style="font-weight: 600; font-size: 0.875rem; margin-bottom: 0.25rem;">You</div>
            <div style="background: #c8e6c9; padding: 0.75rem; border-radius: 8px; font-size: 0.9rem;">
              Nice work! 🎉
            </div>
          </div>
        </div>
        <div slot="footer">
          <input 
            type="text" 
            placeholder="Type a message..." 
            style="width: 100%; padding: 0.75rem; border: 1px solid #e0e0e0; border-radius: 4px; font-size: 0.9rem;">
        </div>
      </div>
    </nr-panel>
  `
};

/**
 * Custom size panel
 */
export const CustomSize: Story = {
  args: {
    title: 'Custom Dimensions',
    icon: 'box',
    mode: PanelMode.Window,
    size: PanelSize.Custom,
    width: '400px',
    height: '500px',
    draggable: true,
    open: true
  },
  render: (args) => html`
    <div style="min-height: 600px; background: #f5f5f5; position: relative;">
      <nr-panel
        .mode=${args.mode}
        .size=${args.size}
        .width=${args.width}
        .height=${args.height}
        .title=${args.title}
        .icon=${args.icon}
        .draggable=${args.draggable}
        .open=${args.open}>
        <div style="padding: 1rem;">
          <h3>Custom Dimensions</h3>
          <p>This panel has custom width (400px) and height (500px).</p>
          
          <div style="margin-top: 1rem; padding: 1rem; background: #f3e5f5; border-radius: 4px;">
            <strong>Size Control:</strong>
            <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
              <li>Use <code>width</code> and <code>height</code> props</li>
              <li>Supports any CSS unit (px, %, rem, etc.)</li>
              <li>Set <code>size="custom"</code> when using custom dimensions</li>
            </ul>
          </div>
        </div>
      </nr-panel>
    </div>
  `
};

/**
 * Panel with footer actions
 */
export const WithFooter: Story = {
  args: {
    title: 'Confirmation Dialog',
    icon: 'alert-circle',
    mode: PanelMode.Window,
    size: PanelSize.Small,
    draggable: false,
    closable: false,
    open: true
  },
  render: (args) => html`
    <div style="min-height: 500px; background: #f5f5f5; position: relative;">
      <nr-panel
        .mode=${args.mode}
        .size=${args.size}
        .title=${args.title}
        .icon=${args.icon}
        .draggable=${args.draggable}
        .closable=${args.closable}
        .open=${args.open}>
        <div style="padding: 1rem;">
          <p>Are you sure you want to delete this item? This action cannot be undone.</p>
        </div>
        <div slot="footer" style="display: flex; gap: 0.5rem; justify-content: flex-end;">
          <button style="padding: 0.5rem 1rem; border: 1px solid #ccc; background: white; border-radius: 4px; cursor: pointer;">
            Cancel
          </button>
          <button style="padding: 0.5rem 1rem; border: none; background: #d32f2f; color: white; border-radius: 4px; cursor: pointer;">
            Delete
          </button>
        </div>
      </nr-panel>
    </div>
  `
};

/**
 * Interactive playground
 */
export const Playground: Story = {
  args: {
    title: 'Interactive Panel',
    icon: 'grid',
    mode: PanelMode.Window,
    size: PanelSize.Medium,
    position: PanelPosition.Right,
    draggable: true,
    resizable: true,
    collapsible: true,
    minimizable: true,
    closable: true,
    animated: true,
    open: true
  },
  render: (args) => html`
    <div style="min-height: 700px; background: #f5f5f5; position: relative; padding: 2rem;">
      <div style="max-width: 600px; margin-bottom: 2rem; padding: 1rem; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="margin-top: 0;">Panel Playground</h2>
        <p>Use the controls below to experiment with the panel component.</p>
        <p><strong>Current mode:</strong> ${args.mode}</p>
        <p><strong>Features enabled:</strong> 
          ${args.draggable ? '✅ Draggable' : ''}
          ${args.resizable ? '✅ Resizable' : ''}
          ${args.collapsible ? '✅ Collapsible' : ''}
          ${args.minimizable ? '✅ Minimizable' : ''}
        </p>
      </div>
      
      <nr-panel
        .mode=${args.mode}
        .size=${args.size}
        .position=${args.position}
        .title=${args.title}
        .icon=${args.icon}
        .draggable=${args.draggable}
        .resizable=${args.resizable}
        .collapsible=${args.collapsible}
        .minimizable=${args.minimizable}
        .closable=${args.closable}
        .animated=${args.animated}
        .open=${args.open}>
        <div style="padding: 1rem;">
          <h3>Panel Content</h3>
          <p>This is a fully interactive panel. Try all the features!</p>
          
          <div style="margin-top: 1rem;">
            <h4>What to try:</h4>
            <ul>
              <li>Transform between panel and window modes</li>
              <li>Drag the window around (window mode)</li>
              <li>Resize by dragging edges/corners (if enabled)</li>
              <li>Collapse/expand the content</li>
              <li>Minimize to compact view</li>
            </ul>
          </div>
          
          <div style="margin-top: 1rem; padding: 1rem; background: #e8f5e9; border-radius: 4px;">
            <strong>💡 Pro Tip:</strong>
            <p style="margin: 0.5rem 0 0 0;">Use the Storybook controls panel to toggle features on and off!</p>
          </div>
        </div>
      </nr-panel>
    </div>
  `
};

/**
 * Embedded mode: Panel integrated inline with other content that can be maximized to float.
 * Perfect for dashboards, card layouts, or any inline content that needs full-screen capability.
 */
export const EmbeddedPanel: Story = {
  args: {
    title: 'Analytics Dashboard',
    icon: 'bar-chart',
    mode: PanelMode.Embedded,
    collapsible: false,
    closable: false,
    animated: false,
    open: true
  },
  render: (args) => html`
    <div style="padding: 2rem; background: #f5f5f5;">
      <h1 style="margin-top: 0;">Dashboard Example</h1>
      <p>This demonstrates embedded panels that can be maximized to floating windows.</p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 2rem;">
        <!-- Regular card for comparison -->
        <div style="background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 1.5rem;">
          <h3 style="margin-top: 0;">Static Card</h3>
          <p>This is a regular card component for comparison.</p>
          <div style="margin-top: 1rem; padding: 1rem; background: #e3f2fd; border-radius: 4px;">
            <div style="font-size: 2rem; font-weight: bold;">1,234</div>
            <div style="color: #666;">Total Users</div>
          </div>
        </div>
        
        <!-- Embedded panel -->
        <nr-panel
          .mode=${args.mode}
          .title=${args.title}
          .icon=${args.icon}
          .collapsible=${args.collapsible}
          .closable=${args.closable}
          .animated=${args.animated}
          .open=${args.open}
          maximizePosition="center"
          style="margin: 0;">
          <div style="padding: 1rem;">
            <p>This panel is embedded inline but can be maximized! 📊</p>
            <div style="margin-top: 1rem; padding: 1rem; background: #e8f5e9; border-radius: 4px;">
              <div style="font-size: 2rem; font-weight: bold;">5,678</div>
              <div style="color: #666;">Active Sessions</div>
            </div>
            <div style="margin-top: 1rem;">
              <strong>📈 Trend:</strong> +12.5% from last week
            </div>
            <div style="margin-top: 0.5rem; padding: 0.75rem; background: #fff3e0; border-radius: 4px; font-size: 0.875rem;">
              <strong>💡 Tip:</strong> Click the maximize button in the header to expand this panel to a centered window!
            </div>
          </div>
        </nr-panel>
        
        <!-- Another embedded panel with left maximize -->
        <nr-panel
          mode="embedded"
          title="Recent Activity"
          icon="activity"
          collapsible
          maximizePosition="left"
          open
          style="margin: 0;">
          <div style="padding: 1rem;">
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <div style="padding: 0.75rem; background: #f5f5f5; border-radius: 4px;">
                <strong>User Login</strong>
                <div style="font-size: 0.875rem; color: #666; margin-top: 0.25rem;">2 minutes ago</div>
              </div>
              <div style="padding: 0.75rem; background: #f5f5f5; border-radius: 4px;">
                <strong>Data Updated</strong>
                <div style="font-size: 0.875rem; color: #666; margin-top: 0.25rem;">5 minutes ago</div>
              </div>
              <div style="padding: 0.75rem; background: #f5f5f5; border-radius: 4px;">
                <strong>System Backup</strong>
                <div style="font-size: 0.875rem; color: #666; margin-top: 0.25rem;">1 hour ago</div>
              </div>
            </div>
            <div style="margin-top: 1rem; padding: 0.75rem; background: #e3f2fd; border-radius: 4px; font-size: 0.875rem;">
              <strong>💡 Tip:</strong> This panel will maximize to the <strong>left</strong> side!
            </div>
          </div>
        </nr-panel>
        
        <!-- Embedded panel with right maximize -->
        <nr-panel
          mode="embedded"
          title="Quick Stats"
          icon="trending-up"
          collapsible
          maximizePosition="right"
          open
          style="margin: 0;">
          <div style="padding: 1rem;">
            <div style="display: grid; gap: 0.75rem;">
              <div style="padding: 0.75rem; background: #fce4ec; border-radius: 4px;">
                <div style="font-size: 1.5rem; font-weight: bold;">98.5%</div>
                <div style="font-size: 0.875rem; color: #666;">Uptime</div>
              </div>
              <div style="padding: 0.75rem; background: #e8eaf6; border-radius: 4px;">
                <div style="font-size: 1.5rem; font-weight: bold;">2.3s</div>
                <div style="font-size: 0.875rem; color: #666;">Avg Response</div>
              </div>
            </div>
            <div style="margin-top: 1rem; padding: 0.75rem; background: #f3e5f5; border-radius: 4px; font-size: 0.875rem;">
              <strong>💡 Tip:</strong> This panel will maximize to the <strong>right</strong> side!
            </div>
          </div>
        </nr-panel>
      </div>
      <div style="margin-top: 2rem; padding: 1.5rem; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="margin-top: 0;">How it works</h3>
        <ul style="margin-bottom: 0;">
          <li>📍 Embedded panels are positioned <strong>inline</strong> with other content</li>
          <li>🔍 Click the <strong>maximize button</strong> (⬜) to expand to a floating window</li>
          <li>🔄 When maximized, the panel becomes <strong>draggable and resizable</strong></li>
          <li>⬇️ Click the <strong>restore button</strong> (⬛) to return to embedded state</li>
          <li>📌 Set <code>maximizePosition</code> to control where the window appears: center, left, right, top-left, top-right, bottom-left, bottom-right</li>
          <li>✨ Perfect for dashboards, card grids, and inline widgets</li>
        </ul>
      </div>
    </div>
  `
};

/**
 * Small size panel - compact design for sidebars or small widgets
 */
export const SmallSize: Story = {
  args: {
    title: 'Small Panel',
    icon: 'box',
    mode: PanelMode.Window,
    size: PanelSize.Small,
    draggable: true,
    resizable: true,
    closable: true,
    animated: true,
    open: true
  },
  render: (args) => html`
    <div style="min-height: 600px; background: #f5f5f5; position: relative; padding: 2rem;">
      <h2 style="margin-top: 0;">Small Size Panel (320px × 400px)</h2>
      <p>Compact panel perfect for small widgets, notifications, or quick actions.</p>
      
      <nr-panel
        .mode=${args.mode}
        .size=${args.size}
        .title=${args.title}
        .icon=${args.icon}
        .draggable=${args.draggable}
        .resizable=${args.resizable}
        .closable=${args.closable}
        .animated=${args.animated}
        .open=${args.open}>
        <div style="padding: 1rem;">
          <p style="margin-top: 0;">This is a small panel.</p>
          <div style="padding: 0.75rem; background: #e3f2fd; border-radius: 4px; margin-top: 0.5rem;">
            <div style="font-size: 1.5rem; font-weight: bold;">42</div>
            <div style="font-size: 0.75rem; color: #666;">Notifications</div>
          </div>
        </div>
      </nr-panel>
    </div>
  `
};

/**
 * Medium size panel - balanced size for most use cases
 */
export const MediumSize: Story = {
  args: {
    title: 'Medium Panel',
    icon: 'layout',
    mode: PanelMode.Window,
    size: PanelSize.Medium,
    draggable: true,
    resizable: true,
    closable: true,
    animated: true,
    open: true
  },
  render: (args) => html`
    <div style="min-height: 700px; background: #f5f5f5; position: relative; padding: 2rem;">
      <h2 style="margin-top: 0;">Medium Size Panel (480px × 600px)</h2>
      <p>Standard panel size for forms, settings, or content displays.</p>
      
      <nr-panel
        .mode=${args.mode}
        .size=${args.size}
        .title=${args.title}
        .icon=${args.icon}
        .draggable=${args.draggable}
        .resizable=${args.resizable}
        .closable=${args.closable}
        .animated=${args.animated}
        .open=${args.open}>
        <div style="padding: 1rem;">
          <h3 style="margin-top: 0;">Settings</h3>
          <p>This medium-sized panel is perfect for settings or forms.</p>
          <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
            <div style="padding: 1rem; background: #f5f5f5; border-radius: 4px;">
              <strong>Option 1</strong>
              <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #666;">Description for option 1</p>
            </div>
            <div style="padding: 1rem; background: #f5f5f5; border-radius: 4px;">
              <strong>Option 2</strong>
              <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #666;">Description for option 2</p>
            </div>
            <div style="padding: 1rem; background: #f5f5f5; border-radius: 4px;">
              <strong>Option 3</strong>
              <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #666;">Description for option 3</p>
            </div>
          </div>
        </div>
      </nr-panel>
    </div>
  `
};

/**
 * Large size panel - spacious design for complex content or detailed views
 */
export const LargeSize: Story = {
  args: {
    title: 'Large Panel',
    icon: 'maximize',
    mode: PanelMode.Window,
    size: PanelSize.Large,
    draggable: true,
    resizable: true,
    closable: true,
    animated: true,
    open: true
  },
  render: (args) => html`
    <div style="min-height: 900px; background: #f5f5f5; position: relative; padding: 2rem;">
      <h2 style="margin-top: 0;">Large Size Panel (640px × 800px)</h2>
      <p>Spacious panel for complex content, detailed forms, or data displays.</p>
      
      <nr-panel
        .mode=${args.mode}
        .size=${args.size}
        .title=${args.title}
        .icon=${args.icon}
        .draggable=${args.draggable}
        .resizable=${args.resizable}
        .closable=${args.closable}
        .animated=${args.animated}
        .open=${args.open}>
        <div style="padding: 1.5rem;">
          <h3 style="margin-top: 0;">Dashboard Overview</h3>
          <p>This large panel provides plenty of space for complex layouts.</p>
          
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1.5rem;">
            <div style="padding: 1.25rem; background: #e3f2fd; border-radius: 6px;">
              <div style="font-size: 2rem; font-weight: bold;">12.5K</div>
              <div style="font-size: 0.875rem; color: #666; margin-top: 0.25rem;">Total Views</div>
              <div style="font-size: 0.75rem; color: #4caf50; margin-top: 0.5rem;">↑ 12.5% increase</div>
            </div>
            <div style="padding: 1.25rem; background: #e8f5e9; border-radius: 6px;">
              <div style="font-size: 2rem; font-weight: bold;">3.2K</div>
              <div style="font-size: 0.875rem; color: #666; margin-top: 0.25rem;">Active Users</div>
              <div style="font-size: 0.75rem; color: #4caf50; margin-top: 0.5rem;">↑ 8.3% increase</div>
            </div>
            <div style="padding: 1.25rem; background: #fff3e0; border-radius: 6px;">
              <div style="font-size: 2rem; font-weight: bold;">87%</div>
              <div style="font-size: 0.875rem; color: #666; margin-top: 0.25rem;">Completion Rate</div>
              <div style="font-size: 0.75rem; color: #ff9800; margin-top: 0.5rem;">↓ 2.1% decrease</div>
            </div>
            <div style="padding: 1.25rem; background: #fce4ec; border-radius: 6px;">
              <div style="font-size: 2rem; font-weight: bold;">4.8</div>
              <div style="font-size: 0.875rem; color: #666; margin-top: 0.25rem;">Avg Rating</div>
              <div style="font-size: 0.75rem; color: #4caf50; margin-top: 0.5rem;">↑ 0.3 increase</div>
            </div>
          </div>
          
          <div style="margin-top: 1.5rem; padding: 1.25rem; background: white; border-radius: 6px; border: 1px solid #e0e0e0;">
            <h4 style="margin-top: 0;">Recent Activity</h4>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <div style="padding: 0.75rem; background: #f5f5f5; border-radius: 4px;">
                <strong>New user registration</strong>
                <div style="font-size: 0.75rem; color: #666; margin-top: 0.25rem;">2 minutes ago</div>
              </div>
              <div style="padding: 0.75rem; background: #f5f5f5; border-radius: 4px;">
                <strong>Data export completed</strong>
                <div style="font-size: 0.75rem; color: #666; margin-top: 0.25rem;">15 minutes ago</div>
              </div>
              <div style="padding: 0.75rem; background: #f5f5f5; border-radius: 4px;">
                <strong>System backup successful</strong>
                <div style="font-size: 0.75rem; color: #666; margin-top: 0.25rem;">1 hour ago</div>
              </div>
            </div>
          </div>
        </div>
      </nr-panel>
    </div>
  `
};

/**
 * Comparing all three sizes side by side
 */
export const SizeComparison: Story = {
  render: () => html`
    <div style="min-height: 900px; background: #f5f5f5; position: relative; padding: 2rem;">
      <h1 style="margin-top: 0;">Panel Size Comparison</h1>
      <p>All three panel sizes displayed together for comparison.</p>
      
      <div style="display: flex; gap: 2rem; margin-top: 2rem; flex-wrap: wrap; align-items: flex-start;">
        <!-- Small Panel -->
        <nr-panel
          mode="window"
          size="small"
          title="Small"
          icon="minimize-2"
          draggable
          closable
          animated
          open
          style="position: relative; top: 0; left: 0; transform: none;">
          <div style="padding: 0.75rem;">
            <p style="margin: 0; font-size: 0.875rem;">320px × 400px</p>
            <div style="margin-top: 0.75rem; padding: 0.75rem; background: #e3f2fd; border-radius: 4px;">
              <div style="font-weight: bold;">Compact</div>
              <div style="font-size: 0.75rem; color: #666;">Perfect for widgets</div>
            </div>
          </div>
        </nr-panel>
        
        <!-- Medium Panel -->
        <nr-panel
          mode="window"
          size="medium"
          title="Medium"
          icon="square"
          draggable
          closable
          animated
          open
          style="position: relative; top: 0; left: 0; transform: none;">
          <div style="padding: 1rem;">
            <p style="margin: 0;">480px × 600px</p>
            <div style="margin-top: 1rem; padding: 1rem; background: #e8f5e9; border-radius: 4px;">
              <div style="font-weight: bold;">Standard</div>
              <div style="font-size: 0.875rem; color: #666;">Best for forms and settings</div>
            </div>
            <div style="margin-top: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 4px;">
              <div style="font-size: 0.875rem;">More content space available</div>
            </div>
          </div>
        </nr-panel>
        
        <!-- Large Panel -->
        <nr-panel
          mode="window"
          size="large"
          title="Large"
          icon="maximize-2"
          draggable
          closable
          animated
          open
          style="position: relative; top: 0; left: 0; transform: none;">
          <div style="padding: 1.5rem;">
            <p style="margin: 0; font-size: 1.125rem;">640px × 800px</p>
            <div style="margin-top: 1.5rem; display: grid; gap: 1rem;">
              <div style="padding: 1rem; background: #fff3e0; border-radius: 4px;">
                <div style="font-weight: bold;">Spacious</div>
                <div style="font-size: 0.875rem; color: #666;">Ideal for complex layouts</div>
              </div>
              <div style="padding: 1rem; background: #f5f5f5; border-radius: 4px;">
                <div style="font-size: 0.875rem;">Plenty of room for detailed content</div>
              </div>
              <div style="padding: 1rem; background: #e8eaf6; border-radius: 4px;">
                <div style="font-size: 0.875rem;">Multiple sections fit comfortably</div>
              </div>
            </div>
          </div>
        </nr-panel>
      </div>
      
      <div style="margin-top: 2rem; padding: 1.5rem; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="margin-top: 0;">Size Guidelines</h3>
        <ul style="margin-bottom: 0;">
          <li><strong>Small (320×400)</strong>: Notifications, quick actions, small widgets</li>
          <li><strong>Medium (480×600)</strong>: Forms, settings panels, standard content</li>
          <li><strong>Large (640×800)</strong>: Dashboards, detailed views, complex layouts</li>
          <li><strong>Custom</strong>: Set custom width and height properties for specific needs</li>
        </ul>
      </div>
    </div>
  `
};
