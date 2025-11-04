import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../components/button/index.js';
import '../../components/input/index.js';
import '../../components/select/index.js';
import '../../components/card/index.js';
import '../../components/modal/index.js';
import '../../components/tabs/index.js';

/**
 * ## Editor Theme
 * 
 * A professional, -inspired editor theme featuring dark panel aesthetics,
 * modern design elements, and excellent readability - perfect for visual editors,
 * admin panels, and professional tools.
 * 
 * ### Features
 * - 🎨 **Dark Panel Aesthetic**: Professional dark panels with light content areas
 * - 🎯 **Modern Blue Accents**: Clean #4a90e2 primary color
 * - 📐 **Professional Typography**: System fonts optimized for readability
 * - 🌓 **Light & Dark Modes**: Full support via `data-theme` attribute
 * - ✨ **Subtle Effects**: Modern shadows, smooth transitions
 * 
 * ### Usage
 * Apply the theme using the `data-theme` attribute:
 * - `data-theme="editor-light"` for light mode
 * - `data-theme="editor-dark"` for dark mode
 */
const meta: Meta = {
  title: 'Themes/Editor Theme',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '-inspired professional editor theme with dark panels and modern UI elements.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const demoStyles = html`
  <style>
    .theme-demo {
      padding: 24px;
      min-height: 600px;
    }

    .theme-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-top: 24px;
    }

    .component-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .component-section h3 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
    }

    .button-group {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .editor-layout {
      display: flex;
      height: 600px;
      gap: 0;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
    }

    .editor-panel {
      width: 260px;
      background: var(--nuraly-color-background-panel, #2b2d30);
      color: var(--nuraly-color-text-panel, #e8e8e8);
      border-right: 1px solid var(--nuraly-color-border-panel, #3e4144);
      display: flex;
      flex-direction: column;
    }

    .editor-toolbar {
      background: var(--nuraly-color-background-toolbar, #35373a);
      border-bottom: 1px solid var(--nuraly-color-border-panel, #3e4144);
      height: 48px;
      display: flex;
      align-items: center;
      padding: 0 12px;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
    }

    .editor-canvas {
      flex: 1;
      background: var(--nuraly-color-background, #f8f9fa);
      padding: 24px;
      overflow: auto;
    }

    .panel-section {
      padding: 16px;
      border-bottom: 1px solid var(--nuraly-color-border-panel, #3e4144);
    }

    .panel-section h4 {
      margin: 0 0 12px 0;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--nuraly-color-text-panel-secondary, #abb2bf);
    }

    .property-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 12px;
    }

    .property-label {
      font-size: 13px;
      font-weight: 500;
    }
  </style>
`;

/**
 * Light mode showcase of the editor theme with various components.
 */
export const LightMode: Story = {
  render: () => html`
    ${demoStyles}
    <div class="theme-demo" data-theme="editor-light">
      <h2>Editor Theme - Light Mode</h2>
      <p>Professional editor aesthetic with clean, modern components.</p>

      <div class="theme-grid">
        <div class="component-section">
          <h3>Buttons</h3>
          <div class="button-group">
            <nr-button type="primary">Primary</nr-button>
            <nr-button type="secondary">Secondary</nr-button>
            <nr-button type="success">Success</nr-button>
            <nr-button type="danger">Danger</nr-button>
            <nr-button type="warning">Warning</nr-button>
            <nr-button type="default">Default</nr-button>
          </div>
          <div class="button-group">
            <nr-button type="primary" size="small">Small</nr-button>
            <nr-button type="primary" size="medium">Medium</nr-button>
            <nr-button type="primary" size="large">Large</nr-button>
          </div>
        </div>

        <div class="component-section">
          <h3>Inputs</h3>
          <nr-input placeholder="Enter text..." label="Text Input"></nr-input>
          <nr-input placeholder="Disabled input" label="Disabled" disabled></nr-input>
          <nr-select label="Select Option">
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </nr-select>
        </div>

        <div class="component-section">
          <h3>Cards</h3>
          <nr-card header="Card Header">
            <div slot="content">
              <p>Card content goes here. This is a clean, professional card design.</p>
            </div>
          </nr-card>
        </div>
      </div>
    </div>
  `,
};

/**
 * Dark mode showcase of the editor theme.
 */
export const DarkMode: Story = {
  render: () => html`
    ${demoStyles}
    <div class="theme-demo" data-theme="editor-dark">
      <h2>Editor Theme - Dark Mode</h2>
      <p>Professional editor aesthetic optimized for dark environments.</p>

      <div class="theme-grid">
        <div class="component-section">
          <h3>Buttons</h3>
          <div class="button-group">
            <nr-button type="primary">Primary</nr-button>
            <nr-button type="secondary">Secondary</nr-button>
            <nr-button type="success">Success</nr-button>
            <nr-button type="danger">Danger</nr-button>
            <nr-button type="warning">Warning</nr-button>
            <nr-button type="default">Default</nr-button>
          </div>
        </div>

        <div class="component-section">
          <h3>Inputs</h3>
          <nr-input placeholder="Enter text..." label="Text Input"></nr-input>
          <nr-input placeholder="Disabled input" label="Disabled" disabled></nr-input>
          <nr-select label="Select Option">
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </nr-select>
        </div>

        <div class="component-section">
          <h3>Cards</h3>
          <nr-card header="Card Header">
            <div slot="content">
              <p>Card content in dark mode with professional styling.</p>
            </div>
          </nr-card>
        </div>
      </div>
    </div>
  `,
};

/**
 * Complete editor layout example with panels and canvas.
 */
export const EditorLayout: Story = {
  render: () => html`
    ${demoStyles}
    <div data-theme="editor-light">
      <h2 style="padding: 0 24px; margin-bottom: 16px;">Editor Layout Example</h2>
      <div style="padding: 0 24px;">
        <div class="editor-layout">
          <!-- Left Panel -->
          <aside class="editor-panel">
            <div class="editor-toolbar">
              <span>Components</span>
            </div>
            <div class="panel-section">
              <h4>Basic Elements</h4>
              <nr-button type="default" size="small" style="width: 100%; margin-bottom: 8px;">Button</nr-button>
              <nr-button type="default" size="small" style="width: 100%; margin-bottom: 8px;">Input</nr-button>
              <nr-button type="default" size="small" style="width: 100%; margin-bottom: 8px;">Card</nr-button>
            </div>
            <div class="panel-section">
              <h4>Layout</h4>
              <nr-button type="default" size="small" style="width: 100%; margin-bottom: 8px;">Container</nr-button>
              <nr-button type="default" size="small" style="width: 100%; margin-bottom: 8px;">Grid</nr-button>
            </div>
          </aside>

          <!-- Canvas -->
          <main class="editor-canvas">
            <nr-card header="Welcome to Editor Theme">
              <div slot="content">
                <p>This is a professional editor layout with dark side panels and a light canvas area.</p>
                <div style="margin-top: 16px; display: flex; gap: 12px;">
                  <nr-button type="primary">Add Component</nr-button>
                  <nr-button type="secondary">Save</nr-button>
                  <nr-button type="default">Preview</nr-button>
                </div>
              </div>
            </nr-card>
          </main>

          <!-- Right Panel -->
          <aside class="editor-panel">
            <div class="editor-toolbar">
              <span>Properties</span>
            </div>
            <div class="panel-section">
              <h4>Element Settings</h4>
              <div class="property-row">
                <label class="property-label">Width</label>
                <nr-input placeholder="100%" size="small"></nr-input>
              </div>
              <div class="property-row">
                <label class="property-label">Height</label>
                <nr-input placeholder="auto" size="small"></nr-input>
              </div>
              <div class="property-row">
                <label class="property-label">Display</label>
                <nr-select size="small">
                  <option value="block">Block</option>
                  <option value="inline">Inline</option>
                  <option value="flex">Flex</option>
                </nr-select>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  `,
};

/**
 * Editor layout in dark mode.
 */
export const EditorLayoutDark: Story = {
  render: () => html`
    ${demoStyles}
    <div data-theme="editor-dark">
      <h2 style="padding: 0 24px; margin-bottom: 16px; color: #e8e8e8;">Editor Layout - Dark Mode</h2>
      <div style="padding: 0 24px;">
        <div class="editor-layout">
          <!-- Left Panel -->
          <aside class="editor-panel">
            <div class="editor-toolbar">
              <span>Components</span>
            </div>
            <div class="panel-section">
              <h4>Basic Elements</h4>
              <nr-button type="default" size="small" style="width: 100%; margin-bottom: 8px;">Button</nr-button>
              <nr-button type="default" size="small" style="width: 100%; margin-bottom: 8px;">Input</nr-button>
              <nr-button type="default" size="small" style="width: 100%; margin-bottom: 8px;">Card</nr-button>
            </div>
          </aside>

          <!-- Canvas -->
          <main class="editor-canvas">
            <nr-card header="Dark Mode Editor">
              <div slot="content">
                <p>Professional dark mode optimized for extended editing sessions.</p>
                <div style="margin-top: 16px; display: flex; gap: 12px;">
                  <nr-button type="primary">Add Component</nr-button>
                  <nr-button type="secondary">Save</nr-button>
                </div>
              </div>
            </nr-card>
          </main>

          <!-- Right Panel -->
          <aside class="editor-panel">
            <div class="editor-toolbar">
              <span>Properties</span>
            </div>
            <div class="panel-section">
              <h4>Element Settings</h4>
              <div class="property-row">
                <label class="property-label">Opacity</label>
                <nr-input placeholder="100%" size="small"></nr-input>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  `,
};
