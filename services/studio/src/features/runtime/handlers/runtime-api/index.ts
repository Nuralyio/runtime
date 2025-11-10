/**
 * Runtime API
 * 
 * Main entry point that aggregates all runtime API functions available to handler code.
 * These functions allow handlers to interact with the runtime system,
 * manage components, variables, pages, and more.
 */

import { ExecuteInstance } from '../../state';
import { createVariableFunctions } from './variables';
import { createComponentFunctions } from './components';
import { createComponentPropertyFunctions } from './component-properties';
import { createPageFunctions } from './pages';
import { createApplicationFunctions } from './applications';
import { createNavigationFunctions } from './navigation';
import { createStorageFunctions } from './storage';
import { createFunctionInvocationFunctions } from './functions';
import { createEditorFunctions } from './editor';

/**
 * Creates all global functions available to handler code.
 * These functions are injected into the handler execution context.
 * 
 * @param runtimeContext - The runtime context object
 * @returns Object containing all global handler functions
 */
export function createGlobalHandlerFunctions(runtimeContext: any) {
  return {
    ...createVariableFunctions(runtimeContext),
    ...createComponentFunctions(runtimeContext),
    ...createComponentPropertyFunctions(),
    ...createPageFunctions(),
    ...createApplicationFunctions(),
    ...createNavigationFunctions(),
    ...createStorageFunctions(),
    ...createFunctionInvocationFunctions(),
    ...createEditorFunctions(),
  };
}

/**
 * Sets up ExecuteInstance with GetVar and GetContextVar functions
 */
export function registerGlobalFunctionsToExecuteInstance(globalFunctions: any): void {
  ExecuteInstance.GetVar = globalFunctions.GetVar;
  ExecuteInstance.GetContextVar = globalFunctions.GetContextVar;
}
