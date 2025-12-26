# Studio Processors Module

Code generation system that transforms declarative YAML/JSON configurations into Nuraly Studio component hierarchies.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Configuration Format](#configuration-format)
- [Handler Library](#handler-library)
- [API Reference](#api-reference)
- [Contributing](#contributing)

## Overview

The Processors Module eliminates manual component definition by generating UI from declarative configuration files.

### Features

- **Declarative Configuration** - YAML/JSON instead of imperative code
- **Handler Library** - Reusable, parameterized functions
- **Type Safety** - Full TypeScript support
- **Performance** - Built-in caching and memoization
- **Flexible Inputs** - text, number, select, radio, color, icon, event

### Before/After

**Manual (500+ lines):**
```typescript
const sizeComponents = [
  { uuid: "size_container", component_type: ComponentType.Container, ... },
  { uuid: "size_collapse", ... },
  // ... 20+ more components
];
```

**Declarative (50 lines):**
```yaml
container:
  uuid: size_container
  name: Size Properties
collapse:
  title: Size
properties:
  - name: width
    type: number
    unit: px
    default: auto
```

## Quick Start

```typescript
import { generateFromConfig } from '@features/studio/processors/property-block';
import config from './size-config.yaml';

export const SizeBlock = generateFromConfig(config.sizeInputs, 'size');
```

## Core Concepts

### 1. **Property Blocks**

A Property Block is a collapsible section in the Studio editor containing related properties. Examples:
- Size Block: width, height, min-width, max-width, etc.
- Typography Block: font-size, font-weight, line-height, etc.
- Spacing Block: margin, padding, gap, etc.

Each block is defined by a `BlockConfig` containing:
- Container configuration (main wrapper)
- Collapse configuration (collapsible header)
- Properties array (individual inputs)
- Optional common properties to include

### 2. **Property Types**

The system supports multiple input types:

| Type | Component | Use Case | Example |
|------|-----------|----------|---------|
| `number` | TextInput | Numeric values with units | width: 100px |
| `text` | TextInput | Text strings | placeholder: "Enter name" |
| `select` | Select | Multiple choice | display: flex \| block \| grid |
| `radio` | RadioButton | Button group | align-items: center \| start \| end |
| `color` | ColorPicker | Color values | background: #3b82f6 |
| `boolean` | Checkbox | True/false toggle | enabled: true |
| `icon` | IconPicker | Icon selection | icon: fa-user |
| `event` | Event | Code editor | onClick: "handler code" |

### 3. **Handler System**

Handlers are JavaScript code snippets that execute in the runtime context. The Processors Module supports three types:

- **Value Handlers**: Determine what value to display in the input
- **State Handlers**: Control the disabled/enabled state of inputs
- **Event Handlers**: Execute when user interacts with the input

Handlers can be:
- **Inline Code**: Direct JavaScript strings
- **Library References**: References to reusable handler functions

```yaml
properties:
  - name: fontSize
    type: number
    # Inline handler
    valueHandler: "return Editor.getComponentStyle(Current, 'fontSize')"
    
    # Library reference with parameters
    valueHandler:
      ref: componentStyle
      params: [fontSize, "16px"]
```

### 4. **Handler Support (Code Icons)**

Properties can support dynamic handlers (the "code" icon in Studio):

```yaml
properties:
  - name: width
    type: number
    hasHandler: true              # Enables code icon
    handlerType: style            # 'style' or 'input'
    handlerProperty: width        # Property name in handlers object
```

This generates:
- The input component
- A handler button (code icon)
- Handler value getter/setter logic
- Automatic state management (disabled when handler is active)

### 5. **Component Loader**

The Component Loader orchestrates the entire generation process:

1. **Load Configuration Files** - Reads 4 JSON/YAML files per component
2. **Generate Components** - Creates all nested component structures
3. **Cache Results** - Prevents re-processing on hot reload
4. **Export Arrays** - Returns component arrays ready for Studio

### 6. **Common Properties Registry**

Shared property blocks that can be included in multiple components:

```typescript
COMMON_PROPERTIES_MAP = {
  "component_value_text_block": StudioComponentNameInput,
  "component_id_text_block": StudioComponentIdInput,
  "component_refs_block": []
}
```

Usage in config:
```yaml
includeCommonProperties:
  - component_value_text_block
  - component_id_text_block
```

## Handler Library

Reusable handler functions organized by category:

### ValueHandlers
- `componentStyle(prop, default)` - Get style property value
- `componentInput(prop)` - Get input property value
- `componentStyleSelect(prop, options, default)` - Setup select input

### StateHandlers
- `defaultStyle(prop)` - Disable if style handler active
- `inputHandler(prop)` - Disable if input handler active

### EventHandlers
- `updateStyle(prop)` - Update style property
- `updateStyleWithUnit(prop, unit)` - Update style with unit
- `updateInput(prop, type)` - Update input property

**Usage:**
```yaml
valueHandler:
  ref: componentStyle
  params: [fontSize, "16px"]
```

## API Reference

### Main Functions

```typescript
// Generate from configuration
import { generateFromConfig } from '@features/studio/processors/property-block';
const components = generateFromConfig(config.myBlock, 'myBlock');

// Load complete component
import { loadComponentProperties } from '@features/studio/processors/component-loader';
const StudioButton = loadComponentProperties(fields, handlers, theme, metadata);

// Common properties
import { getCommonPropertyBlock } from '@features/studio/processors/common-properties-registry';
const nameBlock = getCommonPropertyBlock("component_value_text_block");
```

See [API.md](./API.md) for complete reference.

**Categories**:
1. **ValueHandlers** - Get values to display
   - `componentName` - Get component name
   - `componentInput(prop)` - Get input property
   - `componentStyle(prop)` - Get style property
   - `componentStyleSelect(prop, options)` - Get style for select

2. **StateHandlers** - Control input state
   - `defaultStyle(prop)` - Disabled if has style handler
   - `inputHandler(prop)` - Disabled if has input handler
   - `valueHandler` - Disabled if value is handler

3. **EventHandlers** - Handle user interactions
   - `updateName` - Update component name
   - `updateInput(prop)` - Update input property
   - `updateStyle(prop)` - Update style property
   - `updateStyleWithUnit(prop, unit)` - Update style with unit

**Example References**:
```yaml
properties:
  - name: width
    valueHandler:
      ref: componentStyle
      params: [width, "auto"]
    stateHandler:
      ref: defaultStyle
      params: [width]
    eventHandlers:
      onChange:
        ref: updateStyleWithUnit
        params: [width, "px"]
```

### Common Properties Registry (`common-properties-registry.ts`)

**Purpose**: Central registry for shared property blocks.

**Functions**:
- `getCommonPropertyBlock(uuid)` - Retrieve block by UUID
- `isCommonPropertyBlock(uuid)` - Check if UUID is registered
- `getAvailableCommonBlocks()` - List all registered blocks

## Usage Examples

### Basic Property Block

```typescript
import { generateFromConfig } from '@features/studio/processors/property-block';
import config from './size-config.yaml';

export const SizeBlock = generateFromConfig(config.sizeInputs, 'size');
```

### Example 2: Complete Component with Loader

```typescript
// 1. Create 4 config files
// _text-input-config.json
{
  "textInputFields": {
    "container": { "uuid": "text_input_container", ... },
    "collapse": { "uuid": "text_input_collapse", ... },
    "properties": [...]
  }
}

// _text-input-handlers.json
{
  "handlerPrefix": "textInput",
  "events": [
    { "name": "onChange", "label": "On Change" },
    { "name": "onFocus", "label": "On Focus" }
  ]
}

// _text-input-theme.json
{
  "theme": {
    "modes": [
      {
        "name": "Colors",
        "sections": [
          {
            "name": "Background",
            "variables": [
              { "label": "Background Color", "cssVar": "--bg-color" }
            ]
          }
        ]
      }
    ]
  }
}

// _text-input-meta.json
{
  "uuid": "text_input_properties",
  "name": "Text Input Properties",
  "themeContainerId": "text_input_theme_container",
  "configKey": "textInputFields",
  "childrenIds": []
}

// 2. Load in component file
import { loadComponentProperties } from '../processors/component-loader';
import fieldsConfig from "./_text-input-config.json";
import handlersConfig from "./_text-input-handlers.json";
import themeConfig from "./_text-input-theme.json";
import metadata from "./_text-input-meta.json";

export const StudioTextInput = loadComponentProperties(
  fieldsConfig,
  handlersConfig,
  themeConfig,
  metadata
);

// Result: Complete component hierarchy with fields, handlers, and theme
```

### Example 3: Using Handler Library

```yaml
properties:
  - name: backgroundColor
    label: Background Color
    type: color
    default: "transparent"
    # Use library reference instead of inline code
    valueHandler:
      ref: componentStyle
      params: [backgroundColor, "transparent"]
    stateHandler:
      ref: defaultStyle
      params: [backgroundColor]
    eventHandlers:
      changed:
        ref: updateStyle
        params: [backgroundColor]
```

### Example 4: Handler Support (Code Icon)

```yaml
properties:
  - name: width
    label: Width
    type: number
    unit: px
    default: "auto"
    autoCheckbox: true
    # Enable code icon for dynamic values
    hasHandler: true
    handlerType: style
    handlerProperty: width
    # Custom handler getter/setter (optional)
    handlerValueGetter:
      ref: styleHandler
      params: [width, "auto"]
    handlerEventUpdate: |
      const selectedComponent = Utils.first($selectedComponents);
      if (selectedComponent) {
        updateStyleHandlers(selectedComponent, 'width', EventData.value);
      }
```

### Example 5: Including Common Properties

```yaml
# In your block config
includeCommonProperties:
  - component_value_text_block  # Includes component name input
  - component_id_text_block     # Includes component ID display

# Result: Generated components will include these shared blocks
# automatically appended to your property list
```

## Handler Library System

### Value Handlers

Retrieve values to display in inputs:

| Handler | Parameters | Returns | Use Case |
|---------|------------|---------|----------|
| `componentName` | None | Component name string | Display component name |
| `componentInput` | `propertyName` | Input property value | Display input value |
| `componentInputHandler` | `propertyName, defaultValue` | InputHandler value | Display input handler |
| `componentInputRadio` | `propertyName, options, defaultValue` | `[options, value, type]` | Radio button setup |
| `componentStyle` | `propertyName, defaultValue` | Style property value | Display style value |
| `componentStyleSelect` | `propertyName, options, defaultValue` | `[options, [value]]` | Select setup |
### Complete Component

```typescript
import { loadComponentProperties } from '@features/studio/processors/component-loader';
import fieldsConfig from "./_button-config.json";
import handlersConfig from "./_button-handlers.json";
import themeConfig from "./_button-theme.json";
import metadata from "./_button-meta.json";

export const StudioButton = loadComponentProperties(
  fieldsConfig,
  handlersConfig,
  themeConfig,
  metadata
);
```

## Performance

- **Memoization** - Components cached to prevent re-processing
- **Hot Reload** - Cache automatically cleared on HMR
- **Lazy Evaluation** - Handlers compiled only when executed

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](../../LICENSE) for details.
