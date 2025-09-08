import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Introduction',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

export const Welcome: Story = {
  render: () => html`
    <div style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: system-ui, sans-serif; line-height: 1.6;">
      <h1 style="color: #1976d2; margin-bottom: 1rem;">🎨 Welcome to NuralyUI</h1>
      
      <p style="font-size: 1.1rem; margin-bottom: 2rem; color: #666;">
        A comprehensive collection of enterprise-class web components built with Lit and TypeScript. 
        Framework-agnostic components that work seamlessly with React, Vue, Angular, or vanilla JavaScript.
      </p>

      <div style="background: #f5f5f5; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
        <h2 style="margin-top: 0; color: #333;">✨ Key Features</h2>
        <ul style="margin: 0; padding-left: 1.5rem;">
          <li><strong>Framework Agnostic:</strong> Use with any frontend framework or vanilla JavaScript</li>
          <li><strong>TypeScript First:</strong> Built with TypeScript for better developer experience</li>
          <li><strong>Accessibility:</strong> WCAG compliant components with proper ARIA support</li>
          <li><strong>Theming:</strong> Comprehensive theming system with CSS custom properties</li>
          <li><strong>Modern Standards:</strong> Built on Web Components and modern web standards</li>
          <li><strong>Enterprise Ready:</strong> Production-tested components for enterprise applications</li>
        </ul>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
        <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 1px solid #e0e0e0;">
          <h3 style="margin-top: 0; color: #1976d2;">🧩 Components</h3>
          <p style="margin-bottom: 0; color: #666;">
            Explore our comprehensive collection of UI components including buttons, inputs, cards, modals, and more.
          </p>
        </div>
        <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 1px solid #e0e0e0;">
          <h3 style="margin-top: 0; color: #1976d2;">🎨 Customization</h3>
          <p style="margin-bottom: 0; color: #666;">
            Every component is highly customizable with CSS custom properties and comprehensive theming support.
          </p>
        </div>
        <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 1px solid #e0e0e0;">
          <h3 style="margin-top: 0; color: #1976d2;">📱 Responsive</h3>
          <p style="margin-bottom: 0; color: #666;">
            All components are designed to be responsive and work perfectly across all device sizes.
          </p>
        </div>
      </div>

      <div style="background: #e3f2fd; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
        <h2 style="margin-top: 0; color: #1976d2;">🚀 Getting Started</h2>
        <ol style="margin: 0; padding-left: 1.5rem;">
          <li>Browse the component library in the sidebar</li>
          <li>Explore different component variations and properties</li>
          <li>Use the Controls panel to interact with component properties</li>
          <li>View the generated code in the Docs tab</li>
          <li>Copy the usage examples for your own projects</li>
        </ol>
      </div>

      <div style="background: #fff3e0; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #ff9800;">
        <h3 style="margin-top: 0; color: #f57c00;">💡 Pro Tip</h3>
        <p style="margin-bottom: 0; color: #666;">
          Use the theme switcher in the toolbar to see how components look in different themes. 
          Each component is designed to work seamlessly with both light and dark themes.
        </p>
      </div>

      <div style="text-align: center; margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #e0e0e0;">
        <p style="color: #666; margin-bottom: 1rem;">
          Ready to explore? Start with our most popular components:
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <a href="?path=/story/components-button--default" style="background: #1976d2; color: white; padding: 0.75rem 1.5rem; border-radius: 6px; text-decoration: none; font-weight: 500;">
            Button →
          </a>
          <a href="?path=/story/components-input--default" style="background: #388e3c; color: white; padding: 0.75rem 1.5rem; border-radius: 6px; text-decoration: none; font-weight: 500;">
            Input →
          </a>
          <a href="?path=/story/components-card--default" style="background: #7b1fa2; color: white; padding: 0.75rem 1.5rem; border-radius: 6px; text-decoration: none; font-weight: 500;">
            Card →
          </a>
        </div>
      </div>
    </div>
  `,
};

export const Installation: Story = {
  render: () => html`
    <div style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: system-ui, sans-serif; line-height: 1.6;">
      <h1 style="color: #1976d2; margin-bottom: 1rem;">📦 Installation Guide</h1>
      
      <p style="font-size: 1.1rem; margin-bottom: 2rem; color: #666;">
        Learn how to install and use NuralyUI components in your project.
      </p>

      <div style="background: #f5f5f5; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
        <h2 style="margin-top: 0; color: #333;">NPM Installation</h2>
        <pre style="background: #2d3748; color: #e2e8f0; padding: 1rem; border-radius: 6px; overflow-x: auto; margin: 1rem 0;"><code>npm install @nuralyui/button @nuralyui/input @nuralyui/card</code></pre>
        <p style="margin-bottom: 0; color: #666; font-size: 0.9rem;">
          Install individual components as needed, or install the complete package.
        </p>
      </div>

      <div style="background: #f5f5f5; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
        <h2 style="margin-top: 0; color: #333;">Usage in HTML</h2>
        <pre style="background: #2d3748; color: #e2e8f0; padding: 1rem; border-radius: 6px; overflow-x: auto; margin: 1rem 0;"><code>&lt;script type="module" src="./node_modules/@nuralyui/button/index.js"&gt;&lt;/script&gt;

&lt;nr-button type="primary"&gt;Click me&lt;/nr-button&gt;</code></pre>
      </div>

      <div style="background: #f5f5f5; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
        <h2 style="margin-top: 0; color: #333;">Usage in React</h2>
        <pre style="background: #2d3748; color: #e2e8f0; padding: 1rem; border-radius: 6px; overflow-x: auto; margin: 1rem 0;"><code>import '@nuralyui/button';
import { NrButton } from '@nuralyui/button/react';

function App() {
  return (
    &lt;NrButton type="primary" onClick={() => console.log('clicked')}&gt;
      Click me
    &lt;/NrButton&gt;
  );
}</code></pre>
      </div>

      <div style="background: #f5f5f5; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
        <h2 style="margin-top: 0; color: #333;">Usage in Vue</h2>
        <pre style="background: #2d3748; color: #e2e8f0; padding: 1rem; border-radius: 6px; overflow-x: auto; margin: 1rem 0;"><code>&lt;template&gt;
  &lt;nr-button type="primary" @click="handleClick"&gt;
    Click me
  &lt;/nr-button&gt;
&lt;/template&gt;

&lt;script&gt;
import '@nuralyui/button';

export default {
  methods: {
    handleClick() {
      console.log('clicked');
    }
  }
}
&lt;/script&gt;</code></pre>
      </div>

      <div style="background: #e8f5e8; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #4caf50;">
        <h3 style="margin-top: 0; color: #2e7d32;">✅ Framework Support</h3>
        <ul style="margin: 0; padding-left: 1.5rem; color: #666;">
          <li>✅ Vanilla JavaScript / HTML</li>
          <li>✅ React (with React wrapper)</li>
          <li>✅ Vue.js</li>
          <li>✅ Angular</li>
          <li>✅ Svelte</li>
          <li>✅ Any framework that supports Web Components</li>
        </ul>
      </div>
    </div>
  `,
};
