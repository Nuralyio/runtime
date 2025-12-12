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
3. **Read and display**: Show the relevant configuration files (config, handlers, theme, meta)
4. **Explain**: Provide context about what each configuration does
5. **Be helpful**: Suggest related configurations or components if relevant

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
