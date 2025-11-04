import type { Preview } from '@storybook/web-components';

// Import both theme CSS files for theme switcher
import '../src/shared/themes/default.css';

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
    options: {
      storySort: {
        method: 'alphabetical',
        order: [
          'General',
          ['Button', 'Icon', 'Label'],
          'Data Entry',
          ['ColorPicker', 'Input', 'Textarea', 'Select', 'Checkbox', 'Radio', 'DatePicker', 'TimePicker', 'Slider', 'Form'],
          'Data Display',
          ['Card', 'Collapse', 'Tabs'],
          'Feedback',
          ['Modal'],
          'Navigation',
          ['Dropdown'],
        ],
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'default-light',
      toolbar: {
        title: 'Theme',
        icon: 'contrast',
        items: [
          { value: 'default-light', title: 'Default Light', icon: 'circle' },
          { value: 'default-dark', title: 'Default Dark', icon: 'circlehollow' },
          { value: 'carbon-light', title: 'Carbon Light', icon: 'sun' },
          { value: 'carbon-dark', title: 'Carbon Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (story: any, context: any) => {
      const theme = context.globals.theme || 'default-light';
      
      // Apply theme to document root for components to detect
      document.documentElement.setAttribute('data-theme', theme);
      document.body.setAttribute('data-theme', theme);
      
      // Add theme class for CSS targeting
      document.body.className = `theme-${theme}`;
      
      // Apply background styling based on theme
      const bgColors: Record<string, string> = {
        'default-light': '#ffffff',
        'default-dark': '#111827',
        'carbon-light': '#ffffff', 
        'carbon-dark': '#161616',
      };
      const textColors: Record<string, string> = {
        'default-light': '#161616',
        'default-dark': '#ffffff',
        'carbon-light': '#161616',
        'carbon-dark': '#ffffff',
      };
      
      document.body.style.backgroundColor = bgColors[theme] || '#ffffff';
      document.body.style.color = textColors[theme] || '#000000';
      
      return story();
    },
  ],
};

export default preview;
