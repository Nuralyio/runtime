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

## Inputs

### value
**Type:** `string`

Current color value in the specified format.

```typescript
inputHandlers: {
  value: `return Vars.selectedColor || '#ffffff';`
}
```

### format
**Type:** `string`

Color format: `hex`, `rgb`, `hsl`.

```typescript
input: {
  format: { type: "string", value: "rgb" }
}
```

### showInput
**Type:** `boolean`

Show color input field for manual entry.

```typescript
input: {
  showInput: { type: "boolean", value: true }
}
```

### showCopyButton
**Type:** `boolean`

Show button to copy color value to clipboard.

```typescript
input: {
  showCopyButton: { type: "boolean", value: true }
}
```

### defaultColorSets
**Type:** `array`

Preset color options for quick selection.

```typescript
inputHandlers: {
  defaultColorSets: `
    return [
      '#ef4444', '#f97316', '#f59e0b', '#eab308',
      '#84cc16', '#22c55e', '#10b981', '#14b8a6',
      '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
      '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
    ];
  `
}
```

### closeOnSelect
**Type:** `boolean`

Close picker automatically after selecting a color.

```typescript
input: {
  closeOnSelect: { type: "boolean", value: true }
}
```

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

**Example:**
```typescript
event: {
  onChange: `
    Vars.themeColor = EventData.value;

    // Update CSS custom property
    document.documentElement.style.setProperty('--primary-color', EventData.value);
  `
}
```

### onOpen
**Triggered:** When picker opens

```typescript
event: {
  onOpen: `
    Vars.pickerOpen = true;
  `
}
```

### onClose
**Triggered:** When picker closes

```typescript
event: {
  onClose: `
    Vars.pickerOpen = false;
  `
}
```

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

      // Apply theme
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

      // Add to palette if not exists
      if (!Vars.colorPalette.includes(color)) {
        Vars.colorPalette = [...Vars.colorPalette, color];
      }
    `
  }
}
```

### Brand Color Configuration
```typescript
{
  component_type: "color-picker",
  input: {
    label: { type: "string", value: "Brand Color" },
    helperText: { type: "string", value: "Used for buttons and links" }
  },
  inputHandlers: {
    value: `return Vars.brandSettings?.color || '#000000';`,
    defaultColorSets: `
      // Company brand colors
      return Vars.companyColors || [];
    `
  },
  event: {
    onChange: `
      Vars.brandSettings = {
        ...Vars.brandSettings,
        color: EventData.value
      };

      // Generate color variations
      Vars.brandSettings.colorLight = lighten(EventData.value, 0.2);
      Vars.brandSettings.colorDark = darken(EventData.value, 0.2);
    `
  }
}
```

### Chart Color Assignment
```typescript
{
  component_type: "color-picker",
  input: {
    format: { type: "string", value: "rgb" }
  },
  inputHandlers: {
    value: `
      const series = Vars.selectedSeries;
      return series?.color || 'rgb(59, 130, 246)';
    `,
    defaultColorSets: `
      return [
        'rgb(239, 68, 68)',
        'rgb(59, 130, 246)',
        'rgb(34, 197, 94)',
        'rgb(234, 179, 8)',
        'rgb(168, 85, 247)',
        'rgb(236, 72, 153)'
      ];
    `
  },
  event: {
    onChange: `
      const seriesIndex = Vars.selectedSeriesIndex;
      Vars.chartConfig.series[seriesIndex].color = EventData.value;

      // Refresh chart
      Vars.chartKey = Date.now();
    `
  }
}
```

---

## See Also

- [TextInput Component](./text-input.md) - Text input
- [Select Component](./select.md) - Dropdown selection
- [IconPicker Component](./icon-picker.md) - Icon selection
