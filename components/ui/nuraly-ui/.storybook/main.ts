import type { StorybookConfig } from '@storybook/web-components-vite';
import { resolve } from 'path';

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
  docs: {
    autodocs: true,
  },
  core: {
    disableTelemetry: true,
  },
  viteFinal: async (config) => {
    const base = process.env.STORYBOOK_BASE || '/';
    return {
      ...config,
      base,
      plugins: [
        ...(config.plugins || []),
        // Fix Storybook bug: it generates /@id/ paths without the base prefix
        ...(base !== '/'
          ? [
              {
                name: 'fix-storybook-base-path',
                enforce: 'post' as const,
                transformIndexHtml(html: string) {
                  return html.replace('src="/@id/__x00__', `src="${base}@id/__x00__`);
                },
              },
            ]
          : []),
      ],
      server: {
        ...config.server,
        allowedHosts: true,
      },
      define: {
        ...config.define,
        global: 'globalThis',
      },
      optimizeDeps: {
        ...config.optimizeDeps,
        include: [...(config.optimizeDeps?.include || []), 'entities'],
      },
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          entities: resolve(__dirname, '../node_modules/entities'),
        },
      },
    };
  },
};

export default config;
