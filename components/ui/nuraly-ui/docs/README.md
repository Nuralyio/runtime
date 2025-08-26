# Nuraly UI Documentation

Welcome to the comprehensive documentation for Nuraly UI, a modern web component library built with Lit and TypeScript.

## 📚 Documentation Structure

### Getting Started
- [Installation Guide](./getting-started/installation.md)
- [Quick Start](./getting-started/quick-start.md)
- [Framework Integration](./getting-started/frameworks.md)
- [Migration Guide](./getting-started/migration.md)

### Components
- [Component Overview](./components/overview.md)
- [Button](./components/button.md)
- [Input](./components/input.md)
- [Form Components](./components/forms.md)
- [Layout Components](./components/layout.md)
- [Navigation Components](./components/navigation.md)
- [Feedback Components](./components/feedback.md)
- [Media Components](./components/media.md)

### Design System
- [Design Principles](./design/principles.md)
- [Color System](./design/colors.md)
- [Typography](./design/typography.md)
- [Spacing](./design/spacing.md)
- [Icons](./design/icons.md)

### Customization
- [Theming Guide](./customization/theming.md)
- [CSS Custom Properties](./customization/css-variables.md)
- [Dark Mode](./customization/dark-mode.md)
- [Custom Components](./customization/custom-components.md)

### Development
- [Development Setup](./development/setup.md)
- [Creating Components](./development/creating-components.md)
- [Testing](./development/testing.md)
- [Build Process](./development/build.md)

### Advanced Topics
- [Accessibility](./advanced/accessibility.md)
- [Performance](./advanced/performance.md)
- [Server-Side Rendering](./advanced/ssr.md)
- [Micro-frontends](./advanced/micro-frontends.md)

### API Reference
- [Component APIs](./api/components.md)
- [Types and Interfaces](./api/types.md)
- [Events](./api/events.md)
- [Methods](./api/methods.md)

## 🚀 Quick Links

### For Developers
- [Component Playground](http://localhost:8000) - Interactive component demos
- [GitHub Repository](https://github.com/NuralyUI/NuralyUI) - Source code
- [NPM Packages](https://www.npmjs.com/org/nuralyui) - Published packages
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute

### For Designers
- [Design System](./design/) - Complete design guidelines
- [Figma Kit](https://figma.com/nuraly-ui) - Design components (coming soon)
- [Style Guide](./design/style-guide.md) - Visual style guide

### For Teams
- [Best Practices](./guides/best-practices.md) - Recommended patterns
- [Code Standards](./guides/code-standards.md) - Coding guidelines
- [Team Setup](./guides/team-setup.md) - Team onboarding

## 🎯 What's New

### Version 1.0.5 (Current)
- ✨ Added new carousel component
- 🔧 Improved accessibility across all components
- 🎨 Enhanced theming system
- 📱 Better mobile responsiveness
- 🐛 Various bug fixes and improvements

### Coming Soon
- 📊 Data visualization components
- 📝 Rich text editor
- 📅 Advanced calendar component
- 🗺️ Map integration components

## 💡 Examples

### Basic Usage
```html
<script type="module">
  import '@nuralyui/button';
  import '@nuralyui/input';
</script>

<hy-button type="primary">Get Started</hy-button>
<hy-input placeholder="Enter your name"></hy-input>
```

### React Integration
```jsx
import { HyButton, HyInput } from '@nuralyui/react';

function App() {
  return (
    <div>
      <HyButton type="primary">Get Started</HyButton>
      <HyInput placeholder="Enter your name" />
    </div>
  );
}
```

### Vue Integration
```vue
<template>
  <div>
    <hy-button type="primary">Get Started</hy-button>
    <hy-input placeholder="Enter your name" />
  </div>
</template>

<script>
import '@nuralyui/button';
import '@nuralyui/input';
</script>
```

## 🌟 Key Features

### 🎨 **Beautiful by Default**
Components are designed with modern aesthetics and attention to detail.

### ♿ **Accessible**
Built with accessibility in mind, following WCAG 2.1 guidelines.

### 🔧 **Customizable**
Extensive theming system with CSS custom properties.

### 🚀 **Performance**
Lightweight components with optimal bundle sizes.

### 📱 **Responsive**
Mobile-first design with responsive layouts.

### 🌐 **Framework Agnostic**
Works with React, Vue, Angular, or vanilla JavaScript.

## 🛠️ Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 88+ |
| Firefox | 78+ |
| Safari | 14+ |
| Edge | 88+ |

## 📞 Support

- **Documentation Issues**: Open an issue on GitHub
- **Component Bugs**: Report on our issue tracker
- **Feature Requests**: Discuss in GitHub Discussions
- **Community**: Join our Discord (coming soon)

## 📄 License

Nuraly UI is licensed under the [BSD 3-Clause License](../LICENSE).

---

**Built with ❤️ by the Nuraly Team**
