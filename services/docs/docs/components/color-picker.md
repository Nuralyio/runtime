---
sidebar_position: 33
title: ColorPicker
description: A color picker component for selecting colors with various formats
---

# ColorPicker

The **ColorPicker** component provides an intuitive interface for selecting colors with support for multiple color formats and preset color sets.

## Overview

ColorPicker provides a complete color selection solution with:
- Multiple color formats (hex, rgb, hsl)
- Color input field
- Copy to clipboard
- Preset color sets
- Configurable placement and triggers
- Animation options

## Basic Usage

```typescript
{
  uuid: "my-color-picker",
  name: "theme_color",
  component_type: "color-picker",
  input: {
    label: { type: "string", value: "Primary Color" }
  },
  inputHandlers: {
    value: `return Vars.primaryColor || '#3b82f6';`
  },
  event: {
    onChange: `
      Vars.primaryColor = EventData.value;
    `
  }
}
```

## Component Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | string | `''` | Current color value |
| `label` | string | `''` | Label text |
| `helperText` | string | `''` | Helper text |
| `size` | string | `'default'` | Size: 'small', 'default', 'large' |
| `trigger` | string | `'click'` | Trigger mode: 'click', 'hover' |
| `placement` | string | `'auto'` | Picker placement |
| `animation` | string | `'fade'` | Animation: 'none', 'fade', 'slide', 'scale' |
| `format` | string | `'hex'` | Color format: 'hex', 'rgb', 'hsl' |
| `closeOnSelect` | boolean | `false` | Close picker on selection |
| `closeOnOutsideClick` | boolean | `true` | Close on outside click |
| `closeOnEscape` | boolean | `true` | Close on Escape key |
| `showInput` | boolean | `true` | Show color input field |
| `showCopyButton` | boolean | `true` | Show copy button |
| `inputPlaceholder` | string | `'Enter color'` | Input placeholder |
| `defaultColorSets` | array | `[]` | Preset color options |
| `state` | string | `'default'` | State: 'default', 'disabled' |

---

## Events

### onChange
**Triggered:** When color value changes

**EventData:**
```typescript
{
  value: string  // Selected color value
}
```

### onOpen / onClose
**Triggered:** When picker opens/closes

---

## Common Patterns

### Theme Color Customization
```typescript
{
  component_type: "color-picker",
  input: {
    label: { type: "string", value: "Primary Color" },
    format: { type: "string", value: "hex" }
  },
  inputHandlers: {
    value: `return Vars.theme?.primaryColor || '#3b82f6';`,
    defaultColorSets: `
      return [
        '#ef4444', '#f97316', '#eab308', '#22c55e',
        '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
      ];
    `
  },
  event: {
    onChange: `
      Vars.theme = {
        ...Vars.theme,
        primaryColor: EventData.value
      };
      await ApplyTheme(Vars.theme);
    `
  }
}
```

### Background Color Selector
```typescript
{
  component_type: "color-picker",
  input: {
    label: { type: "string", value: "Background" },
    closeOnSelect: { type: "boolean", value: true }
  },
  inputHandlers: {
    value: `return Vars.elementStyle?.backgroundColor || '#ffffff';`
  },
  event: {
    onChange: `
      Vars.elementStyle = {
        ...Vars.elementStyle,
        backgroundColor: EventData.value
      };
    `
  }
}
```

### Color Palette Builder
```typescript
{
  component_type: "color-picker",
  input: {
    showCopyButton: { type: "boolean", value: true }
  },
  inputHandlers: {
    value: `return Vars.currentPaletteColor || '';`
  },
  event: {
    onChange: `
      const color = EventData.value;
      Vars.currentPaletteColor = color;

      if (!Vars.colorPalette.includes(color)) {
        Vars.colorPalette = [...Vars.colorPalette, color];
      }
    `
  }
}
```

---

## See Also

- [TextInput Component](./text-input.md) - Text input
- [Select Component](./select.md) - Dropdown selection
- [IconPicker Component](./icon-picker.md) - Icon selection
