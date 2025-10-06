# Skeleton Component

Provide a placeholder while content is loading, or to visualize content that doesn't exist yet. Improves perceived performance and user experience during data fetching.

## Installation

```bash
npm install @nuralyui/skeleton
```

## Usage

### Basic Skeleton

```html
<nr-skeleton></nr-skeleton>
```

### Active Animation

```html
<nr-skeleton active></nr-skeleton>
```

### Complex Skeleton with Avatar

```html
<nr-skeleton avatar active></nr-skeleton>
```

### Custom Paragraph Rows

```html
<nr-skeleton paragraph-config='{"rows": 5}'></nr-skeleton>

<script>
  const skeleton = document.querySelector('nr-skeleton');
  skeleton.paragraphConfig = {
    rows: 5,
    width: ['100%', '100%', '100%', '80%', '60%']
  };
</script>
```

### Custom Title Width

```html
<nr-skeleton title-config='{"width": "50%"}'></nr-skeleton>
```

### Without Title

```html
<nr-skeleton show-title="false"></nr-skeleton>
```

### Without Paragraph

```html
<nr-skeleton paragraph="false"></nr-skeleton>
```

### Round Corners

```html
<nr-skeleton round avatar active></nr-skeleton>
```

### Loading State with Content

```html
<nr-skeleton id="content-skeleton" loading>
  <div slot="content">
    <h3>Article Title</h3>
    <p>This is the actual content that will be shown when loading is false.</p>
  </div>
</nr-skeleton>

<button onclick="document.getElementById('content-skeleton').loading = false">
  Show Content
</button>
```

### Skeleton Button

```html
<!-- Default button -->
<nr-skeleton element="button" active></nr-skeleton>

<!-- Large button -->
<nr-skeleton element="button" size="large" active></nr-skeleton>

<!-- Small button -->
<nr-skeleton element="button" size="small"></nr-skeleton>

<!-- Round button -->
<nr-skeleton element="button" shape="round" active></nr-skeleton>

<!-- Circle button -->
<nr-skeleton element="button" shape="circle" size="large"></nr-skeleton>

<!-- Block button -->
<nr-skeleton element="button" block active></nr-skeleton>
```

### Skeleton Input

```html
<!-- Default input -->
<nr-skeleton element="input" active></nr-skeleton>

<!-- Large input -->
<nr-skeleton element="input" size="large" active></nr-skeleton>

<!-- Small input -->
<nr-skeleton element="input" size="small"></nr-skeleton>

<!-- Block input -->
<nr-skeleton element="input" block active></nr-skeleton>
```

### Skeleton Image

```html
<nr-skeleton element="image" active></nr-skeleton>
```

### Skeleton Avatar

```html
<!-- Circle avatar (default) -->
<nr-skeleton element="avatar" active></nr-skeleton>

<!-- Square avatar -->
<nr-skeleton element="avatar" shape="square" active></nr-skeleton>

<!-- Large avatar -->
<nr-skeleton element="avatar" size="large" active></nr-skeleton>

<!-- Custom size avatar -->
<nr-skeleton element="avatar" avatar-config='{"size": 80}' active></nr-skeleton>
```

### List Skeleton

```html
<div style="display: flex; flex-direction: column; gap: 24px;">
  <nr-skeleton avatar active></nr-skeleton>
  <nr-skeleton avatar active></nr-skeleton>
  <nr-skeleton avatar active></nr-skeleton>
</div>
```

## React Usage

```jsx
import { NrSkeleton } from '@nuralyui/skeleton/react';
import { useState } from 'react';
function App() {
  const [loading, setLoading] = useState(true);
  return (
    <>
      {/* Basic skeleton */}
      <NrSkeleton active />
      {/* With avatar */}
      <NrSkeleton avatar active />
      {/* Custom configuration */}
      <NrSkeleton
        avatar
        active
        paragraphConfig={{
          rows: 4,
          width: ['100%', '100%', '80%', '60%']
        }}
      />
      {/* Loading state */}
      <NrSkeleton loading={loading}>
        <div slot="content">
          <h3>Article Title</h3>
          <p>Article content here...</p>
        </div>
      </NrSkeleton>
      <button onClick={() => setLoading(false)}>Show Content</button>
      {/* Skeleton elements */}
      <NrSkeleton element="button" active shape="round" />
      <NrSkeleton element="input" active block />
      <NrSkeleton element="image" active />
      <NrSkeleton element="avatar" active size="large" />
    </>
  );
}
```

## API

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `active` | `boolean` | `false` | Show animation effect |
| `avatar` | `boolean` | `false` | Show avatar placeholder |
| `avatarConfig` | `SkeletonAvatarConfig` | `{}` | Avatar configuration |
| `loading` | `boolean` | `true` | Display the skeleton when true |
| `paragraph` | `boolean` | `true` | Show paragraph placeholder |
| `paragraphConfig` | `SkeletonParagraphConfig` | `{}` | Paragraph configuration |
| `round` | `boolean` | `false` | Show paragraph and title radius when true |
| `showTitle` | `boolean` | `true` | Show title placeholder |
| `titleConfig` | `SkeletonTitleConfig` | `{}` | Title configuration |
| `element` | `SkeletonElementType` | `undefined` | Element type for standalone skeleton (avatar, button, input, image) |
| `buttonConfig` | `SkeletonButtonConfig` | `{}` | Button configuration |
| `inputConfig` | `SkeletonInputConfig` | `{}` | Input configuration |
| `imageConfig` | `SkeletonImageConfig` | `{}` | Image configuration |
| `block` | `boolean` | `false` | Block style for button/input |
| `shape` | `SkeletonShape` | `'default'` | Shape for standalone elements |
| `size` | `SkeletonSize` | `'default'` | Size for standalone elements |

### SkeletonAvatarConfig Interface

```typescript
interface SkeletonAvatarConfig {
  active?: boolean;
  shape?: SkeletonShape; // 'circle' | 'square'
  size?: SkeletonSize | number; // 'small' | 'default' | 'large' | number
}
```

### SkeletonTitleConfig Interface

```typescript
interface SkeletonTitleConfig {
  width?: number | string;
}
```

### SkeletonParagraphConfig Interface

```typescript
interface SkeletonParagraphConfig {
  rows?: number;
  width?: number | string | Array<number | string>;
}
```

### SkeletonButtonConfig Interface

```typescript
interface SkeletonButtonConfig {
  active?: boolean;
  block?: boolean;
  shape?: SkeletonShape; // 'default' | 'square' | 'round' | 'circle'
  size?: SkeletonSize; // 'small' | 'default' | 'large'
}
```

### SkeletonInputConfig Interface

```typescript
interface SkeletonInputConfig {
  active?: boolean;
  size?: SkeletonSize; // 'small' | 'default' | 'large'
  block?: boolean;
}
```

### SkeletonShape Enum

```typescript
enum SkeletonShape {
  Circle = 'circle',
  Square = 'square',
  Round = 'round',
  Default = 'default',
}
```

### SkeletonSize Enum

```typescript
enum SkeletonSize {
  Small = 'small',
  Default = 'default',
  Large = 'large',
}
```

### SkeletonElementType Enum

```typescript
enum SkeletonElementType {
  Avatar = 'avatar',
  Button = 'button',
  Input = 'input',
  Image = 'image',
}
```

### CSS Custom Properties

| Property | Description | Default |
|----------|-------------|---------|
| `--nuraly-skeleton-background` | Background color of skeleton elements | `rgba(0, 0, 0, 0.06)` |
| `--nuraly-skeleton-gradient-from` | Start color of active animation gradient | `rgba(0, 0, 0, 0.06)` |
| `--nuraly-skeleton-gradient-to` | End color of active animation gradient | `rgba(0, 0, 0, 0.15)` |
| `--nuraly-skeleton-icon-color` | Color of image placeholder icon | `rgba(0, 0, 0, 0.15)` |

### Slots

| Slot | Description |
|------|-------------|
| `content` | Content to show when loading is false |
| (default) | Alternative slot for content |

## Examples

### Article List

```html
<div style="display: flex; flex-direction: column; gap: 24px;">
  <nr-skeleton avatar active paragraph-config='{"rows": 2}'></nr-skeleton>
  <nr-skeleton avatar active paragraph-config='{"rows": 2}'></nr-skeleton>
  <nr-skeleton avatar active paragraph-config='{"rows": 2}'></nr-skeleton>
</div>
```

### User Profile

```html
<nr-skeleton 
  avatar 
  active 
  round
  avatar-config='{"size": 80}'
  paragraph-config='{"rows": 4}'></nr-skeleton>
```

### Form Loading

```html
<div style="display: flex; flex-direction: column; gap: 16px;">
  <nr-skeleton element="input" block active></nr-skeleton>
  <nr-skeleton element="input" block active></nr-skeleton>
  <nr-skeleton element="input" block active></nr-skeleton>
  <nr-skeleton element="button" active></nr-skeleton>
</div>
```

### Card Skeleton

```html
<div style="border: 1px solid #d9d9d9; padding: 24px; border-radius: 8px;">
  <nr-skeleton element="image" active></nr-skeleton>
  <div style="margin-top: 16px;">
    <nr-skeleton active paragraph-config='{"rows": 3}'></nr-skeleton>
  </div>
</div>
```

## Accessibility

- Uses semantic HTML structure
- Proper ARIA attributes for loading states
- Screen reader compatible

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT © Nuraly, Laabidi Aymen
