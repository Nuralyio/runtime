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

## Inputs

### value
**Type:** `number`

Current slider value.

```typescript
input: {
  value: { type: "number", value: 50 }
}
```

### min / max
**Type:** `number`

Range boundaries.

```typescript
input: {
  min: { type: "number", value: 0 },
  max: { type: "number", value: 100 }
}
```

### step
**Type:** `number`

Step increment for value changes.

```typescript
input: {
  step: { type: "number", value: 5 }
}
```

### vertical
**Type:** `boolean`

Display slider vertically.

```typescript
input: {
  vertical: { type: "boolean", value: true }
}
```

### showTooltip
**Type:** `boolean`

Show tooltip with current value on hover/drag.

```typescript
input: {
  showTooltip: { type: "boolean", value: true }
}
```

### showMarks
**Type:** `boolean`

Show marks on the slider track.

```typescript
input: {
  showMarks: { type: "boolean", value: true }
}
```

### range
**Type:** `boolean`

Enable range selection with two handles.

```typescript
input: {
  range: { type: "boolean", value: true }
}
```

### marks
**Type:** `object`

Custom marks configuration.

```typescript
inputHandlers: {
  marks: `
    return {
      0: '0%',
      25: '25%',
      50: '50%',
      75: '75%',
      100: '100%'
    };
  `
}
```

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

**Example:**
```typescript
event: {
  onChange: `
    Vars.currentValue = EventData.value;

    // Update preview in real-time
    Vars.previewOpacity = EventData.value / 100;
  `
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

**Example:**
```typescript
event: {
  onAfterChange: `
    const finalValue = EventData.value;
    Vars.confirmedValue = finalValue;

    // Save setting
    await SaveUserSetting('volume', finalValue);
  `
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
      // Update audio in real-time
      AudioPlayer.setVolume(EventData.value / 100);
    `,
    onAfterChange: `
      // Save preference
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
    marks: `
      return {
        0: '$0',
        250: '$250',
        500: '$500',
        750: '$750',
        1000: '$1000'
      };
    `
  },
  event: {
    onAfterChange: `
      const [min, max] = EventData.value;
      Vars.minPrice = min;
      Vars.maxPrice = max;

      // Filter products
      Vars.filteredProducts = Vars.allProducts.filter(p =>
        p.price >= min && p.price <= max
      );
    `
  }
}
```

### Opacity Control
```typescript
{
  component_type: "slider",
  input: {
    min: { type: "number", value: 0 },
    max: { type: "number", value: 100 },
    step: { type: "number", value: 1 }
  },
  inputHandlers: {
    marks: `
      return {
        0: 'Transparent',
        50: '50%',
        100: 'Opaque'
      };
    `
  },
  event: {
    onChange: `
      Vars.elementOpacity = EventData.value / 100;
    `
  }
}
```

### Rating with Steps
```typescript
{
  component_type: "slider",
  input: {
    min: { type: "number", value: 1 },
    max: { type: "number", value: 5 },
    step: { type: "number", value: 1 },
    showMarks: { type: "boolean", value: true }
  },
  inputHandlers: {
    marks: `
      return {
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent'
      };
    `
  },
  event: {
    onAfterChange: `
      Vars.rating = EventData.value;
      await SubmitRating(EventData.value);
    `
  }
}
```

---

## See Also

- [NumberInput Component](./number-input.md) - Numeric input
- [Form Component](./form.md) - Form container
