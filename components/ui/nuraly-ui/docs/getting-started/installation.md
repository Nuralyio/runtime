# Installation Guide

This guide will help you install and set up Nuraly UI components in your project.

## 🚀 Quick Installation

### Prerequisites

- Node.js 16+ or Bun
- A modern web browser
- A JavaScript/TypeScript project

### Install Individual Components

Nuraly UI components are published as individual packages, allowing you to install only what you need:

```bash
# Using npm
npm install @nuralyui/button @nuralyui/input @nuralyui/datepicker

# Using yarn
yarn add @nuralyui/button @nuralyui/input @nuralyui/datepicker

# Using pnpm
pnpm add @nuralyui/button @nuralyui/input @nuralyui/datepicker

# Using bun
bun add @nuralyui/button @nuralyui/input @nuralyui/datepicker
```

### Available Packages

| Component | Package | Description |
|-----------|---------|-------------|
| Button | `@nuralyui/button` | Buttons with multiple variants |
| Input | `@nuralyui/input` | Text inputs with validation |
| Checkbox | `@nuralyui/checkbox` | Checkbox inputs |
| Radio | `@nuralyui/radio` | Radio button groups |
| Select | `@nuralyui/select` | Dropdown selectors |
| Datepicker | `@nuralyui/datepicker` | Calendar date picker |
| Modal | `@nuralyui/modal` | Dialog modals |
| Toast | `@nuralyui/toast` | Notification toasts |
| Tabs | `@nuralyui/tabs` | Tabbed navigation |
| Table | `@nuralyui/table` | Data tables |
| Card | `@nuralyui/card` | Content cards |
| Carousel | `@nuralyui/carousel` | Image carousels |
| ... | ... | [See full list](../components/overview.md) |

## 📦 Framework-Specific Installation

### Vanilla JavaScript/HTML

1. **Install the components:**
   ```bash
   npm install @nuralyui/button @nuralyui/input
   ```

2. **Import in your HTML or JavaScript:**
   ```html
   <script type="module">
     import '@nuralyui/button';
     import '@nuralyui/input';
   </script>
   ```

3. **Use in your HTML:**
   ```html
   <hy-button type="primary">Click me</hy-button>
   <hy-input placeholder="Enter text"></hy-input>
   ```

### React

1. **Install components and React wrappers:**
   ```bash
   npm install @nuralyui/button @nuralyui/input
   npm install @lit-labs/react
   ```

2. **Import React components:**
   ```jsx
   import { HyButton } from '@nuralyui/button/react';
   import { HyInput } from '@nuralyui/input/react';
   ```

3. **Use in your JSX:**
   ```jsx
   function App() {
     return (
       <div>
         <HyButton type="primary">Click me</HyButton>
         <HyInput placeholder="Enter text" />
       </div>
     );
   }
   ```

### Vue 3

1. **Install components:**
   ```bash
   npm install @nuralyui/button @nuralyui/input
   ```

2. **Configure Vue to recognize custom elements:**
   ```javascript
   // vite.config.js or webpack config
   export default {
     define: {
       __VUE_OPTIONS_API__: true,
       __VUE_PROD_DEVTOOLS__: false
     },
     plugins: [
       vue({
         template: {
           compilerOptions: {
             isCustomElement: (tag) => tag.startsWith('hy-')
           }
         }
       })
     ]
   }
   ```

3. **Import and use in components:**
   ```vue
   <template>
     <hy-button type="primary" @click="handleClick">
       Click me
     </hy-button>
     <hy-input placeholder="Enter text" v-model="inputValue" />
   </template>

   <script>
   import '@nuralyui/button';
   import '@nuralyui/input';

   export default {
     data() {
       return {
         inputValue: ''
       };
     },
     methods: {
       handleClick() {
         console.log('Button clicked!');
       }
     }
   };
   </script>
   ```

### Angular

1. **Install components:**
   ```bash
   npm install @nuralyui/button @nuralyui/input
   ```

2. **Add custom elements schema:**
   ```typescript
   // app.module.ts
   import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

   @NgModule({
     schemas: [CUSTOM_ELEMENTS_SCHEMA],
     // ... other config
   })
   export class AppModule { }
   ```

3. **Import in your component:**
   ```typescript
   // app.component.ts
   import '@nuralyui/button';
   import '@nuralyui/input';

   @Component({
     selector: 'app-root',
     template: `
       <hy-button type="primary" (click)="handleClick()">
         Click me
       </hy-button>
       <hy-input placeholder="Enter text" [(ngModel)]="inputValue">
       </hy-input>
     `
   })
   export class AppComponent {
     inputValue = '';

     handleClick() {
       console.log('Button clicked!');
     }
   }
   ```

### Svelte

1. **Install components:**
   ```bash
   npm install @nuralyui/button @nuralyui/input
   ```

2. **Import and use:**
   ```svelte
   <script>
     import '@nuralyui/button';
     import '@nuralyui/input';
     
     let inputValue = '';
     
     function handleClick() {
       console.log('Button clicked!');
     }
   </script>

   <hy-button type="primary" on:click={handleClick}>
     Click me
   </hy-button>
   <hy-input placeholder="Enter text" bind:value={inputValue} />
   ```

## 🎨 Adding Styles

### Import CSS (Optional)

Some components may include optional CSS files for enhanced styling:

```javascript
// Import component styles if available
import '@nuralyui/button/dist/styles.css';
```

### Custom CSS Variables

Set up your theme using CSS custom properties:

```css
:root {
  --hy-primary-color: #4F46E5;
  --hy-secondary-color: #6B7280;
  --hy-success-color: #10B981;
  --hy-error-color: #EF4444;
  --hy-warning-color: #F59E0B;
  
  --hy-font-family: 'Inter', sans-serif;
  --hy-border-radius: 6px;
  --hy-spacing-unit: 8px;
}

/* Dark theme */
@media (prefers-color-scheme: dark) {
  :root {
    --hy-primary-color: #6366F1;
    --hy-bg-primary: #1F2937;
    --hy-text-primary: #F9FAFB;
  }
}
```

## 🔧 Build Configuration

### Vite

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    include: ['lit', '@lit/reactive-element', '@lit/context']
  },
  build: {
    rollupOptions: {
      external: id => id.startsWith('@nuralyui/') && id.includes('/react')
    }
  }
}
```

### Webpack

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      '@nuralyui': path.resolve(__dirname, 'node_modules/@nuralyui')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: /node_modules\/@nuralyui/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["@nuralyui/types"],
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "experimentalDecorators": true
  },
  "include": [
    "src/**/*",
    "node_modules/@nuralyui/*/dist/**/*.d.ts"
  ]
}
```

## 🌐 CDN Usage

For quick prototyping or simple projects, you can use components via CDN:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Nuraly UI via CDN</title>
  <script type="module" src="https://unpkg.com/@nuralyui/button"></script>
  <script type="module" src="https://unpkg.com/@nuralyui/input"></script>
</head>
<body>
  <hy-button type="primary">Click me</hy-button>
  <hy-input placeholder="Enter text"></hy-input>
</body>
</html>
```

## 🔍 Verifying Installation

Create a simple test page to verify everything is working:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Nuraly UI Test</title>
  <script type="module">
    import '@nuralyui/button';
    import '@nuralyui/input';
    
    // Test event handling
    document.addEventListener('DOMContentLoaded', () => {
      const button = document.querySelector('hy-button');
      button.addEventListener('click', () => {
        alert('Nuraly UI is working!');
      });
    });
  </script>
  <style>
    body {
      font-family: system-ui, sans-serif;
      padding: 2rem;
    }
    .test-container {
      max-width: 400px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  </style>
</head>
<body>
  <div class="test-container">
    <h1>Nuraly UI Installation Test</h1>
    <hy-input placeholder="Enter some text..."></hy-input>
    <hy-button type="primary">Test Button</hy-button>
  </div>
</body>
</html>
```

## 🚨 Troubleshooting

### Common Issues

**Module not found errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors:**
```bash
# Install type definitions
npm install --save-dev @types/node
```

**Custom elements not recognized:**
- Ensure you're using a modern browser that supports custom elements
- Check that you've imported the components before using them
- For frameworks, ensure custom elements are properly configured

**Styling issues:**
- Make sure CSS custom properties are defined
- Check for conflicting CSS rules
- Verify component styles are loading correctly

### Getting Help

- 📖 Check our [documentation](../README.md)
- 🐛 Report issues on [GitHub](https://github.com/NuralyUI/NuralyUI/issues)
- 💬 Ask questions in [Discussions](https://github.com/NuralyUI/NuralyUI/discussions)
- 📧 Contact support for critical issues

## ➡️ Next Steps

1. **[Quick Start Guide](./quick-start.md)** - Build your first app
2. **[Framework Integration](./frameworks.md)** - Detailed framework guides
3. **[Component Overview](../components/overview.md)** - Explore all components
4. **[Theming Guide](../customization/theming.md)** - Customize the look and feel

---

**Ready to build something amazing? Let's get started! 🚀**
