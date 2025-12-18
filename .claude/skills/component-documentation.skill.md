# Component Documentation Skill

Generate comprehensive documentation for Nuraly UI components following the established documentation pattern.

## What this skill does

This skill helps you:
- Create complete component documentation for the docs service
- Extract component properties, events, and styling from source code
- Generate live demo code examples
- Follow the established text-input.md documentation pattern
- Document inputs, events, styling, and common patterns

## When to invoke this skill

Invoke this skill when the user asks about:
- "Create documentation for [component]"
- "Document the [component] component"
- "Write docs for [component]"
- "Generate component documentation"
- "Add documentation for [component]"

## Documentation Structure

All component documentation follows this structure (based on text-input.md):

```markdown
---
sidebar_position: [number]
title: [ComponentName]
description: [Brief description]
---

# [ComponentName]

[Overview paragraph]

## Overview

[Feature bullet points]

## Live Demo

[JSFiddle iframe with source code details]

## Basic Usage

[TypeScript code example]

## Component Inputs

[Table of all inputs with Type and Description]

---

## Inputs

[Detailed documentation for each input property]

---

## Events

[Detailed documentation for each event with EventData structure]

---

## Common Event Patterns

[Practical examples of common use cases]

---

## Styling

[Style structure and dynamic styling with Vars]
```

## Instructions for AI

When this skill is invoked:

### 1. Identify the Component

Locate the component source files:
- **Nuraly UI Component**: `services/studio/src/features/runtime/components/ui/nuraly-ui/src/components/{component-name}/`
- **Wrapper Component**: `services/studio/src/features/runtime/components/ui/components/{category}/{ComponentName}/`
- **Types File**: `{component-name}.types.ts`
- **Style File**: `{component-name}.style.ts`

### 2. Extract Component Information

From the component files, extract:

**From `.component.ts`:**
- All `@property` decorators with types, defaults, and descriptions
- All `@state` decorators
- Event names from `@fires` JSDoc comments
- Component element name from `@customElement`

**From `.types.ts`:**
- Enums for property values (sizes, variants, states)
- Interface definitions
- Validation patterns

**From `.style.ts`:**
- CSS custom properties (variables)
- Pseudo-state support (`:hover`, `:focus`, `:active`, `:disabled`)

**From wrapper `.ts`:**
- Event handler mappings (`@nr-*` to `on*`)
- Input handler value mappings
- Available event data passed via `executeEvent`

### 3. Generate Documentation

Create the documentation file at:
```
services/docs/docs/runtime/components/{component-name}.md
```

#### Frontmatter
```yaml
---
sidebar_position: [number based on component complexity/importance]
title: [ComponentName]
description: [One-line description with key features]
---
```

#### Overview Section
- Start with a bold component name and brief description
- List 5-8 key features as bullet points
- Focus on unique capabilities

#### Live Demo Section
- Include JSFiddle iframe (if available)
- Provide collapsible source code block showing:
  - Sample application data
  - Sample page data
  - Sample component data with the component in use

#### Basic Usage
```typescript
{
  uuid: "example-id",
  name: "component_name",
  component_type: ComponentType.[ComponentName],
  input: {
    // Key properties with static values
  },
  event: {
    // Primary event handler example
  }
}
```

#### Component Inputs Table
| Property | Type | Description |
|----------|------|-------------|
| `propertyName` | type | Description |

#### Detailed Inputs Section
For each property:
```markdown
### propertyName
**Type:** `type`

Description of what this property does.

**Static Example:**
\```typescript
input: {
  propertyName: { type: "type", value: defaultValue }
}
\```
```

#### Events Section
For each event:
```markdown
### eventName
**Triggered:** When [condition]

**EventData:**
\```typescript
{
  value: type      // Description
  event: Event     // Native event
}
\```

**Example:**
\```typescript
event: {
  eventName: `
    // Event handler code
  `
}
\```
```

#### Common Event Patterns
Include 3-5 practical examples:
- Form submission
- Real-time validation
- Dependent field updates
- API integration patterns

#### Styling Section
Document:
- Base style structure
- Pseudo-state styles (`:hover`, `:focus`, `:active`, `:disabled`)
- Dynamic styling with `styleHandlers` and `Vars`
- CSS custom properties available

### 4. Documentation Conventions

**Input Property Documentation:**
- Always include `type`, description, and example
- Group related properties (validation, appearance, behavior)
- Note which properties support handlers

**Event Documentation:**
- Document all EventData properties
- Include practical example code
- Note async support where applicable

**Styling Documentation:**
- List all CSS custom properties
- Show pseudo-state style objects
- Include dynamic styleHandlers examples

**Code Examples:**
- Use consistent formatting
- Include comments explaining key concepts
- Show both simple and advanced usage

### 5. Reference Files

Always read the text-input.md as the reference template:
```
services/docs/docs/runtime/components/text-input.md
```

Extract CSS variables from the style file:
```
services/studio/src/features/runtime/components/ui/nuraly-ui/src/components/{name}/{name}.style.ts
```

## Example Component Documentation Generation

**User:** Create documentation for the checkbox component

**Steps:**
1. Read `services/studio/src/features/runtime/components/ui/nuraly-ui/src/components/checkbox/checkbox.component.ts`
2. Read `services/studio/src/features/runtime/components/ui/nuraly-ui/src/components/checkbox/checkbox.types.ts`
3. Read `services/studio/src/features/runtime/components/ui/nuraly-ui/src/components/checkbox/checkbox.style.ts`
4. Read `services/studio/src/features/runtime/components/ui/components/inputs/Checkbox/Checkbox.ts` (wrapper)
5. Read `services/docs/docs/runtime/components/text-input.md` (reference template)
6. Generate `services/docs/docs/runtime/components/checkbox.md` following the pattern

## Component Categories

Components are organized by category:

| Category | Components | Wrapper Path |
|----------|------------|--------------|
| inputs | input, checkbox, radio, select, datepicker, timepicker, colorpicker, slider-input, textarea, file-upload | `components/inputs/` |
| layout | flex, grid, panel, card, collapse, divider | `components/layout/` |
| display | badge, tag, alert, skeleton, breadcrumb | `components/display/` |
| navigation | button, menu, dropdown, tabs | `components/navigation/` |
| data | table | `components/data/` |
| media | image, video, icon, document | `components/media/` |
| feedback | toast, modal, popconfirm, tooltips | `components/feedback/` |

## Key Documentation Patterns

### Input Properties Pattern
```markdown
### value
**Type:** `string`

The current value of the component.

**Static Example:**
\```typescript
input: {
  value: { type: "string", value: "Initial value" }
}
\```
```

### Event Pattern
```markdown
### onChange
**Triggered:** When the value changes

**EventData:**
\```typescript
{
  value: string      // New value
  oldValue: string   // Previous value
  event: Event       // Native event
}
\```

**Example:**
\```typescript
event: {
  onChange: `
    Vars.fieldValue = EventData.value;

    // Validation
    if (EventData.value.length < 3) {
      Vars.error = "Minimum 3 characters";
    } else {
      Vars.error = "";
    }
  `
}
\```
```

### Styling Pattern
```markdown
## Styling

### Style Structure

\```typescript
style: {
  // Base styles
  width: "100%",

  // Pseudo-state styles
  ":hover": {
    borderColor: "#2196F3"
  },
  ":focus": {
    outline: "2px solid #2196F3"
  },
  ":disabled": {
    opacity: "0.5"
  }
}
\```

### Dynamic Styling with Vars

\```typescript
styleHandlers: {
  backgroundColor: `return Vars.theme === 'dark' ? '#333' : '#fff';`,

  ":hover": `
    return {
      borderColor: Vars.theme === 'dark' ? '#666' : '#999'
    };
  `
}
\```
```

## Tips

- Always check the component's `@fires` comments for event names
- Extract CSS variables directly from the `.style.ts` file
- Use the wrapper component to understand event data structure
- Include microapp context patterns (Vars, Current, global scope)
- Document async event handling support
- Show EventData structure for each event type
