# NuralyUI Storybook Demo

This is a separate Storybook setup for demonstrating NuralyUI web components. It provides an interactive environment to explore, test, and document all the components in the library.

## Features

- 🎨 Interactive component playground with controls
- 📖 Auto-generated documentation from component source code
- 🌙 Theme switching support (light/dark)
- 📱 Responsive design testing
- 🔧 Live editing of component properties
- 📊 Component usage examples and variations

## Getting Started

### Prerequisites

Make sure you have Node.js installed and the main NuralyUI project built.

### Installation

1. Navigate to the storybook-demo directory:
   ```bash
   cd storybook-demo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the main components (if not already built):
   ```bash
   npm run build-components
   ```

4. Start Storybook:
   ```bash
   npm run storybook
   ```

   This will start Storybook on `http://localhost:6006`

### Available Scripts

- `npm run storybook` - Start the Storybook development server
- `npm run build-storybook` - Build Storybook for production
- `npm run serve-storybook` - Serve the built Storybook
- `npm run build-components` - Build the main UI components
- `npm run dev` - Build components and start Storybook in one command

## Project Structure

```
storybook-demo/
├── .storybook/          # Storybook configuration
│   ├── main.ts          # Main configuration
│   └── preview.ts       # Global settings and decorators
├── src/                 # Story files
│   ├── button.stories.ts
│   ├── checkbox.stories.ts
│   └── ...
├── package.json
└── README.md
```

## Adding New Stories

To add a story for a new component:

1. Create a new `.stories.ts` file in the `src/` directory
2. Import the component from the built dist folder: `../../dist/components/[component-name]/index.js`
3. Define the component meta information and stories
4. Export the stories

Example:
```typescript
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../dist/components/my-component/index.js';

const meta: Meta = {
  title: 'Components/MyComponent',
  component: 'nr-my-component',
  // ... configuration
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: (args) => html`<nr-my-component></nr-my-component>`,
};
```

## Deployment

To build and deploy Storybook:

1. Build the static Storybook:
   ```bash
   npm run build-storybook
   ```

2. The built files will be in the `storybook-static` directory

3. Deploy the `storybook-static` directory to your hosting service

## Integration with Main Project

This Storybook setup is designed to work with the main NuralyUI project:

- It imports built components from `../dist/components/`
- It uses the `custom-elements.json` manifest from the main project
- Stories demonstrate real component usage and API

## Contributing

When adding new components to the main project, remember to:

1. Build the main project: `cd .. && npm run build`
2. Add corresponding stories in this Storybook project
3. Test the stories work correctly
4. Update documentation as needed
