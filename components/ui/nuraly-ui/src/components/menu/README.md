# Menu Component (@nuralyui/menu)

A versatile and hierarchical menu component built with Lit and TypeScript. Supports nested submenus, icons, status indicators, and custom actions.

## Features

- 🌲 Hierarchical nested menu structure
- 🎨 Icon support for menu items
- 🔗 Link navigation support
- 📊 Status indicators
- 🎯 Accessible by default
- 🌗 Dark/light theme support
- ⌨️ Full keyboard navigation
- 🚫 Disabled state handling
- 📱 Responsive design

## Installation

```bash
npm install @nuralyui/menu
# or
yarn add @nuralyui/menu
# or
bun add @nuralyui/menu
```

## Usage

### Basic Usage

```html
<script type="module">
  import '@nuralyui/menu';
</script>

<nr-menu .items="${menuItems}"></nr-menu>
```

### React Integration

```jsx
import { NrMenu } from '@nuralyui/menu/react';

function App() {
  const menuItems = [
    {
      text: 'Home',
      icon: 'home',
      link: '/home',
      selected: true
    },
    {
      text: 'Settings',
      icon: 'settings',
      children: [
        { text: 'Profile', link: '/settings/profile' },
        { text: 'Security', link: '/settings/security' }
      ]
    }
  ];

  const handleChange = (event) => {
    console.log('Selected:', event.detail);
  };

  return <NrMenu items={menuItems} onChange={handleChange} />;
}
```

### TypeScript

```typescript
import type { IMenu } from '@nuralyui/menu';

const menuItems: IMenu[] = [
  {
    text: 'Dashboard',
    icon: 'dashboard',
    link: '/dashboard',
    selected: true
  },
  {
    text: 'Projects',
    icon: 'folder',
    children: [
      {
        text: 'Active Projects',
        link: '/projects/active'
      },
      {
        text: 'Archived',
        link: '/projects/archived',
        disabled: true
      }
    ]
  }
];
```

## Menu Item Configuration

### Component Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `items` | `IMenu[]` | `[]` | Array of menu items to display |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Menu size variant controlling padding and spacing |

### IMenu Interface

```typescript
interface IMenu {
  text: string;                           // Display text
  link?: string;                          // Navigation URL
  icon?: string;                          // Icon name
  iconPosition?: 'left' | 'right';        // Icon position
  selected?: boolean;                     // Selection state
  disabled?: boolean;                     // Disabled state
  menu?: {                                // Menu actions
    icon: string;
    actions: IAction[];
  };
  status?: {                              // Status indicator
    icon: string;
    label: string;
  };
  children?: IMenu[];                     // Nested items
}

interface IAction {
  label: string;
  value: string;
}
```

## Examples

### Simple Menu

```html
<nr-menu .items="${[
  { text: 'Home', icon: 'home', link: '/', selected: true },
  { text: 'About', icon: 'info', link: '/about' },
  { text: 'Contact', icon: 'mail', link: '/contact' }
]}"></nr-menu>
```

### Nested Menu

```html
<nr-menu .items="${[
  {
    text: 'Products',
    icon: 'shopping-bag',
    children: [
      {
        text: 'Electronics',
        children: [
          { text: 'Phones', link: '/products/electronics/phones' },
          { text: 'Laptops', link: '/products/electronics/laptops' }
        ]
      },
      { text: 'Clothing', link: '/products/clothing' }
    ]
  }
]}"></nr-menu>
```

### Menu with Status

```html
<nr-menu .items="${[
  {
    text: 'Dashboard',
    icon: 'dashboard',
    link: '/dashboard',
    status: {
      icon: 'check-circle',
      label: 'Active'
    }
  },
  {
    text: 'Reports',
    icon: 'chart-bar',
    link: '/reports',
    status: {
      icon: 'alert-triangle',
      label: 'Pending'
    }
  }
]}"></nr-menu>
```

### Menu with Actions

```html
<nr-menu .items="${[
  {
    text: 'File Manager',
    icon: 'folder',
    menu: {
      icon: 'more-vertical',
      actions: [
        { label: 'Rename', value: 'rename' },
        { label: 'Delete', value: 'delete' },
        { label: 'Share', value: 'share' }
      ]
    }
  }
]}"></nr-menu>
```

### Disabled Items

```html
<nr-menu .items="${[
  { text: 'Available', icon: 'check', link: '/available' },
  { text: 'Coming Soon', icon: 'clock', disabled: true },
  { text: 'Deprecated', icon: 'x', link: '/deprecated', disabled: true }
]}"></nr-menu>
```

### Size Variants

The menu component supports three size variants for different use cases:

```html
<!-- Small: Compact spacing for dense layouts -->
<nr-menu size="small" .items="${menuItems}"></nr-menu>

<!-- Medium (default): Balanced spacing for standard layouts -->
<nr-menu size="medium" .items="${menuItems}"></nr-menu>

<!-- Large: Generous spacing for better touch targets -->
<nr-menu size="large" .items="${menuItems}"></nr-menu>
```

**Size Guidelines:**
- **Small**: Use in sidebars, compact panels, or when space is limited
- **Medium**: Default size, suitable for most applications
- **Large**: Use for touch interfaces or when accessibility is a priority

## Events

### change

Fired when a menu item is selected.

```typescript
interface MenuChangeEvent {
  detail: {
    path: number[];    // Path to the selected item in the tree
    value: string;     // Value of the selected item
  }
}
```

```javascript
const menu = document.querySelector('nr-menu');
menu.addEventListener('change', (event) => {
  console.log('Selected path:', event.detail.path);
  console.log('Selected value:', event.detail.value);
});
```

## Styling

The menu component uses CSS custom properties for theming. You can customize the appearance by overriding these variables:

```css
nr-menu {
  --nuraly-menu-background: var(--nuraly-color-background);
  --nuraly-menu-text-color: var(--nuraly-color-text);
  --nuraly-menu-hover-background: var(--nuraly-color-hover);
  --nuraly-menu-selected-background: var(--nuraly-color-primary);
  --nuraly-menu-selected-text: var(--nuraly-color-primary-text);
  --nuraly-menu-border-color: var(--nuraly-color-border);
  --nuraly-menu-disabled-opacity: 0.5;
}
```

## Theme Support

The menu component supports multiple design systems through the NuralyUI theme system:

- **Carbon Design System**: `carbon-light`, `carbon-dark`
- **Default Design System**: `default-light`, `default-dark`

Set the theme using the `data-theme` attribute:

```html
<div data-theme="carbon-dark">
  <nr-menu .items="${menuItems}"></nr-menu>
</div>
```

## Accessibility

The menu component is built with accessibility in mind:

- Semantic HTML structure with `<ul>` and `<li>` elements
- Proper ARIA attributes for navigation
- Keyboard navigation support
- Screen reader friendly
- Focus management for nested menus
- Disabled state properly communicated

## Best Practices

1. **Keep menu hierarchy shallow**: Limit nesting to 2-3 levels for better UX
2. **Use icons consistently**: Either use icons for all items or none
3. **Provide clear labels**: Use descriptive text for menu items
4. **Handle selection state**: Update the `selected` property when navigation occurs
5. **Group related items**: Use submenus to organize related functionality
6. **Disable appropriately**: Only disable items that are temporarily unavailable

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

Required components:
- `@nuralyui/icon` - For icon rendering

## License

ISC

## Author

Labidi Aymen

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

## Repository

[GitHub Repository](https://github.com/NuralyUI/NuralyUI/tree/main/src/components/menu)
