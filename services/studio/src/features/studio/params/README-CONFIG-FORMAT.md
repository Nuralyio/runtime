# Configuration File Format Guide

The Studio params processor now supports both **JSON** and **YAML** configuration formats for defining component property panels.

## Why YAML?

YAML offers several advantages over JSON:
- ✅ **More readable** - No curly braces and quotes everywhere
- ✅ **Cleaner** - Less syntax noise
- ✅ **Comments** - Native support for documentation
- ✅ **Multi-line strings** - Better for long text values
- ✅ **Compact** - 20-30% shorter than equivalent JSON

## Format Comparison

### JSON Format (traditional)
```json
{
  "sizeInputs": {
    "container": {
      "uuid": "size_collapse_container",
      "name": "Size Properties",
      "style": {
        "marginTop": "13px"
      }
    },
    "properties": [
      {
        "name": "width",
        "label": "Width",
        "type": "number",
        "default": "auto",
        "unit": "px",
        "min": 0,
        "max": 2000,
        "step": 1
      }
    ]
  }
}
```

### YAML Format (recommended)
```yaml
sizeInputs:
  container:
    uuid: size_collapse_container
    name: Size Properties
    style:
      marginTop: 13px

  properties:
    # Width property with number input
    - name: width
      label: Width
      type: number
      default: auto
      unit: px
      min: 0
      max: 2000
      step: 1
```

## Usage in Code

### Import YAML Config
```typescript
import myConfig from './my-config.yaml';
import { GenericJsonProcessor } from '../processors/json-processor';

const components = GenericJsonProcessor.generateFromConfig(
  myConfig.myInputs,
  'myblock'
);
```

### Import JSON Config (still supported)
```typescript
import myConfig from './my-config.json';
import { GenericJsonProcessor } from '../processors/json-processor';

const components = GenericJsonProcessor.generateFromConfig(
  myConfig.myInputs,
  'myblock'
);
```

### Parse YAML String Dynamically
```typescript
import { GenericJsonProcessor } from '../processors/json-processor';

const yamlString = `
sizeInputs:
  container:
    uuid: size_container
    name: Size Properties
`;

const config = GenericJsonProcessor.parseYaml(yamlString);
const components = GenericJsonProcessor.generateFromConfig(
  config.sizeInputs,
  'size'
);
```

### Convert JSON to YAML
```typescript
import { GenericJsonProcessor } from '../processors/json-processor';
import jsonConfig from './old-config.json';

// Convert existing JSON config to YAML string
const yamlString = GenericJsonProcessor.convertToYaml(jsonConfig);
console.log(yamlString);

// Save to file or use programmatically
```

## Configuration Structure

Both formats support the same configuration structure:

```yaml
# Root key naming: {blockName}Inputs
sizeInputs:
  # Container configuration
  container:
    uuid: unique_container_id       # Unique identifier
    name: Display Name              # Human-readable name
    style:                          # CSS styles
      marginTop: 13px
      padding: 10px

  # Collapse panel configuration
  collapse:
    uuid: unique_collapse_id
    title: Panel Title
    style:
      --hy-collapse-width: 292px
      --hy-collapse-border: none

  # Property definitions
  properties:
    # Number input
    - name: width
      label: Width
      type: number
      default: auto
      unit: px                      # Optional unit suffix
      min: 0
      max: 2000
      step: 1
      autoCheckbox: false           # Show auto checkbox

    # Select dropdown
    - name: position
      label: Position
      type: select
      default: static
      options:
        - value: static
          label: Static
        - value: relative
          label: Relative

    # Text input
    - name: customClass
      label: CSS Class
      type: text
      default: ''
      placeholder: Enter class name

    # Color picker
    - name: backgroundColor
      label: Background Color
      type: color
      default: '#ffffff'

    # Boolean checkbox
    - name: visible
      label: Visible
      type: boolean
      default: true

    # With handlers support
    - name: content
      label: Content
      type: text
      hasHandler: true              # Enable handler support
      handlerType: input            # 'input' or 'style'
      handlerProperty: content      # Property name in handlers

  # Include common property blocks (optional)
  includeCommonProperties:
    - common_spacing_block
    - common_typography_block
```

## Property Types

| Type | Description | Example Config |
|------|-------------|----------------|
| `number` | Numeric input with optional unit | `type: number, unit: px, min: 0, max: 100` |
| `select` | Dropdown select | `type: select, options: [{value: a, label: A}]` |
| `text` | Text input | `type: text, placeholder: Enter text` |
| `color` | Color picker | `type: color, default: '#ff0000'` |
| `boolean` | Checkbox | `type: boolean, default: true` |
| `radio` | Radio buttons | `type: radio, options: [...]` |
| `icon` | Icon picker | `type: icon` |
| `event` | Event handler | `type: event` |

## Migration Guide

To convert existing JSON configs to YAML:

1. **Run the converter:**
```typescript
import { GenericJsonProcessor } from '@studio/processors/json-processor';
import oldConfig from './old-config.json';

const yaml = GenericJsonProcessor.convertToYaml(oldConfig);
```

2. **Save to `.yaml` file** with the same name (e.g., `size.config.yaml`)

3. **Update imports** in your code:
```typescript
// Before
import config from './size.config.json';

// After
import config from './size.config.yaml';
```

4. **Test** - Both formats work identically

## Best Practices

### ✅ DO:
- Use YAML for new configs (cleaner, more readable)
- Add comments to document complex properties
- Use consistent indentation (2 spaces)
- Keep JSON configs for compatibility if needed

### ❌ DON'T:
- Mix tabs and spaces in YAML
- Use quotes unless necessary
- Forget to validate YAML syntax
- Remove JSON configs if other code depends on them

## Example: Complete YAML Config

See `size.config.yaml` for a complete working example.

## Error Handling

The processor will automatically:
- Parse YAML and convert to configuration object
- Validate structure and report errors
- Fall back to JSON if YAML parsing fails
- Provide helpful error messages

```typescript
try {
  const config = GenericJsonProcessor.parseYaml(yamlString);
} catch (error) {
  console.error('YAML parsing failed:', error.message);
  // Handle error or fall back to JSON
}
```
