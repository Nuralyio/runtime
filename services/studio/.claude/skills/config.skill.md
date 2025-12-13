# Config Skill

Help users work with studio component configurations and params.

## What this skill does

This skill helps you:
- View the current editor file in the studio
- Navigate and explore component params configurations
- Display component config, handlers, theme, and meta files
- Understand component structure and properties

## Component Configuration Structure

Components in the studio are located at `services/studio/src/features/studio/params/` and organized by category:

- **inputs/** - Input components (TextInput, Textarea, Slider, Select, Checkbox, Datepicker)
- **layout/** - Layout components (Container, Card)
- **data/** - Data components (Table, Collection, Menu)
- **media/** - Media components (Image, Video, Icon, FileUpload)
- **display/** - Display components (Badge, Tag)
- **content/** - Content components (Code, Document, RichText, RichTextEditor)
- **navigation/** - Navigation components (Button, Link, Dropdown)
- **advanced/** - Advanced components (Embed, RefComponent)

## Each Component Has Four Configuration Files

1. **config** (YAML/JSON) - Component properties and structure
2. **handlers** (YAML/JSON) - Event handlers and callbacks
3. **theme** (YAML/JSON) - Styling and theming options
4. **meta** (YAML/JSON) - Metadata and component info

## When to invoke this skill

Invoke this skill when the user asks about:
- "Show me the config for [component]"
- "What are the params for [component]"
- "View the current editor file"
- "Show me component properties"
- "What handlers does [component] have"
- "Display [component] theme settings"

## Example Usage

**User:** Show me the config for the button component

**Skill:** I'll display the button component configuration files:
- services/studio/src/features/studio/params/navigation/button/config.json
- services/studio/src/features/studio/params/navigation/button/handlers.json
- services/studio/src/features/studio/params/navigation/button/theme.json
- services/studio/src/features/studio/params/navigation/button/meta.json

## Instructions for AI

When this skill is invoked:

1. **Understand the request**: Identify which component or configuration the user wants to see
2. **Locate the files**: Find the component in the appropriate category directory
3. **Find the Nuraly UI component**: Look for the corresponding component in `src/features/runtime/components/ui/nuraly-ui/src/components/` to understand available properties
4. **Read and display**: Show the relevant configuration files (config, handlers, theme, meta)
5. **Explain**: Provide context about what each configuration does
6. **Be helpful**: Suggest related configurations or components if relevant

### Extracting Properties from Nuraly UI Components

When creating or updating configurations, always check the Nuraly UI component implementation to identify available properties:

1. **Locate the component**: `src/features/runtime/components/ui/nuraly-ui/src/components/{component-name}/`
2. **Read the component file**: Look for `@property` decorators in the `.component.ts` file
3. **Check the wrapper**: Read the wrapper at `src/features/runtime/components/ui/components/{category}/{ComponentName}/`
4. **Map properties**: Create config properties that match the component's actual properties

**Example**: For checkbox component
- Nuraly UI: `src/features/runtime/components/ui/nuraly-ui/src/components/checkbox/checkbox.component.ts`
- Wrapper: `src/features/runtime/components/ui/components/inputs/Checkbox/Checkbox.ts`
- Config: `src/features/studio/params/inputs/checkbox/config.json`

The wrapper shows how properties are passed to the Nuraly UI component (e.g., `.checked`, `.size`, `.disabled`), which should match the config properties.

### Finding Components

Components follow this path pattern:
```
services/studio/src/features/studio/params/{category}/{component-name}/{file-type}.{yaml|json}
```

### Common Component Categories

- Input components → `params/inputs/`
- Layout components → `params/layout/`
- Data components → `params/data/`
- Media components → `params/media/`
- Display components → `params/display/`
- Content components → `params/content/`
- Navigation components → `params/navigation/`
- Advanced components → `params/advanced/`

### Tips

- Always check both YAML and JSON extensions
- If a component isn't found, search across all categories
- Suggest similar components if the exact one isn't found
- Explain the purpose of each configuration section

## Configuration Patterns and Best Practices

### Property Configuration Structure

Based on the checkbox component configuration, follow these patterns:

#### Text Input Properties
```json
{
  "name": "label",
  "label": "Label",
  "type": "text",
  "default": "Default value",
  "width": "180px",
  "placeholder": "Placeholder text",
  "valueHandler": { "ref": "componentInput", "params": ["label"] },
  "stateHandler": { "ref": "inputHandler", "params": ["label"] },
  "eventHandlers": {
    "valueChange": { "ref": "updateInput", "params": ["label", "value"] }
  }
}
```

#### Radio Button Properties (with Handler Support)
```json
{
  "name": "sizeoption",
  "inputProperty": "size",
  "label": "Size",
  "type": "radio",
  "default": "medium",
  "width": "180px",
  "options": [
    { "label": "Small", "value": "small" },
    { "label": "Medium", "value": "medium" },
    { "label": "Large", "value": "large" }
  ],
  "stateHandler": { "ref": "inputHandler", "params": ["size"] },
  "eventHandlers": {
    "onChange": { "ref": "updateInput", "params": ["size", "value"] }
  },
  "hasHandler": true,
  "handlerType": "input",
  "handlerProperty": "size"
}
```

#### Boolean/Checkbox Properties (with Handler Support)
```json
{
  "name": "disabled",
  "inputProperty": "disabled",
  "label": "Disabled",
  "type": "boolean",
  "default": false,
  "width": "180px",
  "stateHandler": { "ref": "inputHandler", "params": ["disabled"] },
  "eventHandlers": {
    "onChange": { "ref": "updateInput", "params": ["disabled", "value"] }
  },
  "hasHandler": true,
  "handlerType": "input",
  "handlerProperty": "disabled"
}
```

### Key Configuration Fields

- **name**: Internal property identifier (used in code)
- **label**: Display label shown in the UI
- **type**: Input type (`text`, `radio`, `boolean`, `number`, `select`, etc.)
- **inputProperty**: Maps to actual component property (when different from `name`)
- **default**: Default value for the property
- **width**: Input width (typically "180px")
- **placeholder**: Placeholder text for text inputs
- **options**: Array of options for radio/select inputs

### Handler Configuration

For properties that support dynamic handlers (code-driven values):

- **hasHandler**: `true` - Enables handler icon
- **handlerType**: `"input"` or `"style"` - Type of handler
- **handlerProperty**: Property name to use for handler (often same as `inputProperty`)
- **stateHandler**: Controls input enabled/disabled state
  - Use: `{ "ref": "inputHandler", "params": ["propertyName"] }`
- **eventHandlers**: Event handler mappings
  - `onChange`: For radio/boolean inputs
  - `valueChange`: For text inputs
  - Use: `{ "ref": "updateInput", "params": ["propertyName", "value"] }`

### Handler References

Common handler references to use:

- **Value Handlers**:
  - `componentInput` - Gets component input value
  - `componentStyle` - Gets component style value

- **State Handlers**:
  - `inputHandler` - Disables input when handler is active

- **Event Handlers**:
  - `updateInput` - Updates component input value
  - `updateStyle` - Updates component style value

## Theme Configuration Best Practices

### Theme Structure

Following the checkbox component pattern, theme files should:

1. **Use a flat structure** - No Dark/Light mode sections
2. **Group by functionality** - Organize CSS variables by purpose (General, Border, States, etc.)
3. **Use actual CSS variables** - Extract variables directly from the component's `.style.ts` file
4. **Remove interactive state sections** - Hover, focus, and active states are managed outside the theme

### Theme Configuration Example

```json
[
  {
    "name": "General",
    "open": true,
    "items": [
      { "label": "Background Color", "cssVar": "--nuraly-color-component-background" },
      { "label": "Text Color", "cssVar": "--nuraly-color-component-text" },
      { "label": "Placeholder Color", "cssVar": "--nuraly-color-text-secondary" }
    ]
  },
  {
    "name": "Border",
    "open": false,
    "items": [
      { "label": "Border Color", "cssVar": "--nuraly-color-border" }
    ]
  },
  {
    "name": "Disabled State",
    "open": false,
    "items": [
      { "label": "Disabled Background Color", "cssVar": "--nuraly-component-disabled-background" },
      { "label": "Disabled Text Color", "cssVar": "--nuraly-component-disabled-text-color" }
    ]
  }
]
```

### Updating Component Configuration Workflow

When updating or creating component configurations:

1. **Read the Nuraly UI component** (`src/features/runtime/components/ui/nuraly-ui/src/components/{name}/{name}.component.ts`)
   - Identify all `@property` decorators
   - Note property types, defaults, and names

2. **Read the wrapper component** (`src/features/runtime/components/ui/components/{category}/{Name}/{Name}.ts`)
   - Check which properties are already passed to the Nuraly UI component
   - Identify missing properties that should be added

3. **Read the style file** (`src/features/runtime/components/ui/nuraly-ui/src/components/{name}/{name}.style.ts`)
   - Extract CSS variables (look for `var(--nuraly-{component}-*)`)
   - Identify base color tokens (e.g., `--nuraly-color-*`)

4. **Update config.json**:
   - Add properties from step 1 that aren't in the config
   - Follow patterns from checkbox/select components
   - Add proper handler support for dynamic properties
   - Use consistent naming: `name`, `inputProperty`, `label`, `type`, etc.

5. **Update wrapper component**:
   - Add missing property bindings to match config.json
   - Use boolean binding (`?property`) for booleans
   - Use property binding (`.property`) for objects/arrays/complex types
   - Use attribute binding for strings when needed

6. **Update theme.json**:
   - Remove Dark/Light mode sections
   - Create flat structure with logical groupings
   - Use actual CSS variables from the style file
   - Remove hover/focus/active sections

7. **Update handlers.json**:
   - Extract event names from the Nuraly UI component (`@fires` comments)
   - Add all events to the handlers.json file
   - Use consistent naming: `onChange`, `onFocus`, `onBlur`, etc.

8. **Add event handlers to wrapper component**:
   - Map Nuraly UI events (`@nr-*`) to studio events (`on*`)
   - Use `this.executeEvent()` to trigger studio handlers
   - Pass relevant event data in the third parameter

### Example: Select Component Update

**From Nuraly UI component** (`select.component.ts`):
```typescript
@property({ type: Boolean }) searchable: boolean = false;
@property({ type: Boolean }) clearable: boolean = false;
@property({ type: String }) size: SelectSize = SelectSize.Medium;
```

**Add to config.json**:
```json
{
  "name": "searchable",
  "inputProperty": "searchable",
  "label": "Searchable",
  "type": "boolean",
  "default": false,
  "width": "180px",
  "stateHandler": { "ref": "inputHandler", "params": ["searchable"] },
  "hasHandler": true,
  "handlerType": "input",
  "handlerProperty": "searchable"
}
```

**Update wrapper** (`Select.ts`):
```typescript
<nr-select
  ?searchable=${this.inputHandlersValue?.searchable ?? false}
  ?clearable=${this.inputHandlersValue?.clearable ?? false}
  .size=${this.inputHandlersValue?.size ?? nothing}
>
```

**From style file** (`select.style.ts`):
```css
--nuraly-select-background: var(--nuraly-color-background-panel);
--nuraly-select-option-hover-background: var(--nuraly-color-background-hover);
```

**Update theme.json**:
```json
[
  {
    "name": "General",
    "open": true,
    "items": [
      { "label": "Background Color", "cssVar": "--nuraly-color-background-panel" }
    ]
  },
  {
    "name": "Options",
    "open": false,
    "items": [
      { "label": "Option Hover Background", "cssVar": "--nuraly-select-option-hover-background" }
    ]
  }
]
```

**From Nuraly UI component events** (`select.component.ts`):
```typescript
/**
 * @fires nr-change - Selection changed
 * @fires nr-focus - Component focused
 * @fires nr-blur - Component blurred
 * @fires nr-dropdown-open - Dropdown opened
 * @fires nr-dropdown-close - Dropdown closed
 * @fires nr-validation - Validation state changed
 */
```

**Update handlers.json**:
```json
{
  "handlerPrefix": "studio_select_handler",
  "events": [
    { "name": "onChange", "label": "onChange" },
    { "name": "onFocus", "label": "onFocus" },
    { "name": "onBlur", "label": "onBlur" },
    { "name": "onDropdownOpen", "label": "onDropdownOpen" },
    { "name": "onDropdownClose", "label": "onDropdownClose" },
    { "name": "onValidation", "label": "onValidation" }
  ]
}
```

**Add event handlers to wrapper** (`Select.ts`):
```typescript
<nr-select
  @nr-change=${(e: CustomEvent) => {
    this.executeEvent('onChange', e, {
      value: e.detail.value ?? EMPTY_STRING
    });
  }}
  @nr-focus=${(e: CustomEvent) => {
    this.executeEvent('onFocus', e);
  }}
  @nr-blur=${(e: CustomEvent) => {
    this.executeEvent('onBlur', e);
  }}
  @nr-dropdown-open=${(e: CustomEvent) => {
    this.executeEvent('onDropdownOpen', e);
  }}
  @nr-dropdown-close=${(e: CustomEvent) => {
    this.executeEvent('onDropdownClose', e);
  }}
  @nr-validation=${(e: CustomEvent) => {
    this.executeEvent('onValidation', e, {
      isValid: e.detail.isValid,
      message: e.detail.message
    });
  }}
>
```
