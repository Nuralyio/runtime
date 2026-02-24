# Breadcrumb Component

Display the current location within a hierarchy and allow navigation back to higher levels. Breadcrumbs show where you are in the site structure and make it easy to navigate up the hierarchy.

## Installation

```bash
npm install @nuralyui/breadcrumb
```

## Usage

### Basic Breadcrumb

```html
<nr-breadcrumb></nr-breadcrumb>

<script>
  const breadcrumb = document.querySelector('nr-breadcrumb');
  breadcrumb.items = [
    { title: 'Home', href: '/' },
    { title: 'Category', href: '/category' },
    { title: 'Product' }
  ];
</script>
```

### With Custom Separator

```html
<nr-breadcrumb separator=">"></nr-breadcrumb>

<script>
  const breadcrumb = document.querySelector('nr-breadcrumb');
  breadcrumb.items = [
    { title: 'Home', href: '/' },
    { title: 'Products', href: '/products' },
    { title: 'Electronics' }
  ];
</script>
```

### With Icons

```html
<nr-breadcrumb></nr-breadcrumb>

<script>
  const breadcrumb = document.querySelector('nr-breadcrumb');
  breadcrumb.items = [
    { title: 'Home', icon: 'home', href: '/' },
    { title: 'Settings', icon: 'settings', href: '/settings' },
    { title: 'Profile' }
  ];
</script>
```

### With Dropdown Menu

```html
<nr-breadcrumb></nr-breadcrumb>

<script>
  const breadcrumb = document.querySelector('nr-breadcrumb');
  breadcrumb.items = [
    { title: 'Home', href: '/' },
    { 
      title: 'Products',
      menu: [
        { label: 'Electronics', href: '/products/electronics' },
        { label: 'Clothing', href: '/products/clothing' },
        { label: 'Books', href: '/products/books' }
      ]
    },
    { title: 'Current Item' }
  ];
</script>
```

### With Icon Separator

```html
<nr-breadcrumb></nr-breadcrumb>

<script>
  const breadcrumb = document.querySelector('nr-breadcrumb');
  breadcrumb.separatorConfig = {
    separator: 'chevron-right',
    isIcon: true,
    iconType: 'regular'
  };
  breadcrumb.items = [
    { title: 'Home', href: '/' },
    { title: 'Category', href: '/category' },
    { title: 'Product' }
  ];
</script>
```

### With Click Handlers

```html
<nr-breadcrumb></nr-breadcrumb>

<script>
  const breadcrumb = document.querySelector('nr-breadcrumb');
  breadcrumb.items = [
    { 
      title: 'Home', 
      onClick: (e) => {
        e.preventDefault();
        console.log('Home clicked');
      }
    },
    { title: 'Current Page' }
  ];
  
  // Listen to breadcrumb click events
  breadcrumb.addEventListener('nr-breadcrumb-click', (e) => {
    console.log('Breadcrumb clicked:', e.detail.item);
  });
</script>
```

## React Usage

```jsx
import { NrBreadcrumb } from '@nuralyui/breadcrumb/react';
function App() {
  const items = [
    { title: 'Home', href: '/' },
    { title: 'Category', href: '/category' },
    { title: 'Product' }
  ];
  const handleBreadcrumbClick = (e) => {
    console.log('Breadcrumb clicked:', e.detail.item);
  };
  return (
    <NrBreadcrumb
      items={items}
      separator=">"
      onBreadcrumbClick={handleBreadcrumbClick}
    />
  );
}
```

## API

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `items` | `BreadcrumbItem[]` | `[]` | Array of breadcrumb items to display |
| `separator` | `BreadcrumbSeparator \| string` | `'/'` | Separator between breadcrumb items |
| `separatorConfig` | `BreadcrumbSeparatorConfig` | `undefined` | Custom separator configuration |

### BreadcrumbItem Interface

```typescript
interface BreadcrumbItem {
  title: string;              // Item title/label
  href?: string;              // Target URL or path
  onClick?: (e: MouseEvent) => void;  // Click handler
  icon?: string;              // Icon name
  iconType?: 'solid' | 'regular';     // Icon type
  className?: string;         // Custom class name
  disabled?: boolean;         // Whether item is disabled
  menu?: BreadcrumbMenuItem[]; // Dropdown menu items
}
```

### BreadcrumbMenuItem Interface

```typescript
interface BreadcrumbMenuItem {
  label: string;              // Menu item label
  href?: string;              // Menu item URL
  onClick?: (e: MouseEvent) => void;  // Click handler
  icon?: string;              // Icon for menu item
  disabled?: boolean;         // Whether menu item is disabled
}
```

### BreadcrumbSeparatorConfig Interface

```typescript
interface BreadcrumbSeparatorConfig {
  separator: string;          // Custom separator text or icon name
  isIcon?: boolean;           // Whether separator is an icon
  iconType?: 'solid' | 'regular';  // Icon type if separator is icon
}
```

### BreadcrumbSeparator Enum

```typescript
enum BreadcrumbSeparator {
  Slash = '/',
  Arrow = '>',
  Chevron = '›',
  Dash = '-',
  Dot = '•',
}
```

### Events

| Event | Description | Detail |
|-------|-------------|--------|
| `nr-breadcrumb-click` | Fired when a breadcrumb item is clicked | `{ item: BreadcrumbItem, event: MouseEvent }` |

### CSS Custom Properties

| Property | Description | Default |
|----------|-------------|---------|
| `--nuraly-breadcrumb-font-size` | Font size of breadcrumb items | `0.875rem` |
| `--nuraly-breadcrumb-line-height` | Line height of breadcrumb items | `1.5` |
| `--nuraly-breadcrumb-item-color` | Color of breadcrumb items | Theme-based |
| `--nuraly-breadcrumb-link-color` | Color of breadcrumb links | Theme-based |
| `--nuraly-breadcrumb-link-hover-color` | Color of breadcrumb links on hover | Theme-based |
| `--nuraly-breadcrumb-last-item-color` | Color of the last breadcrumb item | Theme-based |
| `--nuraly-breadcrumb-separator-color` | Color of separators | Theme-based |
| `--nuraly-breadcrumb-separator-margin` | Margin around separators | `8px` |
| `--nuraly-breadcrumb-icon-font-size` | Font size of icons | `14px` |

## Accessibility

- Uses semantic `<nav>` element with `aria-label="Breadcrumb"`
- Keyboard navigation support with Tab key
- Focus indicators for better accessibility
- Proper link structure for screen readers

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT © Nuraly, Laabidi Aymen
