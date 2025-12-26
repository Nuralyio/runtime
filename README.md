# Nuraly Runtime

A lightweight execution engine for visual web applications. Powers component lifecycle, state management, and dynamic code execution.

## Features

- **Dynamic Handlers** - Execute JavaScript code strings with full runtime context
- **Reactive State** - Proxy-based change detection with automatic updates
- **Component Lifecycle** - Manage registration, hierarchy, and relationships
- **Platform-Aware** - Responsive design with breakpoint support

## Installation

```bash
npm install @nuraly/runtime
```

## Quick Start

```typescript
import { executeHandler, ExecuteInstance } from '@nuraly/runtime';

// Set a global variable
ExecuteInstance.SetVar('username', 'John');

// Execute a handler
const result = executeHandler(
  component,
  "return `Hello, ${GetVar('username')}!`"
);
```

## Documentation

- [Handler API](docs/handlers.md)
- [State Management](docs/state.md)
- [Component API](docs/components.md)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT
