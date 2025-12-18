# Processors Architecture

Technical design documentation for the Studio Processors Module.

## Overview

Code generation system transforming YAML/JSON configurations into component hierarchies.

## Design Principles

- Declarative configuration
- Separation of concerns
- Composability
- Type safety
- Performance

## Architecture

```
Config (YAML/JSON) → ConfigLoader → BlockGenerator → Components (cached) → Studio
                                         ├─ ContainerGenerator
                                         ├─ PropertyGenerator → InputGenerator
                                         └─ HandlerGenerator
```

## Generation Flow

1. Load config (YAML/JSON)
2. Generate containers and collapse
3. For each property: generate container + label + input + handler
4. Append common properties
5. Cache and return

## Handler Resolution

```typescript
if (typeof handler === 'string') return handler;        // Inline
if (handler.ref) return library[ref](...params);        // Reference
```

## Core Components

### BlockGenerator
Orchestrates component generation. Methods: `generateFromConfig`, `generateBlockComponents`. Generates: container → collapse → header → properties → common properties.

### ContainerGenerator
Generates structural containers: main (wrapper), collapse (expandable), header (title), properties (grid/flex).

### PropertyGenerator
Creates property UI: container + label + input + optional handler icon. Supports auto checkbox for CSS auto values.

### InputGenerator
Generates input components by type: event (Monaco), icon (picker), standard (text/number/select/color/checkbox). Auto-generates number events (onChange, onArrowUp/Down).

### HandlerGenerator
Creates handler icon components with code editor. For style handlers, updates `styleHandlers`. For input handlers, updates `component.input[property]` with `{type: 'handler', value: code}`.

### HandlerResolver
Resolves handlers to code strings:
```typescript
typeof handler === 'string' ? handler : library[ref](...params)
```

### ConfigLoader
Parses YAML/JSON configs. YAML for readability, JSON for tooling.

### ComponentLoader
Loads 4-file system: config, handlers, theme, metadata. Memoizes by UUID. Cache clears on HMR.

## Design Patterns

- **Factory**: Generator classes create components by type
- **Strategy**: Multiple handler resolution algorithms
- **Registry**: Centralized lookup (common properties, handlers)
- **Builder**: Step-by-step property assembly

## Performance

- **Memoization**: UUID-based cache, ~99% hit rate
- **Lazy Evaluation**: Handlers compiled at runtime, not generation
- **Structural Sharing**: Common components referenced, not cloned
- **Early Returns**: Guard clauses for fast failures

## Type Safety

```typescript
interface PropertyConfig { name, label, type, default }
interface BlockConfig { container, collapse, properties }
type HandlerSpec = string | { ref, params }
```

## 🚀 Performance Optimizations

### 1. Memoization

**Implementation**: Map-based cache in ComponentLoader

**Benefit**: 
- ~99% cache hit rate in development
- Prevents infinite loops on circular imports
- Near-instant returns on cache hits

**Trade-offs**:
- Memory usage increases with component count
- Must clear cache on config changes

### 2. Lazy Evaluation

**Implementation**: Handlers are strings, not compiled functions

**Benefit**:
- Generation is instant (no compilation overhead)
- Handlers compile only when first executed (runtime)
- Cache compiled functions for subsequent executions

**Trade-offs**:
- First execution slightly slower
- Syntax errors caught at runtime, not generation

### 3. Smart Defaults

**Implementation**: Optional parameters with sensible defaults

**Benefit**:
- Reduces configuration size
- Fewer lookups and resolutions
- Faster generation for simple cases

**Example**:
```typescript
updateInput(prop, valueType = 'string')  // Default to string
updateStyleWithUnit(prop, unit = 'px')   // Default to px
```

### 4. Structural Sharing

**Implementation**: Common components referenced, not cloned

**Benefit**:
- Reduced memory footprint
- Faster inclusion of common blocks
- Consistent references (useful for debugging)

**Trade-offs**:
- Must not mutate shared components

### 5. Early Returns

**Implementation**: Guard clauses in handlers and generators

**Benefit**:
- Avoid unnecessary processing
- Clear error cases
- Fail-fast behavior

**Example**:
```typescript
if (!selectedComponent) return;  // Early return
// ... rest of logic
```

## 🔐 Type Safety

### Interface Hierarchy

```typescript
// Base property interface
interface PropertyConfig {
  name: string;
  label: string;
  type: InputType;
  default: any;
  // ... common properties
}

// Block contains properties
interface BlockConfig {
  container: ContainerConfig;
  collapse: CollapseConfig;
  properties: PropertyConfig[];
}

// Generic config wraps blocks
interface GenericConfig {
  [blockName: string]: BlockConfig;
}
```

### Type Guards

```typescript
function isEventProperty(property: PropertyConfig): property is EventProperty {
  return property.type === 'event';
}

function hasHandlerSupport(property: PropertyConfig): boolean {
  return property.hasHandler || 
         property.type === 'number' || 
         property.type === 'text';
}
```

### Discriminated Unions

```typescript
type HandlerSpec = 
  | string                                      // Inline code
  | { ref: string; params?: any[] };            // Library reference

function resolveHandler(handler: HandlerSpec): string | undefined {
  if (typeof handler === 'string') {
    return handler;  // Type narrowing
  }
  // handler is { ref, params } here
}
```

## 🧪 Testing Strategy

### Unit Tests

**Target**: Individual generators and resolvers

**Examples**:
```typescript
describe('HandlerResolver', () => {
  it('should resolve inline handlers', () => {
    const result = HandlerResolver.resolveHandler('return 42', {});
    expect(result).toBe('return 42');
  });
  
  it('should resolve library references', () => {
    const library = { myHandler: () => 'code' };
    const result = HandlerResolver.resolveHandler(
      { ref: 'myHandler', params: [] },
      library
    );
    expect(result).toBe('code');
  });
});
```

### Integration Tests

**Target**: Complete generation pipeline

**Examples**:
```typescript
describe('BlockGenerator', () => {
  it('should generate complete size block', () => {
    const config = loadYaml('size-config.yaml');
    const components = generateFromConfig(config.sizeInputs, 'size');
    
    expect(components).toHaveLength(30);  // All components generated
    expect(components[0].uuid).toBe('size_container');
    expect(components).toContainComponent('width_input');
  });
});
```

### Snapshot Tests

**Target**: Generated component structure

**Examples**:
```typescript
it('should match size block snapshot', () => {
  const components = generateSizeComponents();
  expect(components).toMatchSnapshot();
});
```

## 🔮 Future Enhancements

### 1. Schema Validation

```typescript
import { z } from 'zod';

const PropertyConfigSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: z.enum(['number', 'text', 'select', ...]),
  default: z.any(),
  // ...
});

function validateConfig(config: unknown): BlockConfig {
  return BlockConfigSchema.parse(config);  // Throws on invalid
}
```

### 2. Visual Config Editor

```typescript
// GUI for creating configurations
function ConfigEditor({ config, onChange }) {
  return (
    <div>
      <PropertyList properties={config.properties} />
      <AddPropertyButton onClick={() => addProperty()} />
      <Preview components={generateFromConfig(config)} />
    </div>
  );
}
```

### 3. Config Inheritance

```yaml
# base-input-config.yaml
baseInput:
  properties:
    - name: width
      type: number

# text-input-config.yaml
extends: base-input-config.yaml
textInput:
  properties:
    - name: placeholder  # Inherits width from base
      type: text
```

### 4. Conditional Properties

```yaml
properties:
  - name: width
    type: number
    
  - name: maxWidth
    type: number
    showIf:
      property: width
      operator: notEqual
      value: auto
```

### 5. Property Groups

```yaml
properties:
  - group: Size
    properties:
      - name: width
      - name: height
      
  - group: Spacing
    properties:
      - name: margin
      - name: padding
```

## 📚 Related Documentation

- [README.md](./README.md) - User-facing documentation
- [API.md](./API.md) - Quick API reference
- [Handler Library](./handler-library.ts) - Handler implementations
- [Type Definitions](./property-block/types.ts) - TypeScript interfaces

## Contributing

To contribute architectural improvements:

1. Propose design in GitHub issue
2. Document rationale and trade-offs
3. Update this document
4. Implement with tests
5. Update related documentation
