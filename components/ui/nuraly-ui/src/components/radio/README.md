# Radio Button Component

A simple, standalone radio button component for single selections within a group.

## Usage

```html
<!-- Basic usage -->
<nr-radio name="option" value="1">Option 1</nr-radio>
<nr-radio name="option" value="2" checked>Option 2</nr-radio>
<nr-radio name="option" value="3">Option 3</nr-radio>

<!-- Different sizes -->
<nr-radio size="small" name="size" value="s">Small</nr-radio>
<nr-radio size="medium" name="size" value="m">Medium</nr-radio>
<nr-radio size="large" name="size" value="l">Large</nr-radio>

<!-- Disabled state -->
<nr-radio disabled name="disabled" value="1">Disabled</nr-radio>
<nr-radio disabled checked name="disabled" value="2">Disabled Checked</nr-radio>
```

## Properties

| Property   | Type      | Default    | Description                                    |
|-----------|-----------|------------|------------------------------------------------|
| `checked` | `boolean` | `false`    | Whether the radio button is checked            |
| `disabled`| `boolean` | `false`    | Whether the radio button is disabled           |
| `size`    | `string`  | `'medium'` | Size variant: 'small', 'medium', or 'large'    |
| `name`    | `string`  | `''`       | Form name (groups radio buttons together)      |
| `value`   | `string`  | `''`       | Value submitted with forms                     |
| `required`| `boolean` | `false`    | Whether the radio button is required           |

## Events

| Event    | Description                                      |
|----------|--------------------------------------------------|
| `change` | Fired when the radio button selection changes    |
| `focus`  | Fired when the radio button receives focus       |
| `blur`   | Fired when the radio button loses focus          |

## Styling

The component exposes CSS custom properties for theming:

```css
nr-radio {
  --nuraly-radio-border-color: #d9d9d9;
  --nuraly-radio-background: #ffffff;
  --nuraly-radio-dot-color: #1677ff;
  --nuraly-radio-checked-border-color: #1677ff;
  --nuraly-radio-hover-border-color: #1677ff;
  --nuraly-radio-focus-color: #1677ff;
  --nuraly-radio-label-color: #262626;
  --nuraly-radio-label-font-size: 14px;
  --nuraly-radio-gap: 8px;
}
```

## React Usage

```tsx
import { NrRadio } from '@nuralyui/radio/react';

function MyComponent() {
  const [value, setValue] = useState('option1');

  return (
    <>
      <NrRadio 
        name="options" 
        value="option1" 
        checked={value === 'option1'}
        onChange={(e) => setValue(e.detail.value)}
      >
        Option 1
      </NrRadio>
      <NrRadio 
        name="options" 
        value="option2" 
        checked={value === 'option2'}
        onChange={(e) => setValue(e.detail.value)}
      >
        Option 2
      </NrRadio>
    </>
  );
}
```

## Notes

- For more advanced radio group functionality with better state management, consider using `nr-radio-group` component
- Radio buttons with the same `name` attribute will automatically form a group
- Only one radio button in a group can be selected at a time
