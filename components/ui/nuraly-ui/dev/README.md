# Development Environment

This directory contains HTML demo files for each component in the Nuraly UI library. These files provide an interactive playground for testing and developing components.

## Getting Started

1. **Start the development server:**
   ```bash
   npm start
   # or
   bun start
   ```

2. **Open your browser and navigate to:**
   ```
   http://localhost:8000
   ```

3. **Browse available components** from the main index page or directly access individual component demos.

## Available Demos

### Form & Input Components
- [buttons.html](./buttons.html) - Button component variants and states
- [input.html](./input.html) - Text input fields with validation
- [checkbox.html](./checkbox.html) - Checkbox inputs and groups
- [radio.html](./radio.html) - Radio button groups
- [select.html](./select.html) - Dropdown select components
- [slider-input.html](./slider-input.html) - Range slider inputs
- [file.html](./file.html) - File upload with drag & drop
- [datepicker.html](./datepicker.html) - Calendar date selection
- [colorpicker.html](./colorpicker.html) - Color picker component

### Layout & Navigation
- [card.html](./card.html) - Content cards with headers
- [tabs.html](./tabs.html) - Tabbed navigation interface
- [menu.html](./menu.html) - Navigation menus
- [dropdown.html](./dropdown.html) - Dropdown menus
- [collapse.html](./collapse.html) - Collapsible sections
- [table.html](./table.html) - Data tables
- [carousel.html](./carousel.html) - Image carousels

### Feedback & Interaction
- [modal.html](./modal.html) - Modal dialogs
- [toast.html](./toast.html) - Toast notifications
- [tooltips.html](./tooltips.html) - Contextual tooltips

### Media & Content
- [icon.html](./icon.html) - Icon components
- [image.html](./image.html) - Image components
- [video.html](./video.html) - Video players
- [canvas.html](./canvas.html) - Canvas components
- [document.html](./document.html) - Document viewers

### Advanced Components
- [chatbot.html](./chatbot.html) - AI chat interfaces
- [label.html](./label.html) - Enhanced labels

## How It Works

Each HTML file:
- Imports the necessary component modules
- Includes component-specific demo elements
- Provides interactive examples and use cases
- Shows different component configurations

## Development Workflow

1. **Watch mode**: Run `npm run build:watch` to automatically rebuild components when source files change
2. **Live server**: The development server automatically refreshes when files are updated
3. **Hot reload**: Most changes are reflected immediately without manual refresh
4. **Component isolation**: Each demo file can be developed and tested independently

## Adding New Component Demos

When creating a new component:

1. Create a new HTML file in this directory (e.g., `my-component.html`)
2. Follow the existing file structure and patterns
3. Import your component and demo modules
4. Add a link to the main `index.html` file
5. Create interactive examples showcasing your component's features

## Troubleshooting

- **Build errors**: Check the console for TypeScript or build errors
- **Import issues**: Ensure component paths are correct and files exist
- **Server not starting**: Make sure port 8000 is available
- **Components not updating**: Try restarting the development server

For more detailed development information, see the main [README.md](../README.md) file.
