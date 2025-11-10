/**
 * Variable Management Functions
 * 
 * Global and context-scoped variable operations for handler code.
 */

import { setVar } from '@shared/redux/store/context';

export function createVariableFunctions(runtimeContext: any) {
  const { context } = runtimeContext;

  return {
    /**
     * Sets a global variable
     */
    SetVar: (symbol: string, value: any): void => {
      setVar("global", symbol, value);
    },

    /**
     * Gets a global variable
     */
    GetVar: (symbol: string): any => {
      if (context && context["global"] && context["global"][symbol] && "value" in context["global"][symbol]) {
        return context["global"][symbol].value;
      }
    },

    /**
     * Gets a context-scoped variable
     */
    GetContextVar: (symbol: string, customContentId: string | null, component: any): any => {
      const contentId = customContentId || component?.application_id;
      if (context && context[contentId] && context[contentId]?.[symbol] && "value" in context[contentId]?.[symbol]) {
        return context[contentId]?.[symbol]?.value;
      }
      return null;
    },

    /**
     * Sets a context-scoped variable
     */
    SetContextVar: (symbol: string, value: any, component: any) => {
      setVar(component.application_id, symbol, value);
    },
  };
}
