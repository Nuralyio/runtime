# Nuraly UI - CDN Usage Examples

This directory contains examples demonstrating how to use Nuraly UI components directly from a CDN using modern JavaScript ES modules.

## 📋 Examples Overview

### 1. `cdn-basic.html` - Basic CDN Usage
A beginner-friendly example showing:
- ✅ Direct ES ### 4. Error Handling
Always handle import errors:
```javascript
try {
  await import('@nuralyui/datepicker/bundle');
} catch (error) {
  console.error('Failed to load datepicker:', error);
  // Show fallback UI
}
```

### 5. Component Definition Checkts from CDN
- ✅ Using Import Maps for cleaner imports
- ✅ Basic component usage (buttons, inputs, badges, alerts)
- ✅ Simple event handling
- ✅ Form interaction examples

**Best for**: Getting started, simple applications, prototyping

### 2. `cdn-advanced.html` - Advanced CDN Patterns
A comprehensive example demonstrating:
- ✅ Dynamic component loading (lazy loading)
- ✅ Component factory pattern
- ✅ Reactive data binding
- ✅ Event handling and logging
- ✅ Import Maps configuration
- ✅ Performance optimization techniques

**Best for**: Production applications, complex UIs, optimal performance

## 🚀 Quick Start

### Option 1: Open Directly in Browser
Simply open any HTML file in your web browser:
```bash
# Using default browser
open cdn-basic.html

# Or using specific browser
google-chrome cdn-basic.html
firefox cdn-advanced.html
```

### Option 2: Use a Local Server
For better development experience, use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then open: `http://localhost:8000/cdn-basic.html`

## 📦 CDN Options

The examples use unpkg.com, but you can use any CDN that hosts npm packages:

### 1. unpkg.com (Default in examples)
```javascript
// Use /bundle.js for standalone components (recommended for CDN)
import 'https://unpkg.com/@nuralyui/button@latest/bundle.js';
import 'https://unpkg.com/@nuralyui/common@latest/dist/index.js';
```

### 2. jsDelivr
```javascript
// Use /bundle.js for standalone components (recommended for CDN)
import 'https://cdn.jsdelivr.net/npm/@nuralyui/button@latest/bundle.js';
import 'https://cdn.jsdelivr.net/npm/@nuralyui/common@latest/dist/index.js';
```

### 3. esm.sh
```javascript
import 'https://esm.sh/@nuralyui/button@latest?bundle';
import 'https://esm.sh/@nuralyui/common@latest';
```

### 4. Your Own CDN
Host the built components on your own CDN:
```javascript
import 'https://cdn.yourdomain.com/nuralyui/button/index.js';
```

## 💡 Import Strategies

### Strategy 1: Bundled Components (Recommended for CDN)
Self-contained bundles with all dependencies inlined:
```html
<script type="module">
  import 'https://unpkg.com/@nuralyui/button@latest/bundle.js';
  import 'https://unpkg.com/@nuralyui/input@latest/bundle.js';
</script>
```

### Strategy 2: Direct Imports
Simple and straightforward (may have module resolution issues):
```html
<script type="module">
  import 'https://unpkg.com/@nuralyui/button@latest/index.js';
  import 'https://unpkg.com/@nuralyui/input@latest/index.js';
</script>
```

### Strategy 3: Import Maps (Recommended)
Cleaner and more maintainable:
```html
<script type="importmap">
{
  "imports": {
    "@nuralyui/button": "https://unpkg.com/@nuralyui/button@latest/bundle.js",
    "@nuralyui/input": "https://unpkg.com/@nuralyui/input@latest/bundle.js"
  }
}
</script>

<script type="module">
  import '@nuralyui/button';
  import '@nuralyui/input';
</script>
```

### Strategy 4: Dynamic Imports (Best for Performance)
Load components only when needed:
```javascript
// Load on demand
button.addEventListener('click', async () => {
  await import('https://unpkg.com/@nuralyui/modal@latest/bundle.js');
  
  // Use the component after it's loaded
  const modal = document.createElement('nr-modal');
  modal.show();
});
```

### Strategy 5: Package Bundles
Import entire package bundles for convenience:
```javascript
// Import all form components at once
import 'https://unpkg.com/@nuralyui/forms@latest/dist/index.js';

// Import all common components
import 'https://unpkg.com/@nuralyui/common@latest/dist/index.js';
```

## 🎯 Usage Patterns

### Pattern 1: Declarative Usage
Define components in HTML:
```html
<nr-button variant="primary">Click me</nr-button>
<nr-input label="Name" placeholder="Enter name"></nr-input>
```

### Pattern 2: Programmatic Creation
Create components with JavaScript:
```javascript
const button = document.createElement('nr-button');
button.setAttribute('variant', 'primary');
button.textContent = 'Click me';
document.body.appendChild(button);
```

### Pattern 3: Component Factory
Reusable component creation:
```javascript
class ComponentFactory {
  static createButton(variant, text) {
    const btn = document.createElement('nr-button');
    btn.setAttribute('variant', variant);
    btn.textContent = text;
    return btn;
  }
}

const primaryBtn = ComponentFactory.createButton('primary', 'Save');
```

### Pattern 4: Reactive Binding
Connect components to state:
```javascript
let state = { value: 50 };

const slider = document.querySelector('nr-slider-input');
const display = document.querySelector('#display');

slider.addEventListener('input', (e) => {
  state.value = e.target.value;
  display.textContent = state.value;
});
```

## 🔧 Common Scenarios

### Scenario 1: Form Handling
```javascript
const form = document.querySelector('form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const formData = {
    name: document.querySelector('#name-input').value,
    email: document.querySelector('#email-input').value,
  };
  
  console.log('Form data:', formData);
});
```

### Scenario 2: Modal Dialog
```javascript
// Dynamically load and show modal
async function showModal(title, content) {
  await import('@nuralyui/modal');
  
  const modal = document.createElement('nr-modal');
  modal.setAttribute('title', title);
  modal.innerHTML = content;
  
  document.body.appendChild(modal);
  await customElements.whenDefined('nr-modal');
  modal.show();
}
```

### Scenario 3: Data Table
```javascript
// Load table component and populate with data
async function createTable(data) {
  await import('@nuralyui/table');
  
  const table = document.createElement('nr-table');
  table.columns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Email', dataIndex: 'email' }
  ];
  table.data = data;
  
  document.querySelector('#table-container').appendChild(table);
}
```

## 🌐 Browser Support

Import Maps require modern browsers:
- ✅ Chrome/Edge 89+
- ✅ Safari 16.4+
- ✅ Firefox 108+

For older browsers, use direct imports or a polyfill:
```html
<script async src="https://ga.jspm.io/npm:es-module-shims@1.6.3/dist/es-module-shims.js"></script>
```

## 📝 Best Practices

### 1. Version Pinning
Always pin to specific versions in production:
```javascript
// ❌ Avoid in production (always gets latest, can break)
import 'https://unpkg.com/@nuralyui/button@latest/bundle.js';

// ✅ Better - pin to specific version
import 'https://unpkg.com/@nuralyui/button@0.0.14/bundle.js';
```

### 2. Use Bundled Versions for CDN
Always use `/bundle.js` for individual components loaded from CDN:
```javascript
// ✅ Recommended - bundled version with dependencies inlined
import 'https://unpkg.com/@nuralyui/button@0.0.14/bundle.js';

// ❌ May fail - requires shared module resolution
import 'https://unpkg.com/@nuralyui/button@0.0.14/index.js';
```

### 3. Lazy Loading
Load components only when needed:
```javascript
// Load heavy components on interaction
document.getElementById('chart-btn').addEventListener('click', async () => {
  await import('@nuralyui/chart/bundle');
  // Component ready to use
}, { once: true });
```

### 4. Error Handling
Always handle import errors:
```javascript
try {
  await import('@nuralyui/datepicker');
} catch (error) {
  console.error('Failed to load datepicker:', error);
  // Show fallback UI
}
```

### 5. Component Definition Check
Wait for components to be defined:
```javascript
await customElements.whenDefined('nr-modal');
// Now safe to use the modal
```

### 6. Event Delegation
Use event delegation for better performance:
```javascript
document.addEventListener('click', (e) => {
  if (e.target.matches('nr-button[variant="danger"]')) {
    // Handle all danger button clicks
  }
});
```

## 🚨 Troubleshooting

### Issue: Shared module resolution error
**Problem**: Components fail to load with error like `Failed to resolve module specifier "../../shared/base-mixin.js"`

**Solution 1 - Use bundled versions** (components have all dependencies inlined):
```javascript
// ✅ Use bundle.js for standalone components (recommended for CDN)
import 'https://unpkg.com/@nuralyui/button@latest/bundle.js';
```

**Solution 2 - Use @nuralyui/common package** (includes shared utilities):
```javascript
// Import shared utilities from @nuralyui/common
import 'https://unpkg.com/@nuralyui/common@latest/dist/index.js';

// Then import components (they can now resolve shared dependencies)
import 'https://unpkg.com/@nuralyui/button@latest/index.js';
```

**Solution 3 - Use package bundles** (handles dependencies automatically):
```javascript
// Package bundles include all necessary dependencies
import 'https://unpkg.com/@nuralyui/forms@latest/dist/index.js';
import 'https://unpkg.com/@nuralyui/common@latest/dist/index.js';
```

**For custom component development:**
```javascript
// Import mixins and utilities for creating custom components
import { NuralyUIBaseMixin } from 'https://unpkg.com/@nuralyui/common@latest/dist/mixins.js';
import { ThemeController } from 'https://unpkg.com/@nuralyui/common@latest/dist/controllers.js';
```

### Issue: Components not rendering
**Solution**: Ensure the CDN URL is correct and the component is published:
```javascript
// Check if component is defined
if (customElements.get('nr-button')) {
  console.log('Button component is registered');
} else {
  console.error('Button component not found');
}
```

### Issue: Import Map not working
**Solution**: Import Maps must be defined before any module scripts:
```html
<!-- ✅ Correct order -->
<script type="importmap">...</script>
<script type="module">...</script>

<!-- ❌ Wrong order -->
<script type="module">...</script>
<script type="importmap">...</script>
```

### Issue: CORS errors
**Solution**: Use a CDN that sets proper CORS headers or host the files yourself.

### Issue: Slow loading
**Solution**: 
- Use version pinning (enables CDN caching)
- Implement dynamic imports for large components
- Consider bundling for production

## 📚 Additional Resources

- [Import Maps Specification](https://github.com/WICG/import-maps)
- [ES Modules in Browsers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Web Components Best Practices](https://web.dev/custom-elements-best-practices/)
- [unpkg.com Documentation](https://unpkg.com/)
- [jsDelivr Documentation](https://www.jsdelivr.com/)

## 🤝 Contributing

Found an issue with the examples? Have a suggestion for improvement?
Please open an issue or submit a pull request on GitHub.

## 📄 License

These examples are part of the Nuraly UI project and are licensed under the BSD-3-Clause License.

---

**Need help?** Check out the [main documentation](../README.md) or open an issue on GitHub.
