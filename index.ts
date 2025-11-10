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
  Navigation,
  FileStorage,
  Utils
} from './core';

// Handler execution system
export {
  executeHandler,
  compileHandlerFunction,
  executeHandler,
  prepareClosureFunction
} from './kernel';

// Micro-application component
export { MicroApp } from './micro-app';
