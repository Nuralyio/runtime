# @nuralyui/common

Common UI components package for Nuraly UI Library. This package contains basic building blocks that are commonly used across the component library and in applications.

[![npm version](https://badge.fury.io/js/@nuralyui%2Fcommon.svg)](https://badge.fury.io/js/@nuralyui%2Fcommon)
[![License](https://img.shields.io/badge/license-BSD--3--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)

## 🧩 Shared Utilities (what this package provides)

#### Mixins
Base mixins that provide common functionality to all Nuraly UI components:
- **`NuralyUIBaseMixin`** / **`BaseMixin`**: Combined mixin with theme, dependency, and event handling
- **`ThemeAwareMixin`**: Theme management and observation
- **`DependencyValidationMixin`**: Component dependency validation
- **`EventHandlerMixin`**: Enhanced event handling capabilities

#### Controllers
Reactive controllers for component behavior:
- **`ThemeController`**: Theme observation and management
- **`SharedDropdownController`**: Dropdown positioning and behavior

#### Theme Utilities
- Theme detection and management
- Theme variant types and utilities
- getCurrentTheme, theme constants

#### Utility Functions
- `throttle`, `debounce`, `rafThrottle`
- Performance optimization helpers

> Note: As of 0.1.x, @nuralyui/common no longer re-exports UI components (icon, badge, divider, label). Those should be consumed from their own packages or via the grouped packages like `@nuralyui/forms` or `@nuralyui/layout`.

## 🚀 Installation

```bash
npm install @nuralyui/common
```

Or using yarn:

```bash
yarn add @nuralyui/common
```

## 📖 Usage

### Import Shared Utilities

```javascript
// Import mixins for creating custom components
import { NuralyUIBaseMixin, ThemeAwareMixin } from '@nuralyui/common/mixins';

// Import controllers
import { ThemeController, SharedDropdownController } from '@nuralyui/common/controllers';

// Import theme utilities
import { getCurrentTheme, type ThemeVariant } from '@nuralyui/common/themes';

// Import utility functions
import { throttle, debounce, rafThrottle } from '@nuralyui/common/utils';
```

### Creating Custom Components with Mixins

```typescript
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';

@customElement('my-component')
export class MyComponent extends NuralyUIBaseMixin(LitElement) {
  render() {
    return html`
      <div data-theme="${this.currentTheme}">
        My themed component
      </div>
    `;
  }
}
```

### Using Controllers

```typescript
import { LitElement, html } from 'lit';
import { ThemeController } from '@nuralyui/common/controllers';

export class MyComponent extends LitElement {
  private themeController = new ThemeController(this);

  render() {
    return html`
      <div class="${this.themeController.isDark ? 'dark' : 'light'}">
        Theme: ${this.themeController.currentTheme}
      </div>
    `;
  }
}
```

### HTML Usage (utilities only)

Utilities don’t render by themselves. Use them inside your own components or with the grouped/component packages.

## 🎯 Why Use @nuralyui/common?

### Guidance
- Install components from their own packages (e.g., `@nuralyui/icon`) or grouped packages (`@nuralyui/forms`, `@nuralyui/layout`).
- Use `@nuralyui/common` for mixins, controllers, themes, and utilities.

## 📚 Component Documentation

For component docs, see the individual packages or grouped packages:
- [Icon](https://github.com/Nuralyio/NuralyUI/tree/main/src/components/icon)
- [Badge](https://github.com/Nuralyio/NuralyUI/tree/main/src/components/badge)
- [Divider](https://github.com/Nuralyio/NuralyUI/tree/main/src/components/divider)
- [Label](https://github.com/Nuralyio/NuralyUI/tree/main/src/components/label)

## 🔗 Related Packages

- [@nuralyui/themes](https://www.npmjs.com/package/@nuralyui/themes) - Theme packages for Nuraly UI
- Individual component packages available on npm under `@nuralyui/*`

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/NuralyUI/NuralyUI/blob/main/CONTRIBUTING.md) for details.

## 📄 License

BSD-3-Clause © [Laabidi Aymen](https://github.com/NuralyUI)

## 🔗 Links

- [GitHub Repository](https://github.com/NuralyUI/NuralyUI)
- [Documentation](https://nuralyui.github.io)
- [NPM Organization](https://www.npmjs.com/org/nuralyui)
- [Report Issues](https://github.com/NuralyUI/NuralyUI/issues)
