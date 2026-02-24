# Component Properties Skill

Create, validate, and register studio property definitions for nuraly-ui components.

## Architecture Overview

The studio uses a **two-tier property system**:

1. **Runtime tier** — Lit `@property()` decorators in nuraly-ui component source files (`*.component.ts`) define the actual reactive properties on the web component.
2. **Studio tier** — `PropertyDefinition` objects (built via a TypeScript builder API) define how each property appears in the studio's right-side config panel: label, input type, options, handlers for reading/writing values, event wiring, etc.

A `ComponentDefinition` groups all `PropertyDefinition`s for a component together with metadata (type, name, category, panel config, events, common property blocks). These definitions are imported and registered in a central **registry** that converts them to the native panel format at runtime.

## Key Files

| File | Purpose |
|------|---------|
| `features/studio/core/properties/builder.ts` | Fluent builder API — factory functions (`text()`, `radio()`, `select()`, `boolean()`, `icon()`, `number()`, `color()`, `event()`, `date()`, `textarea()`) and shorthand helpers (`inputText()`, `inputBoolean()`, `inputRadio()`) |
| `features/studio/core/properties/types.ts` | `PropertyDefinition`, `ComponentDefinition`, `PropertyType`, `PropertyGroup` interfaces |
| `features/studio/core/properties/registry.ts` | Central registry — imports all definitions, converts to native panel format, exposes lookup functions |
| `features/studio/core/handlers/` | Handler classes: `value-handlers.ts`, `state-handlers.ts`, `event-handlers.ts`, `custom-handlers.ts`, `types.ts` |
| `features/studio/params/{category}/{component}/properties.ts` | Per-component property definitions |

### Handler Classes (commonly used)

From `core/handlers/index.ts`:
- `ComponentInputHandler` — reads a value from `component.inputs[prop]`
- `ComponentInputSelectHandler` — same but for select dropdowns
- `createDisabledAwareRadioHandler` — creates a radio value handler that respects disabled state
- `sizeRadioOptions`, `buttonShapeOptions` — reusable option arrays
- `InputStateHandler` — determines enabled/disabled from input presence
- `UpdateInputHandler` — event handler that writes back to `component.inputs[prop]`

## Canonical Example: Button

Reference: `features/studio/params/navigation/button/properties.ts`

Structure:
```typescript
import { text, radio, select, icon, inputText, inputBoolean, type PropertyDefinition, type ComponentDefinition } from '../../../core/properties';
import { ComponentInputHandler, ComponentInputSelectHandler, createDisabledAwareRadioHandler, sizeRadioOptions } from '../../../core/handlers';
import { InputStateHandler } from '../../../core/handlers/state-handlers';
import { UpdateInputHandler } from '../../../core/handlers/event-handlers';

// 1. Define option arrays for radio/select properties
const buttonTypeOptions = [
  { value: 'default', label: 'Default' },
  { value: 'primary', label: 'Primary' },
  // ...
];

// 2. Define each property using the builder API
const labelProperty = inputText('button_label', 'label', 'Label')
  .default('Button')
  .placeholder('Button text')
  .translatable()
  .build();

const typeProperty = radio('button_type')
  .label('Type')
  .inputProperty('type')
  .width('180px')
  .default('default')
  .valueHandler(createDisabledAwareRadioHandler('type', buttonTypeOptions, 'default', 'default'))
  .on('changed', new UpdateInputHandler('type', 'string'))
  .withInputHandler('type')
  .build();

const disabledProperty = inputBoolean('button_disabled', 'disabled', 'Disabled').build();

// 3. Export properties array and component definition
export const buttonProperties: PropertyDefinition[] = [
  labelProperty,
  typeProperty,
  // ...
];

export const buttonDefinition: ComponentDefinition = {
  type: 'button',
  name: 'Button',
  category: 'navigation',
  panel: {
    containerUuid: 'button_collapse_container',
    containerName: 'Button Fields Container',
    collapseUuid: 'button_collapse',
    collapseTitle: 'Button Properties',
  },
  properties: buttonProperties,
  events: ['click', 'focus', 'blur', 'mouseenter', 'mouseleave'],
  includeCommonProperties: [
    'component_value_text_block',
    'component_id_text_block',
    'display_block',
    'access_block',
    'component_hash_text_block',
  ],
};

export default buttonDefinition;
```

## Step-by-Step Workflow: Creating a `properties.ts`

### Step 1: Read the nuraly-ui Component Source

Find the component file at:
```
features/runtime/components/ui/nuraly-ui/src/components/{name}/{name}.component.ts
```

Extract every `@property()` decorator. Note:
- The property name (e.g., `@property() label = 'Button'`)
- The TypeScript type (`string`, `boolean`, `number`, enum type)
- The default value
- Any `@property({ type: Boolean })` type hints

### Step 2: Read the Types File

Check for enums and option types at:
```
features/runtime/components/ui/nuraly-ui/src/components/{name}/{name}.types.ts
```

Map enum values to option arrays for `radio()` or `select()` builders.

### Step 3: Create `properties.ts`

Create the file at:
```
features/studio/params/{category}/{component}/properties.ts
```

For each `@property` found:

| Property Type | Builder to Use |
|---------------|---------------|
| `string` (short text) | `inputText(id, inputProp, label)` or `text(id)` |
| `string` (long text) | `textarea(id)` |
| `boolean` | `inputBoolean(id, inputProp, label)` |
| `number` | `number(id)` with `.min()`, `.max()`, `.step()`, `.unit()` |
| enum with 2-4 values | `radio(id)` with `.options()` |
| enum with 5+ values | `select(id)` with `.options()` |
| color string | `color(id)` |
| icon string | `icon(id)` |
| date string | `date(id)` |

Naming conventions:
- Property ID: `{component}_{propertyName}` (e.g., `button_label`)
- Export names: `{component}Properties` (array) and `{component}Definition` (ComponentDefinition)

### Step 4: Register in `registry.ts`

Add an import to `features/studio/core/properties/registry.ts`:
```typescript
import { {component}Definition } from '../../params/{category}/{component}/properties';
```

Add the definition to the `ALL_DEFINITIONS` array (or wherever definitions are collected for registration).

### Step 5: Verify in Studio

Open the studio, drop the component onto the canvas, select it, and verify:
- All properties appear in the right panel
- Values read correctly from the component
- Changing values updates the component
- Events are listed

## Validation Checklist (for existing definitions)

When validating an existing `properties.ts`:

- [ ] **All `@property` fields covered** — Every `@property()` in the `.component.ts` has a corresponding `PropertyDefinition`
- [ ] **Correct types** — Property types match (string -> text, boolean -> boolean, enum -> radio/select, etc.)
- [ ] **Options match enums** — Radio/select options match the TypeScript enum values from `.types.ts`
- [ ] **Defaults are correct** — Default values match the component's default property values
- [ ] **Events list is complete** — All dispatched events (search for `this.dispatchEvent` or `this.emit`) are in the `events` array
- [ ] **Common properties included** — `includeCommonProperties` contains the standard blocks:
  - `component_value_text_block` (for components with a value)
  - `component_id_text_block`
  - `display_block`
  - `access_block`
  - `component_hash_text_block`
- [ ] **Handlers are wired** — Properties that need read/write have appropriate `valueHandler`, `stateHandler`, and event handlers
- [ ] **Registered in registry** — The definition is imported and included in `registry.ts`

## Component Categories

| Category | Components |
|----------|-----------|
| `inputs` | text-label, text-input, checkbox, select, textarea, datepicker, form, colorpicker, icon-button, number-input, radio-button, slider |
| `layout` | container, grid-row, grid-col, collapse, panel, tabs, card |
| `media` | image, icon, video, file-upload |
| `navigation` | button, link, dropdown, embed-url |
| `data` | table, collection, menu |
| `display` | badge, tag, divider |
| `content` | code, document, richtext, richtext-editor |
| `advanced` | chatbot, modal, embed, workflow, ref-component |

## PropertyType Reference

```
'text'     — Single-line text input
'textarea' — Multi-line text input
'number'   — Numeric input with optional min/max/step/unit
'boolean'  — Checkbox toggle
'radio'    — Radio button group (2-4 options)
'select'   — Dropdown select (5+ options)
'color'    — Color picker
'icon'     — Icon selector
'event'    — Event binding
'date'     — Date picker with optional format
```
