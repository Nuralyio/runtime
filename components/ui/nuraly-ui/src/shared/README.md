# HybridUI Base Mixin

The `HybridUIBaseMixin` is a global mixin that combines the functionality of `ThemeAwareMixin` and `DependencyValidationMixin` into a single, convenient base class for Hybrid UI components.

## Purpose

This mixin was created to minimize component changes and reduce boilerplate code by providing a single entry point for common functionality needed by Hybrid UI components.

## Features

- **Theme Management**: Automatically detects and responds to light/dark theme changes
- **Dependency Validation**: Validates that required components are available before rendering
- **Type Safety**: Provides TypeScript interfaces for both theme awareness and dependency validation

## Usage

### Basic Usage

```typescript
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HybridUIBaseMixin } from '../../shared/index.js';

@customElement('my-component')
export class MyComponent extends HybridUIBaseMixin(LitElement) {
  // Specify required components (optional)
  override requiredComponents = ['nr-icon', 'hy-tooltip'];

  render() {
    return html`
      <div data-theme="${this.currentTheme}">
        <!-- Your component content -->
      </div>
    `;
  }
}
```

### Alternative Short Name

```typescript
import { BaseMixin } from '../../shared/index.js';

@customElement('my-component')
export class MyComponent extends BaseMixin(LitElement) {
  // Same functionality as HybridUIBaseMixin
}
```

## Migration from Individual Mixins

### Before (Old Pattern)
```typescript
import { DependencyValidationMixin } from '../../shared/dependency-mixin.js';
import { ThemeAwareMixin } from '../../shared/theme-mixin.js';

export class MyComponent extends DependencyValidationMixin(ThemeAwareMixin(LitElement)) {
  // Component implementation
}
```

### After (New Pattern)
```typescript
import { HybridUIBaseMixin } from '../../shared/index.js';

export class MyComponent extends HybridUIBaseMixin(LitElement) {
  // Same component implementation - no changes needed!
}
```

## Available Properties and Methods

### From ThemeAwareMixin
- `currentTheme: 'light' | 'dark'` - Current theme state

### From DependencyValidationMixin
- `requiredComponents: string[]` - Array of required component names
- `validateDependencies(): void` - Validates all required components
- `isComponentAvailable(componentName: string): boolean` - Checks if a component is available

## Benefits

1. **Reduced Imports**: Single import instead of multiple mixin imports
2. **Consistent API**: All components use the same base functionality
3. **Type Safety**: Combined interface provides full type information
4. **Easier Maintenance**: Changes to base functionality only need to be made in one place
5. **Better Developer Experience**: Simpler component creation with less boilerplate
