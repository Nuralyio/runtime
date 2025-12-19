---
sidebar_position: 28
title: Slider
description: A slider component for selecting numeric values within a range
---

# Slider

The **Slider** component provides an interactive slider for selecting numeric values within a defined range. It supports single values and ranges, with optional marks and tooltips.

## Overview

Slider provides a complete range selection solution with:
- Single value and range selection
- Customizable min/max/step
- Optional marks
- Tooltip display
- Vertical orientation support
- Disabled state

## Basic Usage

```typescript
{
  uuid: "my-slider",
  name: "volume_slider",
  component_type: "slider",
  input: {
    value: { type: "number", value: 50 },
    min: { type: "number", value: 0 },
    max: { type: "number", value: 100 }
  },
  event: {
    onChange: `
      Vars.volume = EventData.value;
    `
  }
}
```

## Component Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | number | `0` | Current slider value |
| `min` | number | `0` | Minimum value |
| `max` | number | `100` | Maximum value |
| `step` | number | `1` | Step increment |
| `disabled` | boolean | `false` | Disable slider |
| `vertical` | boolean | `false` | Vertical orientation |
| `showTooltip` | boolean | `true` | Show value tooltip |
| `showMarks` | boolean | `false` | Show marks on track |
| `range` | boolean | `false` | Enable range selection |
| `marks` | object | - | Custom marks configuration |

---

## Events

### onChange
**Triggered:** While slider value is changing (during drag)

**EventData:**
```typescript
{
  value: number | [number, number]  // Current value(s)
}
```

### onAfterChange
**Triggered:** When slider value change is complete (after drag ends)

**EventData:**
```typescript
{
  value: number | [number, number]  // Final value(s)
}
```

---

## Common Patterns

### Volume Control
```typescript
{
  component_type: "slider",
  input: {
    min: { type: "number", value: 0 },
    max: { type: "number", value: 100 },
    showTooltip: { type: "boolean", value: true }
  },
  inputHandlers: {
    value: `return Vars.volume || 50;`
  },
  event: {
    onChange: `
      Vars.volume = EventData.value;
      AudioPlayer.setVolume(EventData.value / 100);
    `,
    onAfterChange: `
      await SavePreference('volume', EventData.value);
    `
  }
}
```

### Price Range Filter
```typescript
{
  component_type: "slider",
  input: {
    range: { type: "boolean", value: true },
    min: { type: "number", value: 0 },
    max: { type: "number", value: 1000 },
    step: { type: "number", value: 10 }
  },
  inputHandlers: {
    value: `return [Vars.minPrice || 0, Vars.maxPrice || 1000];`,
    marks: `return { 0: '$0', 500: '$500', 1000: '$1000' };`
  },
  event: {
    onAfterChange: `
      const [min, max] = EventData.value;
      Vars.minPrice = min;
      Vars.maxPrice = max;

      Vars.filteredProducts = Vars.allProducts.filter(p =>
        p.price >= min && p.price <= max
      );
    `
  }
}
```

---

## See Also

- [NumberInput Component](./number-input.md) - Numeric input
- [Form Component](./form.md) - Form container
