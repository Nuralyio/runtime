import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

export default {
  content: ['./theme/**/*.ftl'],
  experimental: {
    optimizeUniversalDefaults: true,
  },
  plugins: [require('@tailwindcss/forms')],
  theme: {
    extend: {
      fontFamily: {
        mono: ['SF Mono', 'Fira Code', 'Fira Mono', 'Menlo', 'monospace'],
      },
      colors: {
        primary: {
          50: '#f0f0f8',
          100: '#e0e0f0',
          200: '#c0c0e0',
          300: '#9090c0',
          400: '#5050a0',
          500: '#14144b',
          600: '#1e1e6e',
          700: '#0f0f3c',
          800: '#0a0a32',
          900: '#050520',
          950: '#020210',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e8e8f0',
          300: '#d8d8e4',
          400: '#8c8ca8',
          500: '#5c5c7a',
          600: '#4a4a68',
          700: '#0f0f3c',
          800: '#0a0a32',
          900: '#050520',
          950: '#020210',
        },

        provider: {
          apple: '#000000',
          bitbucket: '#0052CC',
          discord: '#5865F2',
          facebook: '#1877F2',
          github: '#181717',
          gitlab: '#FC6D26',
          google: '#4285F4',
          instagram: '#E4405F',
          linkedin: '#0A66C2',
          microsoft: '#5E5E5E',
          oidc: '#F78C40',
          openshift: '#EE0000',
          paypal: '#00457C',
          slack: '#4A154B',
          stackoverflow: '#F58025',
          twitter: '#1DA1F2',
        },
      },
      backgroundImage: {
        'login-art': "url('${url.resourcesPath}/img/login-bg.jpg')",
      },
    },
  },
} satisfies Config;
