/**
 * Function Invocation
 * 
 * Invoke studio functions (backend functions).
 */

import { ExecuteInstance } from '../../state';
import { loadFunctionsHandler, invokeFunctionHandler } from '../../redux/handlers/functions';

export function createFunctionInvocationFunctions() {
  return {
    /**
     * Invokes a studio function by name
     * 
     * @param name - Function name to invoke
     * @param payload - Data to pass to the function
     * @returns Function execution result
     */
    InvokeFunction: async (name: string, payload: any = {}) => {
      if (!ExecuteInstance.Vars.studio_functions) {
        const functions = await loadFunctionsHandler();
        ExecuteInstance.VarsProxy.studio_functions = [...functions];
      }
      const targetFunction = (ExecuteInstance.Vars.studio_functions ?? []).find(_function => _function.label === name);
      try {
        const result = await invokeFunctionHandler(targetFunction.id, payload);

        const contentType = result.headers?.get("Content-Type") || "";

        if (contentType.includes("application/json")) {
          const jsonData = await result.json();
          return jsonData;
        } else {
          const textData = await result.text();
          return textData;
        }
      } catch (error) {
        console.error("Error in InvokeFunctionHandler:", error);
      }
    },
  };
}
