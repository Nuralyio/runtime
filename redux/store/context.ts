import { atom } from "nanostores";
import { persistentAtom } from "@nanostores/persistent";


const isServer = typeof window === "undefined";

if (!isServer) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  if (!win["__INITIAL_APPLICATION_STATE__"]) {
    win["__INITIAL_APPLICATION_STATE__"] = JSON.stringify([]);
  }
}

interface Var {
  type: string;
  value: any;
}

// Define the ContextVarStore interface
export interface ContextVarStore {
  [key: string]: { [varName: string]: Var } | undefined;
}

// Group of vars for each application and global context var
export const $context = atom<ContextVarStore>({
  "1": {
    label_one_content: {
      type: "string",
      value: "value"
    }
  },
  global: {
    showSecondsRow: {
      type: "boolean",
      value: false
    }
  }
});

// Function to get the type of a value
function getType(value: any): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

// Action to set a variable inside a specific application or globally
export function setVar(contextId: string, varName: string, varValue: any) {
  const varType = getType(varValue);
  const currentContext = $context.get();

  // Check if the value has changed (reserved for future optimization)
  const _currentVar = currentContext[contextId]?.[varName]?.value;
  void _currentVar; // Suppress unused variable warning

  const updatedContext = {
    ...currentContext,
    [contextId]: {
      ...currentContext[contextId],
      [varName]: {
        type: varType,
        value: varValue
      }
    }
  };


  $context.set(updatedContext);
}

// Action to read a variable from a specific application or globally
export function getVar(contextId: string, varName: string): Var | undefined {
  const currentContext = $context.get();
  if (currentContext[contextId] && currentContext[contextId]![varName]) {
    return currentContext[contextId]![varName];
  } else {
    return undefined;
  }
}

// Action to get the value of a variable from a specific application or globally
export function getVarValue(contextId: string, varName: string): any {
  const variable = getVar(contextId, varName);
  return variable ? variable.value : undefined;
}

// Action to get the type of a variable from a specific application or globally
export function getVarType(contextId: string, varName: string): string | undefined {
  const variable = getVar(contextId, varName);
  return variable ? variable.type : undefined;
}

// Persistent atom for storing specific variables in localStorage
export const persistentContext = persistentAtom<ContextVarStore>("persistentContext", {
  global: {}
}, {
  encode: JSON.stringify,
  decode: JSON.parse
});

// Action to set a persistent variable inside a specific application or globally
export function setPersistentVar(contextId: string, varName: string, varValue: any) {
  const varType = getType(varValue);
  const currentPersistentContext = persistentContext.get();
  const updatedPersistentContext = {
    ...currentPersistentContext,
    [contextId]: {
      ...currentPersistentContext[contextId],
      [varName]: {
        type: varType,
        value: varValue
      }
    }
  };

  persistentContext.set(updatedPersistentContext);
}

// Action to read a persistent variable from a specific application or globally
export function getPersistentVar(contextId: string, varName: string): Var | undefined {
  const currentPersistentContext = persistentContext.get();
  if (currentPersistentContext[contextId] && currentPersistentContext[contextId]![varName]) {
    return currentPersistentContext[contextId]![varName];
  } else {
    return undefined;
  }
}

// Action to get the value of a persistent variable from a specific application or globally
export function getPersistentVarValue(contextId: string, varName: string): any {
  const variable = getPersistentVar(contextId, varName);
  return variable ? variable.value : undefined;
}

// Action to get the type of a persistent variable from a specific application or globally
export function getPersistentVarType(contextId: string, varName: string): string | undefined {
  const variable = getPersistentVar(contextId, varName);
  return variable ? variable.type : undefined;
}
