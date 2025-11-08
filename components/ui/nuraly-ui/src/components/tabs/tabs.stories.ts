/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './tabs.component.js';
import { TabOrientation, TabsAlign, TabSize, TabType, type TabItem } from './tabs.types.js';
import { PanelMode } from '../panel/panel.types.js';

// Sample tabs data
const basicTabs: TabItem[] = [
  { id: '0', label: 'Home', content: 'Home content goes here...', icon: 'home' },
  { id: '1', label: 'About', content: 'About content goes here...' },
  { id: '2', label: 'Services', content: 'Services content goes here...', icon: 'services' },
  { id: '3', label: 'Contact', content: 'Contact content goes here...', closable: true }
];

const tabsWithIcons: TabItem[] = [
  { id: '0', label: 'Dashboard', content: 'Dashboard overview with charts and metrics...', icon: 'dashboard' },
  { id: '1', label: 'Analytics', content: 'Analytics data and insights...', icon: 'analytics' },
  { id: '2', label: 'Reports', content: 'Reports and documentation...', icon: 'description' },
  { id: '3', label: 'Settings', content: 'Settings and configuration...', icon: 'settings' }
];

const editableTabs: TabItem[] = [
  { id: '0', label: 'Tab 1', content: 'First editable tab content...', closable: true },
  { id: '1', label: 'Tab 2', content: 'Second editable tab content...', closable: true },
  { id: '2', label: 'Tab 3', content: 'Third editable tab content...', closable: true },
  { id: '3', label: 'Tab 4', content: 'Fourth editable tab content...', closable: true }
];

const longTabsList: TabItem[] = [
  { id: '0', label: 'Dashboard', content: 'Dashboard content...', icon: 'dashboard' },
  { id: '1', label: 'Analytics', content: 'Analytics content...', icon: 'analytics' },
  { id: '2', label: 'Reports', content: 'Reports content...', icon: 'description' },
  { id: '3', label: 'Users', content: 'Users management...', icon: 'people' },
  { id: '4', label: 'Products', content: 'Products catalog...', icon: 'inventory' },
  { id: '5', label: 'Orders', content: 'Order management...', icon: 'shopping_cart' },
  { id: '6', label: 'Settings', content: 'System settings...', icon: 'settings' },
  { id: '7', label: 'Support', content: 'Customer support...', icon: 'help' },
  { id: '8', label: 'Feedback', content: 'User feedback...', icon: 'feedback' },
  { id: '9', label: 'Documentation', content: 'Project documentation...', icon: 'description' }
];

const meta: Meta = {
  title: 'Data Display/Tabs',
  component: 'nr-tabs',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# Tabs Component

A versatile tabs component with support for multiple orientations, editable tabs, drag & drop functionality, and optional panel wrapper.

## Features
- Multiple orientations (horizontal/vertical)
- Multiple alignment options (left, center, right, stretch)
- Stretch alignment for equal-width tab distribution
- Editable tabs with inline editing
- Drag & drop reordering
- Icon support
- Closable tabs
- Keyboard navigation
- **Pannable tabs** - Optional wrapper with resizable/draggable panel
- Theme support
- Accessibility compliant

## Usage

\`\`\`html
<!-- Basic tabs -->
<nr-tabs .tabs=\${tabs} activeTab="0"></nr-tabs>

<!-- Pannable tabs -->
<nr-tabs .tabs=\${tabs} .panelConfig=\${{enabled: true, resizable: true}}></nr-tabs>
\`\`\`

## Panel Configuration
When \`panelConfig.enabled\` is true, tabs are wrapped in a resizable/draggable panel:
- **enabled**: Enable/disable panel wrapper (default: false)
- **mode**: Panel mode (embedded, window, panel)
- **resizable**: Whether panel is resizable
- **draggable**: Whether panel is draggable
- **title**: Panel title
- **width/height**: Custom dimensions

## Alignment Options
- **left**: Tabs aligned to the left (default)
- **center**: Tabs centered in the container
- **right**: Tabs aligned to the right
- **stretch**: Tabs stretch to fill full width with equal distribution

## Events
- **nr-tab-click**: Fired when a tab is clicked
- **nr-tab-change**: Fired when the active tab changes
- **nr-tab-add**: Fired when add tab button is clicked
- **nr-tab-remove**: Fired when a tab is removed
- **nr-tab-edit**: Fired when a tab label is edited
- **nr-tab-order-change**: Fired when tabs are reordered via drag & drop
- **nr-tabs-panel-close**: Fired when panel is closed (pannable tabs only)
- **nr-tabs-panel-minimize**: Fired when panel is minimized (pannable tabs only)
- **nr-tabs-panel-resize**: Fired when panel is resized (pannable tabs only)
        `,
      },
    },
  },
  argTypes: {
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      description: 'Tab orientation',
    },
    align: {
      control: { type: 'select' },
      options: ['left', 'center', 'right', 'stretch'],
      description: 'Tab alignment',
    },
    tabSize: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Tab size',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'card', 'line', 'bordered'],
      description: 'Tab type/variant',
    },
    animated: {
      control: { type: 'boolean' },
      description: 'Whether tabs are animated',
    },
    tabs: {
      control: { type: 'object' },
      description: 'Array of tab items',
    },
    editable: {
      control: { type: 'object' },
      description: 'Editable configuration',
    },
    panelConfig: {
      control: { type: 'object' },
      description: 'Panel configuration for pannable tabs',
    },
  },
};

export default meta;
type Story = StoryObj;

/**
 * Default tabs example with basic functionality
 */
export const Default: Story = {
  args: {
    tabs: basicTabs,
    activeTab: 0,
    orientation: TabOrientation.Horizontal,
    align: TabsAlign.Left,
    tabSize: TabSize.Medium,
    variant: TabType.Default,
    animated: true,
    editable: null,
  },
  render: (args) => html`
    <div style="height: 400px;">
      <nr-tabs
        .tabs=${args.tabs}
        .activeTab=${args.activeTab}
        .orientation=${args.orientation}
        .align=${args.align}
        .tabSize=${args.tabSize}
        .variant=${args.variant}
        .animated=${args.animated}
        .editable=${args.editable}
      ></nr-tabs>
    </div>
  `,
};

/**
 * Horizontal tabs with different alignments
 */
export const HorizontalAlignments: Story = {
  args: {
    tabs: basicTabs,
    activeTab: 0,
  },
  render: (args) => html`
    <div style="display: flex; flex-direction: column; gap: 2rem; height: 800px;">
      <div>
        <h3>Left Aligned</h3>
        <nr-tabs
          .tabs=${args.tabs}
          .activeTab=${args.activeTab}
          orientation=${TabOrientation.Horizontal}
          align=${TabsAlign.Left}
        ></nr-tabs>
      </div>
      <div>
        <h3>Center Aligned</h3>
        <nr-tabs
          .tabs=${args.tabs}
          .activeTab=${args.activeTab}
          orientation=${TabOrientation.Horizontal}
          align=${TabsAlign.Center}
        ></nr-tabs>
      </div>
      <div>
        <h3>Right Aligned</h3>
        <nr-tabs
          .tabs=${args.tabs}
          .activeTab=${args.activeTab}
          orientation=${TabOrientation.Horizontal}
          align=${TabsAlign.Right}
        ></nr-tabs>
      </div>
      <div>
        <h3>Stretch (Full Width)</h3>
        <nr-tabs
          .tabs=${args.tabs}
          .activeTab=${args.activeTab}
          orientation=${TabOrientation.Horizontal}
          align=${TabsAlign.Stretch}
        ></nr-tabs>
      </div>
    </div>
  `,
};

/**
 * Stretch tabs that fill the full width with equal distribution
 */
export const StretchTabs: Story = {
  args: {
    tabs: basicTabs,
    activeTab: 0,
  },
  render: (args) => html`
    <div style="display: flex; flex-direction: column; gap: 2rem; height: 600px;">
      <div>
        <h3>Stretch Tabs - Equal Width Distribution</h3>
        <p style="margin: 0.5rem 0; color: #666; font-size: 0.875rem;">
          Each tab takes up equal space to fill the full container width
        </p>
        <nr-tabs
          .tabs=${args.tabs}
          .activeTab=${args.activeTab}
          orientation=${TabOrientation.Horizontal}
          align=${TabsAlign.Stretch}
        ></nr-tabs>
      </div>
      
      <div>
        <h3>Stretch vs Normal Alignment Comparison</h3>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <h4 style="margin: 0.5rem 0; font-size: 0.875rem;">Normal Left Aligned</h4>
            <nr-tabs
              .tabs=${args.tabs}
              .activeTab=${args.activeTab}
              orientation=${TabOrientation.Horizontal}
              align=${TabsAlign.Left}
            ></nr-tabs>
          </div>
          <div>
            <h4 style="margin: 0.5rem 0; font-size: 0.875rem;">Stretch (Full Width)</h4>
            <nr-tabs
              .tabs=${args.tabs}
              .activeTab=${args.activeTab}
              orientation=${TabOrientation.Horizontal}
              align=${TabsAlign.Stretch}
            ></nr-tabs>
          </div>
        </div>
      </div>
      
      <div>
        <h3>Stretch with Different Tab Counts</h3>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <h4 style="margin: 0.5rem 0; font-size: 0.875rem;">2 Tabs (50% each)</h4>
            <nr-tabs
              .tabs=${[
                { id: '0', label: 'Tab One', content: 'First tab content...' },
                { id: '1', label: 'Tab Two', content: 'Second tab content...' }
              ]}
              .activeTab=${0}
              orientation=${TabOrientation.Horizontal}
              align=${TabsAlign.Stretch}
            ></nr-tabs>
          </div>
          <div>
            <h4 style="margin: 0.5rem 0; font-size: 0.875rem;">6 Tabs (~16.67% each)</h4>
            <nr-tabs
              .tabs=${[
                { id: '0', label: 'One', content: 'Content 1' },
                { id: '1', label: 'Two', content: 'Content 2' },
                { id: '2', label: 'Three', content: 'Content 3' },
                { id: '3', label: 'Four', content: 'Content 4' },
                { id: '4', label: 'Five', content: 'Content 5' },
                { id: '5', label: 'Six', content: 'Content 6' }
              ]}
              .activeTab=${0}
              orientation=${TabOrientation.Horizontal}
              align=${TabsAlign.Stretch}
            ></nr-tabs>
          </div>
        </div>
      </div>
    </div>
  `,
};

/**
 * Vertical tabs example
 */
export const Vertical: Story = {
  args: {
    tabs: basicTabs,
    activeTab: 0,
  },
  render: (args) => html`
    <div style="height: 400px; display: flex; gap: 2rem;">
      <div style="width: 300px;">
        <h3>Vertical Left</h3>
        <nr-tabs
          .tabs=${args.tabs}
          .activeTab=${args.activeTab}
          orientation=${TabOrientation.Vertical}
          align=${TabsAlign.Left}
        ></nr-tabs>
      </div>
      <div style="width: 300px;">
        <h3>Vertical Right</h3>
        <nr-tabs
          .tabs=${args.tabs}
          .activeTab=${args.activeTab}
          orientation=${TabOrientation.Vertical}
          align=${TabsAlign.Right}
        ></nr-tabs>
      </div>
    </div>
  `,
};

/**
 * Tabs with icons
 */
export const WithIcons: Story = {
  args: {
    tabs: tabsWithIcons,
    activeTab: 0,
  },
  render: (args) => html`
    <div style="height: 400px;">
      <nr-tabs
        .tabs=${args.tabs}
        .activeTab=${args.activeTab}
      ></nr-tabs>
    </div>
  `,
};

/**
 * Different tab sizes
 */
export const Sizes: Story = {
  args: {
    tabs: basicTabs,
    activeTab: 0,
  },
  render: (args) => html`
    <div style="display: flex; flex-direction: column; gap: 2rem; height: 600px;">
      <div>
        <h3>Small Tabs</h3>
        <nr-tabs
          .tabs=${args.tabs}
          .activeTab=${args.activeTab}
          variant=${TabType.Default}
          .tabSize=${TabSize.Small}
        ></nr-tabs>
      </div>
      <div>
        <h3>Medium Tabs</h3>
        <nr-tabs
          .tabs=${args.tabs}
          .activeTab=${args.activeTab}
          variant=${TabType.Default}
          .tabSize=${TabSize.Medium}
        ></nr-tabs>
      </div>
      <div>
        <h3>Large Tabs</h3>
        <nr-tabs
          .tabs=${args.tabs}
          .activeTab=${args.activeTab}
          variant=${TabType.Default}
          .tabSize=${TabSize.Large}
        ></nr-tabs>
      </div>
    </div>
  `,
};

/**
 * Different tab variants/types
 */
export const Variants: Story = {
  args: {
    tabs: basicTabs,
    activeTab: 0,
  },
  render: (args) => html`
    <div style="display: flex; flex-direction: column; gap: 2rem; height: 800px;">
      <div>
        <h3>Default</h3>
        <nr-tabs
          .tabs=${args.tabs}
          .activeTab=${args.activeTab}
          variant=${TabType.Default}
        ></nr-tabs>
      </div>
      <div>
        <h3>Line</h3>
        <nr-tabs
          .tabs=${args.tabs}
          .activeTab=${args.activeTab}
          variant=${TabType.Line}
        ></nr-tabs>
      </div>
      <div>
        <h3>Card</h3>
        <nr-tabs
          .tabs=${args.tabs}
          .activeTab=${args.activeTab}
          variant=${TabType.Card}
        ></nr-tabs>
      </div>
      <div>
        <h3>Bordered</h3>
        <nr-tabs
          .tabs=${args.tabs}
          .activeTab=${args.activeTab}
          variant=${TabType.Bordered}
        ></nr-tabs>
      </div>
    </div>
  `,
};

/**
 * Editable tabs with add/remove functionality
 */
export const Editable: Story = {
  render: () => {
    let tabs = [
      { id: '1', label: 'Tab 1', content: 'First editable tab content...', closable: true },
      { id: '2', label: 'Tab 2', content: 'Second editable tab content...', closable: true },
      { id: '3', label: 'Tab 3', content: 'Third editable tab content...', closable: true },
      { id: '4', label: 'Tab 4', content: 'Fourth editable tab content...', closable: true }
    ];
    
    let activeTab = 0;
    
    const editable = {
      canAddTab: true,
      canDeleteTab: true,
      canMove: true,
      canEditTabTitle: true
    };
    
    const handleTabRemove = (e: CustomEvent) => {
      console.log('🗑️ Tab remove event:', e.detail);
      const { index } = e.detail;
      
      // Remove the tab from the array
      const newTabs = tabs.filter((_, i) => i !== index);
      tabs = newTabs;
      
      // Adjust active tab if needed
      if (activeTab >= index && activeTab > 0) {
        activeTab = activeTab - 1;
      } else if (activeTab >= newTabs.length) {
        activeTab = Math.max(0, newTabs.length - 1);
      }
      
      // Update the component
      const tabsElement = e.target as any;
      if (tabsElement) {
        tabsElement.tabs = newTabs;
        tabsElement.activeTab = activeTab;
        tabsElement.requestUpdate();
      }
      
      console.log('✅ Tab removed. Remaining tabs:', newTabs.length);
      console.log('📍 Active tab updated to:', activeTab);
    };
    
    const handleTabAdd = (e: CustomEvent) => {
      console.log('➕ Tab add event:', e.detail);
      
      // Create a new tab
      const newTabId = Date.now().toString();
      const newTab = {
        id: newTabId,
        label: `New Tab ${tabs.length + 1}`,
        content: `This is a newly added tab with ID: ${newTabId}`,
        closable: true
      };
      
      // Add the tab to the array
      const newTabs = [...tabs, newTab];
      tabs = newTabs;
      
      // Set the new tab as active
      activeTab = newTabs.length - 1;
      
      // Update the component
      const tabsElement = e.target as any;
      if (tabsElement) {
        tabsElement.tabs = newTabs;
        tabsElement.activeTab = activeTab;
        tabsElement.requestUpdate();
      }
      
      console.log('✅ Tab added. Total tabs:', newTabs.length);
      console.log('📍 Active tab set to:', activeTab);
    };
    
    const handleTabEdit = (e: CustomEvent) => {
      console.log('✏️ Tab edit event:', e.detail);
      const { index, newLabel } = e.detail;
      
      // Update the tab label
      const newTabs = [...tabs];
      if (newTabs[index]) {
        newTabs[index] = { ...newTabs[index], label: newLabel };
        tabs = newTabs;
        
        // Update the component
        const tabsElement = e.target as any;
        if (tabsElement) {
          tabsElement.tabs = newTabs;
          tabsElement.requestUpdate();
        }
        
        console.log('✅ Tab label updated to:', newLabel);
      }
    };
    
    return html`
      <div style="height: 500px;">
        <div style="margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px;">
          <h4 style="margin: 0 0 10px 0; color: #495057;">✏️ Editable Tabs</h4>
          <p style="margin: 0 0 15px 0; color: #6c757d;">
            Full editing capabilities: add new tabs, delete existing ones, edit labels inline, and drag to reorder.
          </p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-size: 12px; color: #6c757d; margin-bottom: 15px;">
            <div><strong>Add tabs:</strong> ${editable.canAddTab ? '✅ Enabled' : '❌ Disabled'}</div>
            <div><strong>Delete tabs:</strong> ${editable.canDeleteTab ? '✅ Enabled' : '❌ Disabled'}</div>
            <div><strong>Edit labels:</strong> ${editable.canEditTabTitle ? '✅ Enabled' : '❌ Disabled'}</div>
            <div><strong>Drag reorder:</strong> ${editable.canMove ? '✅ Enabled' : '❌ Disabled'}</div>
          </div>
          
          <div style="padding: 10px; background-color: #e7f3ff; border: 1px solid #b8daff; border-radius: 4px; font-size: 13px;">
            <strong>🎯 How to use:</strong>
            <ul style="margin: 5px 0; padding-left: 20px;">
              <li><strong>Delete:</strong> Click the ✕ button on any tab</li>
              <li><strong>Add:</strong> Click the + button at the end of tabs</li>
              <li><strong>Edit:</strong> Double-click a tab label to edit inline</li>
              <li><strong>Reorder:</strong> Drag and drop tabs to new positions</li>
            </ul>
          </div>
          
          <div style="margin-top: 10px; font-size: 12px; color: #6c757d;">
            <strong>Current state:</strong> ${tabs.length} tabs, active: ${activeTab}
          </div>
        </div>
        
        <nr-tabs
          .tabs=${tabs}
          .activeTab=${activeTab}
          .editable=${editable}
          @nr-tab-remove=${handleTabRemove}
          @nr-tab-add=${handleTabAdd}
          @nr-tab-edit=${handleTabEdit}
          @nr-tab-click=${(e: CustomEvent) => console.log('👆 Tab clicked:', e.detail)}
          @nr-tab-change=${(e: CustomEvent) => console.log('🔄 Tab changed:', e.detail)}
        ></nr-tabs>
      </div>
    `;
  },
};

/**
 * Many tabs example (scrollable)
 */
export const ManyTabs: Story = {
  args: {
    tabs: longTabsList,
    activeTab: 0,
  },
  render: (args) => html`
    <div style="height: 400px;">
      <nr-tabs
        .tabs=${args.tabs}
        .activeTab=${args.activeTab}
      ></nr-tabs>
    </div>
  `,
};

/**
 * Drag and drop reordering functionality
 */
export const DragAndDrop: Story = {
  render: () => {
    let tabs = [
      { id: '1', label: 'First Tab', content: 'Content of the first tab - drag me around!' },
      { id: '2', label: 'Second Tab', content: 'Content of the second tab - I can be reordered!' },
      { id: '3', label: 'Third Tab', content: 'Content of the third tab - Try dragging and dropping!' },
      { id: '4', label: 'Fourth Tab', content: 'Content of the fourth tab - Drag and drop enabled!' },
      { id: '5', label: 'Fifth Tab', content: 'Content of the fifth tab - Reorder by dragging!' }
    ];
    
    let activeTab = 0;
    
    const editable = {
      canAddTab: false,
      canDeleteTab: false,
      canMove: true,
      canEditTabTitle: false
    };
    
    const handleTabOrderChange = (e: CustomEvent) => {
      console.log('🎯 Tab order change event fired:', e.detail);
      const { sourceIndex, targetIndex } = e.detail;
      
      // Create new array with reordered tabs
      const newTabs = [...tabs];
      const [movedTab] = newTabs.splice(sourceIndex, 1);
      newTabs.splice(targetIndex, 0, movedTab);
      
      // Update the tabs
      tabs = newTabs;
      
      // Update active tab if needed
      if (activeTab === sourceIndex) {
        activeTab = targetIndex;
      } else if (activeTab > sourceIndex && activeTab <= targetIndex) {
        activeTab = activeTab - 1;
      } else if (activeTab < sourceIndex && activeTab >= targetIndex) {
        activeTab = activeTab + 1;
      }
      
      // Force re-render by updating the component
      const tabsElement = e.target as any;
      if (tabsElement) {
        tabsElement.tabs = newTabs;
        tabsElement.activeTab = activeTab;
        tabsElement.requestUpdate();
      }
      
      console.log('✅ Tabs reordered:', newTabs.map(t => t.label));
      console.log('📍 Active tab updated to:', activeTab);
    };

    const handleDragStart = (e: CustomEvent) => {
      console.log('🚀 Drag started:', e.detail);
    };

    const handleDragEnd = (e: CustomEvent) => {
      console.log('🏁 Drag ended:', e.detail);
    };
    
    return html`
      <div style="height: 500px;">
        <div style="margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px;">
          <h4 style="margin: 0 0 10px 0; color: #495057;">🎯 Drag and Drop Testing</h4>
          <p style="margin: 0 0 15px 0; color: #6c757d;">
            The tabs should now be draggable! Click and hold a tab header, then drag to reorder.
          </p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-size: 12px; color: #6c757d;">
            <div>
              <strong>canMove:</strong> ${editable.canMove ? '✅ true' : '❌ false'}
            </div>
            <div>
              <strong>Tab count:</strong> ${tabs.length}
            </div>
            <div>
              <strong>Active tab:</strong> ${activeTab}
            </div>
            <div>
              <strong>Event binding:</strong> ✅ Connected
            </div>
          </div>
          <div style="margin-top: 10px; padding: 10px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;">
            <strong>🔧 Recent Fix:</strong> Changed mousedown to click event and removed preventDefault when dragging is enabled
          </div>
        </div>
        <nr-tabs
          .tabs=${tabs}
          .activeTab=${activeTab}
          .editable=${editable}
          @nr-tab-order-change=${handleTabOrderChange}
          @nr-tab-click=${(e: CustomEvent) => console.log('👆 Tab clicked:', e.detail)}
          @dragstart=${handleDragStart}
          @dragend=${handleDragEnd}
        ></nr-tabs>
      </div>
    `;
  },
};

/**
 * Editor Theme - VvvebJS style minimal tabs
 */
export const EditorTheme: Story = {
  args: {
    tabs: basicTabs,
    activeTab: 0,
  },
  render: (args) => html`
    <div style="display: flex; flex-direction: column; gap: 3rem;">
      <!-- Light Mode -->
      <div data-theme="editor-light" style="padding: 2rem; background: #f8f9fa; border-radius: 8px;">
        <h3 style="margin: 0 0 1.5rem 0; color: #212529;">Editor Theme - Light Mode</h3>
        
        <div style="margin-bottom: 2rem;">
          <h4 style="margin: 0 0 1rem 0; color: #495057; font-size: 0.875rem; font-weight: 600;">Default Variant</h4>
          <div style="background: white; padding: 1rem; border-radius: 4px;">
            <nr-tabs
              .tabs=${args.tabs}
              .activeTab=${args.activeTab}
              variant=${TabType.Default}
            ></nr-tabs>
          </div>
        </div>
        
        <div>
          <h4 style="margin: 0 0 1rem 0; color: #495057; font-size: 0.875rem; font-weight: 600;">Line Variant</h4>
          <div style="background: white; padding: 1rem; border-radius: 4px;">
            <nr-tabs
              .tabs=${args.tabs}
              .activeTab=${args.activeTab}
              variant=${TabType.Line}
            ></nr-tabs>
          </div>
        </div>
      </div>
      
      <!-- Dark Mode -->
      <div data-theme="editor-dark" style="padding: 2rem; background: #2d2d2d; border-radius: 8px;">
        <h3 style="margin: 0 0 1.5rem 0; color: #f8f9fa;">Editor Theme - Dark Mode</h3>
        
        <div style="margin-bottom: 2rem;">
          <h4 style="margin: 0 0 1rem 0; color: #adb5bd; font-size: 0.875rem; font-weight: 600;">Default Variant</h4>
          <div style="background: #1e1e1e; padding: 1rem; border-radius: 4px;">
            <nr-tabs
              .tabs=${args.tabs}
              .activeTab=${args.activeTab}
              variant=${TabType.Default}
            ></nr-tabs>
          </div>
        </div>
        
        <div>
          <h4 style="margin: 0 0 1rem 0; color: #adb5bd; font-size: 0.875rem; font-weight: 600;">Line Variant</h4>
          <div style="background: #1e1e1e; padding: 1rem; border-radius: 4px;">
            <nr-tabs
              .tabs=${args.tabs}
              .activeTab=${args.activeTab}
              variant=${TabType.Line}
            ></nr-tabs>
          </div>
        </div>
      </div>
    </div>
  `,
};

/**
 * Pannable tabs - Basic embedded panel
 */
export const PannableEmbedded: Story = {
  args: {
    tabs: basicTabs,
    activeTab: 0,
    panelConfig: {
      enabled: true,
      mode: PanelMode.Embedded,
      resizable: true,
      draggable: false,
      title: 'Embedded Panel Tabs',
      icon: 'tab',
    },
  },
  render: (args) => html`
    <div style="height: 500px; padding: 1rem;">
      <nr-tabs
        .tabs=${args.tabs}
        .activeTab=${args.activeTab}
        .panelConfig=${args.panelConfig}
      ></nr-tabs>
    </div>
  `,
};

/**
 * Pannable tabs - Floating window mode
 */
export const PannableWindow: Story = {
  args: {
    tabs: tabsWithIcons,
    activeTab: 0,
    panelConfig: {
      enabled: true,
      mode: PanelMode.Window,
      resizable: true,
      draggable: true,
      closable: true,
      minimizable: true,
      title: 'Dashboard Tabs',
      icon: 'dashboard',
      width: '600px',
      height: '400px',
    },
  },
  render: (args) => html`
    <div style="height: 600px; padding: 2rem; position: relative;">
      <p style="margin-bottom: 2rem; color: #666;">
        This panel can be dragged around, resized, minimized, and closed.
      </p>
      <nr-tabs
        .tabs=${args.tabs}
        .activeTab=${args.activeTab}
        .panelConfig=${args.panelConfig}
      ></nr-tabs>
    </div>
  `,
};

/**
 * Pannable tabs - Panel mode (docked)
 */
export const PannablePanel: Story = {
  args: {
    tabs: editableTabs,
    activeTab: 0,
    panelConfig: {
      enabled: true,
      mode: PanelMode.Panel,
      resizable: true,
      draggable: false,
      closable: false,
      title: 'Side Panel Tabs',
      icon: 'view_sidebar',
    },
    editable: {
      canAddTab: true,
      canDeleteTab: true,
      canEditTabTitle: true,
      canMove: true,
    },
  },
  render: (args) => html`
    <div style="height: 500px; padding: 1rem; position: relative;">
      <p style="margin-bottom: 2rem; color: #666;">
        This panel is docked to the side and can be resized. Try editing the tabs!
      </p>
      <nr-tabs
        .tabs=${args.tabs}
        .activeTab=${args.activeTab}
        .panelConfig=${args.panelConfig}
        .editable=${args.editable}
      ></nr-tabs>
    </div>
  `,
};

/**
 * Pannable tabs - Comparison of modes
 */
export const PannableComparison: Story = {
  args: {
    tabs: basicTabs,
    activeTab: 0,
  },
  render: (args) => html`
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; height: 800px; padding: 1rem;">
      <div>
        <h3 style="margin-bottom: 1rem;">Regular Tabs (No Panel)</h3>
        <nr-tabs
          .tabs=${args.tabs}
          .activeTab=${args.activeTab}
        ></nr-tabs>
      </div>
      
      <div>
        <h3 style="margin-bottom: 1rem;">Embedded Panel Tabs</h3>
        <nr-tabs
          .tabs=${args.tabs}
          .activeTab=${args.activeTab}
          .panelConfig=${{
            enabled: true,
            mode: PanelMode.Embedded,
            resizable: true,
            title: 'Panel Tabs',
          }}
        ></nr-tabs>
      </div>
    </div>
  `,
};

/**
 * Pannable tabs - Advanced configuration
 */
export const PannableAdvanced: Story = {
  args: {
    tabs: longTabsList,
    activeTab: 0,
    panelConfig: {
      enabled: true,
      mode: PanelMode.Window,
      resizable: true,
      draggable: true,
      closable: true,
      minimizable: true,
      title: 'Advanced Dashboard',
      icon: 'dashboard',
      width: '800px',
      height: '500px',
    },
    editable: {
      canAddTab: true,
      canDeleteTab: true,
      canEditTabTitle: true,
      canMove: true,
    },
    orientation: TabOrientation.Horizontal,
    align: TabsAlign.Left,
    tabSize: TabSize.Medium,
    variant: TabType.Line,
    animated: true,
  },
  render: (args) => html`
    <div style="height: 700px; padding: 2rem; position: relative;">
      <div style="margin-bottom: 2rem; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
        <h3 style="margin: 0 0 0.5rem 0;">Advanced Pannable Tabs</h3>
        <p style="margin: 0; color: #666; font-size: 0.875rem;">
          Features: Resizable panel, draggable, closable, many tabs, editable, line variant, with icons.
          Try dragging the panel, resizing it, editing tab names, adding/removing tabs, and reordering them.
        </p>
      </div>
      
      <nr-tabs
        .tabs=${args.tabs}
        .activeTab=${args.activeTab}
        .panelConfig=${args.panelConfig}
        .editable=${args.editable}
        .orientation=${args.orientation}
        .align=${args.align}
        .tabSize=${args.tabSize}
        .variant=${args.variant}
        .animated=${args.animated}
      ></nr-tabs>
    </div>
  `,
};

/**
 * Pannable tabs - Custom styling
 */
export const PannableCustomStyling: Story = {
  args: {
    tabs: tabsWithIcons,
    activeTab: 0,
    panelConfig: {
      enabled: true,
      mode: PanelMode.Embedded,
      resizable: true,
      title: 'Custom Styled Panel',
      icon: 'palette',
      width: '100%',
      height: '400px',
    },
  },
  render: (args) => html`
    <div style="height: 500px; padding: 1rem;">
      <style>
        .custom-panel-tabs {
          --nuraly-panel-background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          --nuraly-panel-header-background: rgba(255, 255, 255, 0.1);
          --nuraly-panel-header-text-color: white;
          --nuraly-panel-border-color: rgba(255, 255, 255, 0.2);
          --nuraly-tabs-background: transparent;
          --nuraly-tab-color: rgba(255, 255, 255, 0.8);
          --nuraly-tab-active-color: white;
          --nuraly-tab-active-background: rgba(255, 255, 255, 0.1);
        }
      </style>
      <div class="custom-panel-tabs">
        <nr-tabs
          .tabs=${args.tabs}
          .activeTab=${args.activeTab}
          .panelConfig=${args.panelConfig}
          variant=${TabType.Line}
        ></nr-tabs>
      </div>
    </div>
  `,
};
