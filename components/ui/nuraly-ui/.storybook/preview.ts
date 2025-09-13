import type { Preview } from '@storybook/web-components';

// Import theme CSS files directly
import '../src/shared/themes/default.css';
import '../src/shared/themes/carbon.css';
// import '../src/shared/themes/polaris.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      extractComponentDescription: (component: any, { notes }: any) => {
        if (notes) {
          return typeof notes === 'string' ? notes : notes.markdown || notes.text;
        }
        return null;
      },
    },
    backgrounds: { disable: true },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'default',
      toolbar: {
        title: 'Theme',
        icon: 'contrast',
        items: [
          { value: 'default', title: 'Default Theme', icon: 'circle' },
          { value: 'carbon', title: 'Carbon Design System', icon: 'component' },
          { value: 'polaris', title: 'Shopify Polaris', icon: 'shopping' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (story: any, context: any) => {
      const theme = context.globals.theme || 'default';
      
      // Apply theme to document root for components to detect
      document.documentElement.setAttribute('data-theme', theme);
      document.body.setAttribute('data-theme', theme);
      
      // Add theme class for CSS targeting
      document.body.className = `theme-${theme}`;
      
      // Apply background styling based on theme
      const bgColors: Record<string, string> = {
        default: '#ffffff',
        carbon: '#ffffff', 
        polaris: '#ffffff'
      };
      const textColors: Record<string, string> = {
        default: '#000000',
        carbon: '#161616',
        polaris: '#202223'
      };
      
      document.body.style.backgroundColor = bgColors[theme] || '#ffffff';
      document.body.style.color = textColors[theme] || '#000000';
      
      return story();
    },
  ],
};

export default preview;
