import type { Preview } from '@storybook/web-components';

// Import theme CSS files directly
import '../src/shared/themes/default.css';
import '../src/shared/themes/carbon.css';
import '../src/shared/themes/polaris.css';

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
          { value: 'default', title: 'Default Light', icon: 'circle' },
          { value: 'default-dark', title: 'Default Dark', icon: 'circlehollow' },
          { value: 'carbon-light', title: 'Carbon Light', icon: 'sun' },
          { value: 'carbon-dark', title: 'Carbon Dark', icon: 'moon' },
          { value: 'polaris', title: 'Polaris Light', icon: 'shopping' },
          { value: 'polaris-dark', title: 'Polaris Dark', icon: 'basket' },
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
        'default-dark': '#111827',
        'carbon-light': '#ffffff', 
        'carbon-dark': '#161616',
        polaris: '#ffffff',
        'polaris-dark': '#1a1a1a'
      };
      const textColors: Record<string, string> = {
        default: '#111827',
        'default-dark': '#ffffff',
        'carbon-light': '#161616',
        'carbon-dark': '#ffffff',
        polaris: '#202223',
        'polaris-dark': '#ffffff'
      };
      
      document.body.style.backgroundColor = bgColors[theme] || '#ffffff';
      document.body.style.color = textColors[theme] || '#000000';
      
      return story();
    },
  ],
};

export default preview;
