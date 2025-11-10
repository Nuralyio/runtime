# Contributing to Nuraly Runtime System

Thank you for your interest in contributing to the Nuraly Runtime System! This guide will help you understand how to contribute effectively.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Architecture Understanding](#architecture-understanding)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Code Style](#code-style)
- [Pull Request Process](#pull-request-process)
- [Common Contribution Areas](#common-contribution-areas)

## Getting Started

Before contributing, please:

1. **Read the README.md** - Understand the runtime system architecture
2. **Review existing code** - Familiarize yourself with patterns and conventions
3. **Check open issues** - See if your idea or bug is already being addressed
4. **Discuss major changes** - Open an issue before starting large refactors

## Development Setup

### Prerequisites

```bash
# Node.js 18+ required
node --version

# Install dependencies
npm install

# Start development server
npm run dev
```

### Project Structure

```
runtime/
├── handlers/           # Handler execution system
│   ├── compiler.ts    # Function compilation
│   ├── handler-executor.ts  # Execution orchestration
│   ├── context-setup.ts     # Context initialization
│   └── runtime-api/   # Global functions
│       ├── variables.ts
│       ├── components.ts
│       ├── navigation.ts
│       └── ... (more API modules)
└── state/             # Runtime state management
    ├── runtime-context.ts   # Core context singleton
    └── editor.ts            # Editor state
```

## Architecture Understanding

### Key Concepts

1. **Handlers**: JavaScript code strings executed at runtime
2. **ExecuteInstance**: Singleton managing runtime state
3. **Runtime API**: Global functions available in handler code
4. **Proxies**: Reactive state with change detection

### Execution Flow

```
Component Event → setupRuntimeContext() → compileHandlerFunction() → executeHandler() → Result
```

### Critical Files

- `runtime-context.ts` - Core state management (modify carefully!)
- `compiler.ts` - Function compilation (performance critical)
- `handler-executor.ts` - Main execution flow
- `runtime-api/index.ts` - API aggregation

## Making Changes

### Adding New Runtime API Functions

1. **Choose the appropriate module** in `handlers/runtime-api/`
2. **Add function to creator** with JSDoc documentation
3. **Update HANDLER_PARAMETERS** in `compiler.ts`
4. **Pass parameter** in `handler-executor.ts`
5. **Document in README.md**

Example:

```typescript
// 1. In handlers/runtime-api/variables.ts
export function createVariableFunctions(runtimeContext: any) {
  return {
    /**
     * Clears all global variables.
     * 
     * @description
     * Removes all variables from the global scope.
     * Use with caution as this affects all applications.
     * 
     * @returns {void}
     * 
     * @example
     * ```javascript
     * ClearAllVars();
     * ```
     */
    ClearAllVars: (): void => {
      // Implementation
      context.global = {};
    },
  };
}

// 2. In handlers/compiler.ts
export const HANDLER_PARAMETERS = [
  // ... existing parameters
  "ClearAllVars",  // Add at the end
] as const;

// 3. In handlers/handler-executor.ts
return compiledFunction(
  // ... existing parameters
  globalFunctions.ClearAllVars  // Pass in same order
);
```

### Modifying Core Runtime

**⚠️ Warning**: Changes to `runtime-context.ts` affect the entire system.

Before modifying:
- ✅ Write comprehensive tests
- ✅ Check performance impact
- ✅ Update documentation
- ✅ Consider backward compatibility

### Performance Considerations

The runtime system is performance-critical. Always consider:

- **Caching**: Use existing cache patterns
- **Proxy Creation**: Avoid unnecessary proxy recreation
- **Store Updates**: Batch updates when possible
- **Handler Compilation**: Leverage compilation cache

## Testing

### Unit Tests

```bash
# Run tests
npm test

# Run specific test file
npm test runtime-context.test.ts

# Watch mode
npm test -- --watch
```

### Testing Handlers

```typescript
import { executeHandler, compileHandlerFunction } from '@features/runtime';

describe('Handler Execution', () => {
  it('should execute simple handler', () => {
    const component = createMockComponent();
    const result = executeHandler(component, "return 42");
    expect(result).toBe(42);
  });

  it('should access variables', () => {
    const component = createMockComponent();
    executeHandler(component, "SetVar('test', 'value')");
    const result = executeHandler(component, "return GetVar('test')");
    expect(result).toBe('value');
  });
});
```

### Integration Tests

Test full execution flow with real components:

```typescript
import { MicroApp } from '@features/runtime';
import { render } from '@testing-library/lit';

describe('Runtime Integration', () => {
  it('should execute onClick handler', async () => {
    const app = await render(html`
      <micro-app uuid="test-app" page_uuid="test-page"></micro-app>
    `);
    
    const button = app.querySelector('button');
    button?.click();
    
    // Assert handler effects
  });
});
```

## Code Style

### TypeScript

```typescript
// ✅ Good: Type annotations, JSDoc, clear naming
/**
 * Executes a component handler with full runtime context.
 * 
 * @param component - The component context
 * @param code - Handler code string
 * @returns Handler execution result
 */
export function executeHandler(
  component: ComponentElement,
  code: string
): any {
  // Implementation
}

// ❌ Bad: No types, no docs, unclear naming
export function exec(c, cd) {
  // Implementation
}
```

### Documentation

All exported functions must have:
- JSDoc description
- Parameter documentation
- Return value documentation
- At least one usage example
- Performance notes (if relevant)

### File Organization

```typescript
// 1. File header with @fileoverview
/**
 * @fileoverview Brief description
 * @module Runtime/Path/To/Module
 */

// 2. Imports (external first, then internal)
import { RuntimeHelpers } from '@shared/utils/runtime-helpers';
import { ExecuteInstance } from '../state';

// 3. Constants
const DEBUG = false;

// 4. Types/Interfaces
interface HandlerContext {
  // ...
}

// 5. Main code
export function mainFunction() {
  // ...
}

// 6. Helper functions (private)
function helperFunction() {
  // ...
}
```

### Naming Conventions

- **Functions in handler code**: PascalCase (`GetVar`, `NavigateToPage`)
- **Internal functions**: camelCase (`executeHandler`, `setupContext`)
- **Classes**: PascalCase (`RuntimeContext`, `Editor`)
- **Constants**: UPPER_SNAKE_CASE (`HANDLER_PARAMETERS`, `DEBUG`)
- **Files**: kebab-case (`handler-executor.ts`, `runtime-api`)

## Pull Request Process

### Before Submitting

- ✅ All tests pass
- ✅ Code is documented
- ✅ README updated (if adding features)
- ✅ No console.logs (unless DEBUG mode)
- ✅ TypeScript compiles without errors
- ✅ Performance is acceptable

### PR Title Format

```
type(scope): Brief description

Examples:
feat(runtime-api): Add ClearAllVars function
fix(compiler): Fix cache invalidation bug
docs(readme): Update handler execution flow diagram
perf(executor): Optimize context setup by 30%
refactor(state): Simplify proxy creation logic
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Motivation
Why is this change needed?

## Changes Made
- Change 1
- Change 2

## Testing
How was this tested?

## Performance Impact
Any performance implications?

## Breaking Changes
List any breaking changes (if applicable)

## Documentation
- [ ] README updated
- [ ] JSDoc comments added
- [ ] Examples provided
```

### Review Process

1. **Automated checks** run (lint, tests, build)
2. **Code review** by maintainers
3. **Testing** in staging environment
4. **Approval** and merge

## Common Contribution Areas

### 🐛 Bug Fixes

**High Priority:**
- Handler execution errors
- Memory leaks
- Performance regressions
- TypeScript type errors

**How to Report:**
1. Open issue with reproduction steps
2. Include error messages/stack traces
3. Provide minimal reproduction code
4. Note browser/environment details

### ✨ Feature Additions

**Good First Issues:**
- New runtime API functions
- Additional helper utilities
- Documentation improvements
- Test coverage improvements

**Major Features:**
- New handler capabilities
- Performance optimizations
- New runtime modes
- Architecture changes

### 📚 Documentation

Always welcome:
- Improved examples
- Tutorial additions
- Architecture diagrams
- API reference clarifications

### 🎯 Performance

If optimizing:
- Benchmark before and after
- Document performance gains
- Consider memory impact
- Test with realistic data

## Questions?

- **Architecture questions**: Open a discussion issue
- **Bug reports**: Open a bug issue
- **Feature requests**: Open a feature request issue
- **General help**: Check README.md or discussions

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on code, not people
- Help others learn and grow

---

Thank you for contributing to Nuraly! 🚀
