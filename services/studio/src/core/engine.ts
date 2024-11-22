import { type ComponentElement } from "$store/component/interface";

import type { Extrats } from "../interfaces/core.interfaces";
import { isServer } from "utils/envirement";

const isVerbose = import.meta.env.PUBLIC_VERBOSE;

interface ExecuteStack {
  components: ComponentElement[];
  component: ComponentElement;
  handlerScope: string;
  attributeName: string;
  extras?: Extrats;
}

let executeStack: ExecuteStack[] = [];
if (!isServer) {
  // Handle default values executions here if needed.
}

/**
 * Callback function to be called when the service worker is ready.
 * Executes all pending executions in the stack.
 */
export function serviceWorkerReadyCallback() {
  console.warn('Service worker ready');
  while (executeStack.length) {
    const executeStackItem = executeStack.shift();
    const { components, component, handlerScope, attributeName, extras } = executeStackItem;
    if (isVerbose) {
      console.warn('Service worker ready, executing stack');
    }
    //executeInServiceWorker(components, component, handlerScope, attributeName, extras);
  }
}
let _isregistred = false;
if (!isServer) {

}

export default {};