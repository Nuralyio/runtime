/**
 * Nuraly Runtime System
 * 
 * Main entry point for the runtime module that powers component execution,
 * state management, and handler evaluation in the Nuraly visual builder.
 */

// Core runtime context and state management
export {
  RuntimeInstance,
  ExecuteInstance,
  Editor,
  RuntimeHelpers
} from './state';

// Handler execution system
export {
  executeHandler,
  compileHandlerFunction
} from './handlers';

// Micro-application component (re-exported for convenience)
export { MicroApp } from '@shared/ui/components/runtime/MicroApp/MicroApp';
