# @nuralyui/layout

Layout components package for Nuraly UI Library. This package contains responsive layout and container components.

[![npm version](https://badge.fury.io/js/@nuralyui%2Flayout.svg)](https://badge.fury.io/js/@nuralyui%2Flayout)
[![License](https://img.shields.io/badge/license-BSD--3--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)

## 📦 Included Components

- **layout** - Main layout container with header, footer, sider support
- **grid** - Responsive grid system
- **flex** - Flexbox layout utilities
- **card** - Content cards with header and actions

## 🚀 Installation

```bash
npm install @nuralyui/layout
```

## 📖 Usage

### Import All Layout Components

```javascript
import '@nuralyui/layout';
```

### Import Individual Components

```javascript
import '@nuralyui/layout/layout';
import '@nuralyui/layout/grid';
import '@nuralyui/layout/flex';
```

### HTML Usage

```html
<nr-layout>
  <nr-header slot="header">Header</nr-header>
  <nr-content>Main Content</nr-content>
  <nr-footer slot="footer">Footer</nr-footer>
</nr-layout>

<nr-grid cols="3" gap="1rem">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</nr-grid>
```

### React Usage

```tsx
import { NrLayout, NrHeader, NrContent, NrFooter, NrGrid } from '@nuralyui/layout/react';

function App() {
  return (
    <NrLayout>
      <NrHeader slot="header">My App</NrHeader>
      <NrContent>Main content here</NrContent>
      <NrFooter slot="footer">© 2025</NrFooter>
    </NrLayout>
  );
}
```

## 📊 Component Versions

See the `VERSIONS.md` file in the package for component version information.

## 🔗 Links

- [GitHub Repository](https://github.com/NuralyUI/NuralyUI)
- [Documentation](https://nuralyui.github.io)
- [NPM Organization](https://www.npmjs.com/org/nuralyui)
