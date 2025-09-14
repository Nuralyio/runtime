import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

// Import theme CSS for preview
import './shared/themes/default.css';

const meta: Meta = {
  title: 'Introduction/Welcome',
  parameters: {
    layout: 'fullscreen',
    docs: {
      page: () => html`
        <div style="padding: 2rem; max-width: 800px; margin: 0 auto;">
          <h1>Hybrid UI Library</h1>
          
          <p>Welcome to the Hybrid UI Library - a comprehensive collection of reusable web components built with modern web standards and Lit Element.</p>
          
          <h2>Features</h2>
          <ul>
            <li><strong>Theme Support:</strong> Multiple design systems (Default, Carbon)</li>
            <li><strong>Accessibility:</strong> WCAG 2.1 AA compliance built-in</li>
            <li><strong>Modern Standards:</strong> Built with Lit Element and TypeScript</li>
            <li><strong>Responsive Design:</strong> Mobile-first approach</li>
            <li><strong>Interactive Effects:</strong> Smooth animations and ripple effects</li>
          </ul>
          
          <h2>Available Components</h2>
          <ul>
            <li>Button - Interactive buttons with multiple variants</li>
            <li>Input - Text inputs with validation</li>
            <li>Card - Container component for content</li>
            <li>Form - Form wrapper with validation</li>
            <li>Checkbox & Radio - Selection controls</li>
            <li>Select - Dropdown selection</li>
            <li>Datepicker & Timepicker - Date and time selection</li>
            <li>Icon - Scalable icon component</li>
          </ul>
          
          <h2>Getting Started</h2>
          <p>Explore the component library by navigating through the sidebar. Each component includes:</p>
          <ul>
            <li>Interactive playground with controls</li>
            <li>Multiple usage examples</li>
            <li>Documentation and API reference</li>
            <li>Accessibility features demonstration</li>
          </ul>
        </div>
      `,
    },
  },
};

export default meta;
type Story = StoryObj;

export const Overview: Story = {
  render: () => html`
    <div style="padding: 2rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 1200px; margin: 0 auto;">
        
        <!-- Header -->
        <header style="text-align: center; margin-bottom: 3rem;">
          <h1 style="font-size: 3rem; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
            Hybrid UI Library
          </h1>
          <p style="font-size: 1.2rem; color: #666; margin: 1rem 0 0 0;">
            Modern Web Components for Building Great User Interfaces
          </p>
        </header>

        <!-- Component Showcase -->
        <section style="margin-bottom: 3rem;">
          <h2 style="text-align: center; margin-bottom: 2rem; color: #333;">Component Showcase</h2>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
            
            <!-- Buttons -->
            <div style="padding: 1.5rem; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h3 style="margin: 0 0 1rem 0; color: #333;">Buttons</h3>
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <nr-button variant="primary">Primary</nr-button>
                <nr-button variant="secondary">Secondary</nr-button>
                <nr-button variant="danger">Danger</nr-button>
              </div>
            </div>

            <!-- Inputs -->
            <div style="padding: 1.5rem; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h3 style="margin: 0 0 1rem 0; color: #333;">Form Controls</h3>
              <div style="display: flex; flex-direction: column; gap: 1rem;">
                <nr-input label="Email" placeholder="Enter your email..." type="email"></nr-input>
                <nr-checkbox label="Subscribe to newsletter"></nr-checkbox>
              </div>
            </div>

            <!-- Cards -->
            <div style="padding: 1.5rem; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h3 style="margin: 0 0 1rem 0; color: #333;">Cards</h3>
              <nr-card title="Feature Card" subtitle="Enhanced UI" elevated>
                <p>Beautiful and functional card component with multiple variants.</p>
              </nr-card>
            </div>

          </div>
        </section>

        <!-- Theme Examples -->
        <section style="margin-bottom: 3rem;">
          <h2 style="text-align: center; margin-bottom: 2rem; color: #333;">Theme Support</h2>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
            
            <div style="padding: 1.5rem; border: 1px solid #e0e0e0; border-radius: 8px; text-align: center;" data-theme="default">
              <h4 style="margin: 0 0 1rem 0;">Default Theme</h4>
              <nr-button variant="primary" size="small">Default Button</nr-button>
            </div>
            
            <div style="padding: 1.5rem; border: 1px solid #e0e0e0; border-radius: 8px; text-align: center;" data-theme="carbon">
              <h4 style="margin: 0 0 1rem 0;">Carbon Theme</h4>
              <nr-button variant="primary" size="small">Carbon Button</nr-button>
            </div>
            
          </div>
        </section>

        <!-- Features -->
        <section>
          <h2 style="text-align: center; margin-bottom: 2rem; color: #333;">Key Features</h2>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; text-align: center;">
            
            <div style="padding: 1.5rem;">
              <div style="font-size: 3rem; margin-bottom: 1rem;">🎨</div>
              <h4 style="margin: 0 0 0.5rem 0;">Themeable</h4>
              <p style="margin: 0; color: #666; font-size: 0.9rem;">Multiple design systems supported</p>
            </div>
            
            <div style="padding: 1.5rem;">
              <div style="font-size: 3rem; margin-bottom: 1rem;">♿</div>
              <h4 style="margin: 0 0 0.5rem 0;">Accessible</h4>
              <p style="margin: 0; color: #666; font-size: 0.9rem;">WCAG 2.1 AA compliant</p>
            </div>
            
            <div style="padding: 1.5rem;">
              <div style="font-size: 3rem; margin-bottom: 1rem;">⚡</div>
              <h4 style="margin: 0 0 0.5rem 0;">Modern</h4>
              <p style="margin: 0; color: #666; font-size: 0.9rem;">Built with Lit Element</p>
            </div>
            
            <div style="padding: 1.5rem;">
              <div style="font-size: 3rem; margin-bottom: 1rem;">📱</div>
              <h4 style="margin: 0 0 0.5rem 0;">Responsive</h4>
              <p style="margin: 0; color: #666; font-size: 0.9rem;">Mobile-first design</p>
            </div>
            
          </div>
        </section>

      </div>
    </div>
  `,
};
