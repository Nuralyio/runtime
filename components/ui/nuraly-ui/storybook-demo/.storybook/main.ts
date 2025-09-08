import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
  viteFinal: async (config) => {
    // Customize the Vite config here
    return {
      ...config,
      define: {
        ...config.define,
        global: 'globalThis',
      },
    };
  },
  previewHead: (head) => `
    ${head}
  `,
};

export default config;
