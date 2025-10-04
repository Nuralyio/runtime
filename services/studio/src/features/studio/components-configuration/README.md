# Components

JSON-driven component configurations organized by type.

## Structure:
- `_schemas/` - JSON schemas for validation
- `_shared/` - Shared configurations (typography, size, border, etc.)
- `inputs/` - Form input components (text-input, select, checkbox, etc.)
- `layout/` - Layout components (container, collapse, tabs)
- `data/` - Data-driven components (table, collection, menu)
- `media/` - Media components (image, video, icon, file-upload)
- `content/` - Rich content components (richtext, code, document)
- `navigation/` - Navigation components (link, button, dropdown)
- `advanced/` - Complex components (embed, ref-component, micro-app)

## Component Structure:
Each component folder contains:
- `config.json` - Properties configuration
- `handlers.json` - Event handlers
- `theme.json` - Theme variables
- `meta.json` - Metadata (uuid, childrenIds, etc.)
- `advanced/` - (Optional) Complex TypeScript logic
