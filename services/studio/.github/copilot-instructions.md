# Nuraly Frontend Development Guide

## Architecture Overview

Nuraly is a visual web application builder with a component-based micro-frontend architecture. The system consists of:

- **Studio**: Visual drag-and-drop editor (`/app/studio/`)
- **Runtime**: Application preview and execution (`/app/view/`)
- **Component System**: Lit-based web components extending `BaseElementBlock`
- **Kernel**: Central execution engine managing component lifecycle and state

## Core Design Patterns

### Component Architecture
All UI components extend `BaseElementBlock` from `src/shared/ui/BaseElement.ts`:
```typescript
export class MyComponent extends BaseElementBlock {
  @property({ type: Object }) component;
  // Component automatically handles input/style handlers, events, and lifecycle
}
```

Components are defined by `ComponentElement` interface with:
- `uuid`: Unique identifier
- `component_type`: From `ComponentType` enum
- `childrenIds`: Array of child component UUIDs
- `input`: Handler-based properties with `{type: "handler", value: "JS code"}`
- `style`: CSS properties (can use handlers)
- `event`: Event handlers (onClick, onChange, etc.)

### State Management (Nanostores)
```typescript
// Global stores in src/store/
$components     // Component definitions by application
$context        // Application context variables  
$currentPage    // Active page state
$applications   // Application registry

// Usage pattern:
import { $components } from "$store/component/store.ts";
$components.get()["appId"] // Get components for app
$components.setKey("appId", components) // Update components
```

### Event System
- **Handler Execution**: JavaScript code in handlers executed via `executeCodeWithClosure()` in service worker
- **Event Communication**: Central `eventDispatcher` for component communication
- **Context Variables**: `SetVar("key", value)` and `GetVar("key")` for global state
- **Component Events**: `executeEventHandler(component, "event", "onClick", {EventData: {...}})`

### Micro-Application Pattern
Each app is isolated with own components/pages via `<micro-app>` element:
```typescript
<micro-app uuid="app-id" page_uuid="page-id" mode="edit|preview"></micro-app>
```

## Key Development Workflows

### Adding New Components
1. Create in `src/shared/ui/[ComponentName]/`
2. Extend `BaseElementBlock`
3. Define in `ComponentType` enum
4. Add to render mapping in `src/utils/render-util.ts`
5. Register in studio panels for drag-and-drop

### Studio Feature Structure
The Studio feature is organized in `src/features/studio/`:
- **components/** - Studio-specific feature components:
  - `function/` - Function editor components
  - `flow/` - Flow editor components
  - `database/` - Database management components
  - `files/` - File management components
  - `page/` - Page management components
  - `editor-micro-apps/` - Micro-app components for editor
  - Plus: `_shared/`, `advanced/`, `content/`, `data/`, `inputs/`, `layout/`, `media/`, `navigation/`
  
- **panels/** - Studio UI panels and layouts:
  - `control-panel/` - Property control panels
  - `layout/` - Editor layout components
  - `main-panel/` - Main editor panel
  - `left-panel/`, `right-panel/` - Side panels
  - `log-panel/`, `screen-panel/`, `top-bar/` - Utility panels
  
- **blocks/** - Configuration blocks
- **core/** - Core studio utilities and helpers
- **factories/** - Component factories for generating UI
- **processors/** - Data processors

Import from `@features/studio/*` for studio-specific code.

### Studio Component Configuration
Studio uses factory pattern for generating property panels:
- Configs in `src/features/studio/config/`
- Factories in `src/features/studio/factories/`
- Generated blocks in `src/features/studio/blocks/`

Example: `size-configs.ts` + `style-block-factory.ts` → `size-collapse-block.ts`

### Building & Running
```bash
npm run dev          # Development with hot reload
npm run build        # Production build (SSR + client hydration)
npm run server       # Production server
npm run start        # Dev server with external access
```

### Handler Development
JavaScript handlers execute in service worker context with globals:
- `GetVar(scope, key)` / `SetVar(scope, key, value)` - Context management
- `GetComponent(uuid, appId)` - Component access
- `AddPage(page, appId)` - Page creation
- `SelectPage(pageData)` - Navigation
- Component properties via closure scope

## Critical File Patterns

### Component Structure
```
src/shared/ui/[ComponentName]/
├── [ComponentName].ts        # Main component class
├── [ComponentName].style.ts  # Component styles  
└── templates/               # Sub-templates (optional)
```

### Store Actions
```typescript
// src/store/actions/component.ts
updateComponentAttributes(appId, componentId, "style|event|input", changes)
addComponentAction(component, pageUuid)  
moveDraggedComponent(dropTargetId, draggedId)
```

### API Integration
```typescript
// src/api/ - API service layer organized by domain
import { fetchApplicationById, fetchAllApplications } from '@api';
import { fetchPageComponentById } from '@api/components';
import { fetchApplicationPagesById } from '@api/pages';
```

### Service Integration
- SSR data injection via `window["__INITIAL_COMPONENT_STATE__"]`
- Worker communication via `src/utils/worker/worker.ts`
- API utilities in `src/shared/utils/api-calls-utils.ts`

## Common Conventions

- **UUIDs**: Use `uuidv4()` for component/page identifiers
- **Naming**: kebab-case for files, PascalCase for classes, camelCase for properties
- **Imports**: Use `$store/*` for stores, `@api/*` for API calls, `@features/*` for features, `@shared/*` for shared code
- **Event Handling**: Prefer handler-based approach over direct DOM events
- **Styling**: CSS-in-JS via Lit `css` template, CSS variables for theming

## Integration Points

- **Astro SSR**: Pages in `src/pages/` with `.astro` extension
- **Monaco Editor**: Code editing with TypeScript support
- **Custom Elements**: `@nuralyui/*` component library integration
- **Docker**: Multi-stage build with `Dockerfile` and `docker-compose.yml`

## Debugging

- Enable verbose logging via `PUBLIC_VERBOSE=true` environment variable
- Component state debugging via `$debug` store
- Service worker communication logs in browser DevTools
- Component hierarchy inspection via browser's custom elements panel