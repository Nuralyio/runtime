<p align="center">
  <a href="https://nuraly.io">
    <img src="https://via.placeholder.com/200x80/4F46E5/FFFFFF?text=Nuraly+UI" alt="Nuraly UI Logo" />
  </a>
</p>

<h1 align="center">Nuraly UI</h1>

<div align="center">

A comprehensive collection of enterprise-class web components built with Lit and TypeScript. Create beautiful, responsive user interfaces that work seamlessly with any web framework or as standalone components.

[![npm version](https://badge.fury.io/js/@nuralyui%2Fworkspace.svg)](https://badge.fury.io/js/@nuralyui%2Fworkspace)
[![License](https://img.shields.io/badge/license-BSD--3--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![TypeScript](https://img.shields.io/badge/built%20with-TypeScript-blue)](https://www.typescriptlang.org/)

</div>

## 🚧 Early Development Stage

This library is currently in active development. While many components are functional, the API may change before the first stable release. We welcome feedback and contributions from the community!


## ✨ Features

- 🌈 **Enterprise-class Design**: Professional UI components designed for modern web applications
- 📦 **Complete Component Library**: 25+ high-quality web components ready to use
- 🛡 **TypeScript First**: Built with TypeScript for type safety and better developer experience
- ⚙️ **Framework Agnostic**: Works with React, Vue, Angular, or vanilla JavaScript/HTML
- 🎨 **Customizable Theming**: Powerful CSS custom properties for easy customization
- 🌐 **Web Standards**: Built on modern web standards using Lit and Web Components
- 📱 **Responsive**: Mobile-first design with responsive layouts out of the box
- 🚀 **Performance Optimized**: Lightweight components with minimal bundle size
- ♿ **Accessible**: ARIA-compliant components following accessibility best practices

## 📦 Available Components

Our library includes the following components:

### Form & Input Components
- **Button** - Customizable buttons with multiple variants
- **Input** - Text input fields with validation support
- **Checkbox** - Checkbox inputs with custom styling
- **Radio** - Radio button groups
- **Select** - Dropdown select components
- **Slider Input** - Range slider inputs
- **File Upload** - Drag & drop file upload with preview
- **Datepicker** - Calendar-based date selection
- **Colorpicker** - Color selection with multiple formats

### Layout & Navigation
- **Card** - Content containers with headers and actions
- **Tabs** - Tabbed navigation interface
- **Menu** - Navigation menus and dropdowns
- **Dropdown** - Dropdown menus and selectors
- **Collapse** - Collapsible content sections
- **Table** - Data tables with sorting and filtering
- **Carousel** - Image and content carousels

### Feedback & Interaction
- **Modal** - Dialog and modal windows
- **Toast** - Notification messages
- **Tooltips** - Contextual help and information
- **Icon** - Scalable vector icons

### Media & Content
- **Image** - Responsive image components
- **Video** - Video player components
- **Canvas** - HTML5 canvas wrapper
- **Document** - Document viewer (PDF support)

### Advanced Components
- **Chatbot** - AI chat interface components
- **Label** - Enhanced text labels
- **Divider** - Visual content separators
- **Console** - Debug and console interfaces

## � Links & Resources

- **[Live Demo](http://localhost:8000)** - Interactive component playground
- **[Documentation](https://hybridui.github.io/docs/docs/components/buttons)** - Comprehensive API docs
- **[GitHub Repository](https://github.com/NuralyUI/NuralyUI)** - Source code and issues
- **[NPM Organization](https://www.npmjs.com/org/nuralyui)** - Published packages
- **[Contributing Guide](#-contributing)** - How to contribute to the project

## 📊 Browser Support

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Edge |
| --- | --- | --- | --- |
| ✅ 88+ | ✅ 78+ | ✅ 14+ | ✅ 88+ |

**Environment Support:**
- ✅ Modern browsers with ES2020 support
- ✅ Server-side rendering (SSR)
- ✅ Static site generation (SSG)
- ✅ [Electron](https://www.electronjs.org/) applications
- ✅ Progressive Web Apps (PWA)
- ✅ Micro-frontends

## 📦 Installation

Install individual components as needed:

```bash
# Using npm
npm install @nuralyui/button
npm install @nuralyui/input
npm install @nuralyui/datepicker

# Using yarn
yarn add @nuralyui/button
yarn add @nuralyui/input
yarn add @nuralyui/datepicker

# Using bun
bun add @nuralyui/button
bun add @nuralyui/input
bun add @nuralyui/datepicker
```

## 🔨 Usage

### Vanilla JavaScript/HTML

```html
<!-- Include the component -->
<script type="module">
  import '@nuralyui/button';
  import '@nuralyui/input';
  import '@nuralyui/datepicker';
</script>

<!-- Use the components -->
<hy-button variant="primary">Click me</hy-button>
<hy-input placeholder="Enter your name" label="Name"></hy-input>
<hy-datepicker 
  field-format="DD/MM/YYYY"
  date-value="20/11/2024"
  date-placeholder="Select date">
</hy-datepicker>
```

### React

```jsx
import { HyButton } from "@nuralyui/button/react";
import { HyInput } from "@nuralyui/input/react";
import { HyDatepicker } from "@nuralyui/datepicker/react";

export default function App() {
  return (
    <div className="App">
      <HyButton variant="primary" onClick={() => alert('Clicked!')}>
        Click me
      </HyButton>
      
      <HyInput 
        placeholder="Enter your name" 
        label="Name"
        onInput={(e) => console.log(e.target.value)}
      />
      
      <HyDatepicker
        fieldFormat="DD/MM/YYYY"
        dateValue="20/11/2024"
        dateplaceholder="Select date"
        onDateChange={(e) => console.log(e.detail.date)}
      />
    </div>
  );
}
```

### Vue

```vue
<template>
  <div>
    <hy-button variant="primary" @click="handleClick">
      Click me
    </hy-button>
    
    <hy-input 
      placeholder="Enter your name" 
      label="Name"
      @input="handleInput"
    />
    
    <hy-datepicker
      field-format="DD/MM/YYYY"
      date-value="20/11/2024"
      date-placeholder="Select date"
      @date-change="handleDateChange"
    />
  </div>
</template>

<script>
import '@nuralyui/button';
import '@nuralyui/input';
import '@nuralyui/datepicker';

export default {
  methods: {
    handleClick() {
      alert('Clicked!');
    },
    handleInput(e) {
      console.log(e.target.value);
    },
    handleDateChange(e) {
      console.log(e.detail.date);
    }
  }
}
</script>
```

### TypeScript

All components are built with TypeScript and include complete type definitions:

```typescript
import { HyButton } from "@nuralyui/button/react";
import type { ButtonVariant, ButtonSize } from "@nuralyui/button";

// Type-safe component usage
const button: HyButton = document.createElement('hy-button');
button.variant = 'primary' as ButtonVariant;
button.size = 'large' as ButtonSize;
```

## � Theming & Customization

Nuraly UI components support extensive customization through CSS custom properties:

```css
:root {
  /* Primary colors */
  --hy-primary-color: #4F46E5;
  --hy-primary-color-hover: #4338CA;
  
  /* Typography */
  --hy-font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --hy-font-size-base: 16px;
  
  /* Spacing */
  --hy-spacing-xs: 4px;
  --hy-spacing-sm: 8px;
  --hy-spacing-md: 16px;
  --hy-spacing-lg: 24px;
  
  /* Border radius */
  --hy-border-radius: 6px;
  
  /* Shadows */
  --hy-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --hy-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  :root {
    --hy-primary-color: #6366F1;
    --hy-bg-primary: #111827;
    --hy-text-primary: #F9FAFB;
  }
}
```

## 🌍 Internationalization

Components with text content support internationalization:

```javascript
import { localized, msg } from '@lit/localize';

// Components like datepicker support multiple locales
<hy-datepicker locale="en-US"></hy-datepicker>
<hy-datepicker locale="fr-FR"></hy-datepicker>
<hy-datepicker locale="de-DE"></hy-datepicker>
```

## 🔗 Links

- [Documentation](https://hybridui.github.io/docs/docs/components/buttons)

## ⌨️ Development

### Quick Start

You can use Gitpod for a cloud-based development environment:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/NuralyUI/NuralyUI)

### Local Development

Clone and run the project locally:

```bash
# Clone the repository
git clone https://github.com/NuralyUI/NuralyUI.git
cd NuralyUI

# Install dependencies
npm install
# or
bun install

# Start development server
npm start
# or
bun start
```

This will:
- Build components in watch mode
- Start the development server on `http://localhost:8000`
- Hot reload when you make changes

### Available Scripts

```bash
# Development
npm start                 # Start dev server with watch mode
npm run build            # Build all components
npm run build:watch      # Build in watch mode
npm run serve            # Start development server

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run analyze          # Analyze components with CEM

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:prod        # Run tests in production mode

# Component Management
npm run link             # Link all components for local development
npm run unlink           # Unlink components
```

### Project Structure

```
hybrid-ui/
├── src/
│   ├── components/          # All web components
│   │   ├── button/         # Individual component
│   │   │   ├── hy-button.component.ts
│   │   │   ├── hy-button.style.ts
│   │   │   ├── index.ts
│   │   │   ├── package.json
│   │   │   ├── react.ts    # React wrapper
│   │   │   └── demo/       # Component demo
│   │   └── ...
│   ├── helpers/            # Utility functions
│   └── shared/            # Shared constants and utilities
├── dev/                   # Development HTML files
├── dist/                  # Built components
└── docs/                 # Documentation
```

### Creating a New Component

1. Create a new directory under `src/components/`
2. Follow the existing component structure
3. Add the component to the development server
4. Write tests and documentation
5. Submit a pull request

For detailed development instructions, see our [Development Guide](https://github.com/NuralyUI/NuralyUI/wiki/Development).

## 🤝 Contributing [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

- 🐛 **Report bugs** - Create detailed bug reports
- 💡 **Suggest features** - Propose new components or enhancements
- 📝 **Improve documentation** - Help make our docs better
- 🔧 **Fix issues** - Submit pull requests for bug fixes
- 🆕 **Add components** - Create new reusable components
- 🧪 **Write tests** - Improve test coverage
- 🎨 **Design feedback** - Share UX/UI improvement ideas

### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a branch** for your changes
4. **Make your changes** following our coding standards
5. **Write/update tests** for your changes
6. **Submit a pull request** with a clear description

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests for new features
- Update documentation for any API changes
- Use conventional commit messages
- Ensure all checks pass before submitting

### Code of Conduct

Please read our [Code of Conduct](https://github.com/NuralyUI/NuralyUI/blob/main/CODE_OF_CONDUCT.md) to understand our community standards.

### Questions?

- 💬 **[Discussions](https://github.com/NuralyUI/NuralyUI/discussions)** - Ask questions and share ideas
- 🐛 **[Issues](https://github.com/NuralyUI/NuralyUI/issues)** - Report bugs and request features
- 📧 **Email** - Contact the maintainers directly

For detailed contributing guidelines, see [CONTRIBUTING.md](https://github.com/NuralyUI/NuralyUI/blob/main/CONTRIBUTING.md).



## 📄 License

This project is licensed under the [BSD 3-Clause License](https://opensource.org/licenses/BSD-3-Clause). See the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Lit](https://lit.dev/) - Simple. Fast. Web Components.
- Icons from [Font Awesome](https://fontawesome.com/)
- Inspired by modern design systems and component libraries

## 📈 Project Status

- 🚀 **Active Development** - New components and features added regularly
- 🐛 **Bug Reports Welcome** - Help us improve by reporting issues
- 💡 **Feature Requests** - Suggest new components or improvements
- 📚 **Documentation** - Continuously improving docs and examples

---

<p align="center">
  <strong>Made with ❤️ by the Nuraly Team</strong>
</p>

<p align="center">
  <a href="https://github.com/NuralyUI/NuralyUI">⭐ Star us on GitHub</a> • 
  <a href="https://www.npmjs.com/org/nuralyui">📦 View on NPM</a> • 
  <a href="https://nuraly.io">🌐 Visit Website</a>
</p>
