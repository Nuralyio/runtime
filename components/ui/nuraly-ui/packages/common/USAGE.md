# @nuralyui/common - Usage Examples

## Installation

```bash
npm install @nuralyui/common
```

## Basic Usage Examples

### 1. Import All Components

```javascript
// Import everything at once
import '@nuralyui/common';

// Now all components are available
```

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import '@nuralyui/common';
  </script>
### 1. Import Shared Utilities
<body>
  <nr-icon name="heart" type="solid"></nr-icon>
  <nr-badge count="5">
import { NuralyUIBaseMixin, ThemeAwareMixin } from '@nuralyui/common/mixins';
  </nr-badge>
  <nr-divider>Section</nr-divider>
  <nr-label>Email</nr-label>
</body>
</html>
```

### 2. Import Individual Components (Tree-shakeable)

    import { ThemeController, SharedDropdownController } from '@nuralyui/common/controllers';
// Only import what you need
import '@nuralyui/common/icon';
import '@nuralyui/common/badge';
```

```html
<nr-icon name="star" type="solid"></nr-icon>
<nr-badge count="10">
  <span>Messages</span>
</nr-badge>
```

### 3. TypeScript Usage
### 2. Import Individual Utilities
```typescript
import '@nuralyui/common';
import type { NrIconElement } from '@nuralyui/common/icon';
import { getCurrentTheme, type ThemeVariant } from '@nuralyui/common/themes';
import { throttle, debounce, rafThrottle } from '@nuralyui/common/utils';
const icon = document.querySelector<NrIconElement>('nr-icon');
const badge = document.querySelector<NrBadgeElement>('nr-badge');

if (icon) {
  icon.name = 'check';
  icon.type = 'solid';
}

if (badge) {
  badge.count = 5;
}
```

## Framework-Specific Examples

### React

```tsx
import React from 'react';
import { NrIcon, NrBadge, NrDivider, NrLabel } from '@nuralyui/common/react';

export default function App() {
  return (
    <div>
      {/* Icon */}
      <NrIcon name="heart" type="solid" style={{ color: 'red' }} />
      
      {/* Badge */}
      <NrBadge count={5}>
        <button>Notifications</button>
      </NrBadge>
      
      {/* Divider */}
      <NrDivider>Section Title</NrDivider>
      
import { ThemeController } from '@nuralyui/common/controllers';
      <NrLabel>Email Address</NrLabel>
      <input type="email" />
  const [themeCtrl] = React.useState(() => new ThemeController({ hostConnected() {}, hostDisconnected() {} } as any));
  return <div>Current theme: {themeCtrl.currentTheme}</div>;
    <!-- Divider -->
    <nr-divider>Section Title</nr-divider>
    
    <!-- Label -->
    <nr-label>Email Address</nr-label>
    <input type="email" v-model="email" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import '@nuralyui/common';

const notificationCount = ref(5);
const email = ref('');
</script>
```

### Angular

```typescript
// app.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

// Import common components
import { ThemeController } from '@nuralyui/common/controllers';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

```html
<!-- app.component.html -->
<div>
  <!-- Icon -->
  <nr-icon name="heart" type="solid" [style.color]="'red'"></nr-icon>
import { ThemeController } from '@nuralyui/common/controllers';
  
  <!-- Badge -->
  <nr-badge [count]="notificationCount">
    <button>Notifications</button>
  </nr-badge>
  
  <!-- Divider -->
  <nr-divider>Section Title</nr-divider>
  
  <!-- Label -->
  <nr-label>Email Address</nr-label>
  <input type="email" [(ngModel)]="email" />
</div>
```

```typescript
// app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  notificationCount = 5;
  email = '';
}
```

### Svelte

```svelte
<script>
  import '@nuralyui/common';
  
  import { getCurrentTheme } from '@nuralyui/common/themes';
  let email = '';
</script>

<div>
  <!-- Icon -->
  <nr-icon name="heart" type="solid" style="color: red;"></nr-icon>
  
  <!-- Badge -->
  <nr-badge count={notificationCount}>
    <button>Notifications</button>
  </nr-badge>
  
  <!-- Divider -->
  <nr-divider>Section Title</nr-divider>
  
  <!-- Label -->
  <nr-label>Email Address</nr-label>
  <input type="email" bind:value={email} />
</div>
```

## Component-Specific Examples

### Icon Component

```html
<!-- Basic icon -->
<nr-icon name="heart"></nr-icon>

<!-- Solid icon -->
<nr-icon name="star" type="solid"></nr-icon>

<!-- Regular icon -->
<nr-icon name="star" type="regular"></nr-icon>

<!-- Styled icon -->
<nr-icon 
  name="home" 
  type="solid" 
  style="font-size: 2rem; color: #007bff;">
</nr-icon>
```

### Badge Component

```html
<!-- Count badge -->
<nr-badge count="5">
  <button>Inbox</button>
</nr-badge>

<!-- Dot badge -->
<nr-badge dot>
  <nr-icon name="notification"></nr-icon>
</nr-badge>

<!-- Status badge -->
<nr-badge status="success" text="Active"></nr-badge>

<!-- Overflow count -->
<nr-badge count="100" overflow-count="99">
  <button>Messages</button>
</nr-badge>

<!-- Ribbon badge -->
<nr-badge ribbon="Hot" color="red">
  <div class="card">Product Card</div>
</nr-badge>
```

### Divider Component

```html
<!-- Horizontal divider -->
<nr-divider></nr-divider>

<!-- Divider with text -->
<nr-divider>Section Title</nr-divider>

<!-- Vertical divider -->
<a href="#">Link 1</a>
<nr-divider type="vertical"></nr-divider>
<a href="#">Link 2</a>

<!-- Dashed divider -->
<nr-divider variant="dashed">Dashed</nr-divider>

<!-- Dotted divider -->
<nr-divider variant="dotted">Dotted</nr-divider>
```

### Label Component

```html
<!-- Basic label -->
<nr-label>Username</nr-label>
<input type="text" />

<!-- Required label -->
<nr-label required>Email</nr-label>
<input type="email" />

<!-- Label with description -->
<nr-label description="We'll never share your email">
  Email Address
</nr-label>
<input type="email" />
```

## Build Optimization

### Webpack

```javascript
// webpack.config.js
module.exports = {
  // ... other config
  optimization: {
    usedExports: true, // Enable tree-shaking
  }
};
```

### Vite

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'nuralyui-common': ['@nuralyui/common']
        }
      }
    }
  }
}
```

### Rollup

```javascript
// rollup.config.js
export default {
  // ... other config
  plugins: [
    // Enables tree-shaking
    terser()
  ]
};
```

## Publishing

To publish the package:

```bash
# Build the package
npm run build

# Navigate to package directory
cd packages/common

# Publish to npm
npm publish --access public
```

## Local Development

Link the package for local development:

```bash
# In packages/common
npm link

# In your project
npm link @nuralyui/common
```
