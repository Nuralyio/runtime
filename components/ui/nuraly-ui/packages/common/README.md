# @nuralyui/common

Common UI components package for Nuraly UI Library. This package contains basic building blocks that are commonly used across the component library and in applications.

[![npm version](https://badge.fury.io/js/@nuralyui%2Fcommon.svg)](https://badge.fury.io/js/@nuralyui%2Fcommon)
[![License](https://img.shields.io/badge/license-BSD--3--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)

## 📦 Included Components

This package includes the following essential UI components:

### 🎨 Icon
Scalable vector icons powered by FontAwesome. Supports solid and regular icon types with customizable sizes and colors.

### 🔔 Badge
Numerical indicators and status badges. Perfect for notification counts, status indicators, and decorative ribbons.

### ➗ Divider
Content separators for organizing UI sections. Supports horizontal and vertical orientations with customizable styles.

### 🏷️ Label
Enhanced text labels with built-in accessibility features and styling options.

## 📊 Component Versions

This package bundles multiple components together. To see which version of each component is included, refer to the `VERSIONS.md` file in the package.

Current versions:
- **icon**: v0.0.7
- **badge**: v0.0.1
- **divider**: v0.0.4
- **label**: v0.0.13

## 🚀 Installation

```bash
npm install @nuralyui/common
```

Or using yarn:

```bash
yarn add @nuralyui/common
```

## 📖 Usage

### Import All Components

```javascript
// Import all common components at once
import '@nuralyui/common';
```

### Import Individual Components

```javascript
// Import only what you need
import '@nuralyui/common/icon';
import '@nuralyui/common/badge';
import '@nuralyui/common/divider';
import '@nuralyui/common/label';
```

### HTML Usage

```html
<!-- Icon -->
<nr-icon name="heart" type="solid"></nr-icon>

<!-- Badge -->
<nr-badge count="5">
  <button>Notifications</button>
</nr-badge>

<!-- Divider -->
<nr-divider>Section Title</nr-divider>

<!-- Label -->
<nr-label>Email Address</nr-label>
```

### React Usage

```tsx
import { NrIcon, NrBadge, NrDivider, NrLabel } from '@nuralyui/common/react';

function App() {
  return (
    <div>
      <NrIcon name="heart" type="solid" />
      
      <NrBadge count={5}>
        <button>Notifications</button>
      </NrBadge>
      
      <NrDivider>Section Title</NrDivider>
      
      <NrLabel>Email Address</NrLabel>
    </div>
  );
}
```

### Vue Usage

```vue
<template>
  <div>
    <nr-icon name="heart" type="solid"></nr-icon>
    
    <nr-badge :count="5">
      <button>Notifications</button>
    </nr-badge>
    
    <nr-divider>Section Title</nr-divider>
    
    <nr-label>Email Address</nr-label>
  </div>
</template>

<script>
import '@nuralyui/common';

export default {
  name: 'App'
}
</script>
```

### Angular Usage

```typescript
// app.module.ts
import '@nuralyui/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
```

```html
<!-- app.component.html -->
<nr-icon name="heart" type="solid"></nr-icon>

<nr-badge [count]="5">
  <button>Notifications</button>
</nr-badge>

<nr-divider>Section Title</nr-divider>

<nr-label>Email Address</nr-label>
```

## 🎯 Why Use @nuralyui/common?

### Single Package Import
Instead of installing multiple individual component packages, get all common components in one package:

```bash
# Before (multiple packages)
npm install @nuralyui/icon @nuralyui/badge @nuralyui/divider @nuralyui/label

# After (single package)
npm install @nuralyui/common
```

### Optimized Bundle Size
The package is optimized to include only the essential common components, keeping your bundle size small.

### Consistent Versioning
All common components are versioned together, ensuring compatibility across the components.

### Tree-Shakeable
Import only what you need - unused components won't be included in your bundle:

```javascript
// Only icon will be bundled
import '@nuralyui/common/icon';
```

## 📚 Component Documentation

For detailed documentation on each component, please visit:

- [Icon Component](https://github.com/NuralyUI/NuralyUI/tree/main/src/components/icon)
- [Badge Component](https://github.com/NuralyUI/NuralyUI/tree/main/src/components/badge)
- [Divider Component](https://github.com/NuralyUI/NuralyUI/tree/main/src/components/divider)
- [Label Component](https://github.com/NuralyUI/NuralyUI/tree/main/src/components/label)

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
