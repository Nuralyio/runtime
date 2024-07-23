import { $AllcomponentWithChildrens, $componentWithChildrens } from "$store/component/sotre";
import { type ComponentElement } from "$store/component/interface";
import {
  updateComponentAttributes,
  updateComponentError,
} from "$store/component/action";
import { executeInServiceWorker, registerApplicationsInServiceWorker, registerComponentsInServiceWorker } from "./helper";
import type { Extrats } from "./interfaces/core.interfaces";
import { $applications } from "$store/apps";
import { isServer } from "utils/envirement";
import { getWorkerInstance } from "utils/worker-init";

const isVerbose = import.meta.env.PUBLIC_VERBOSE;

interface ExecuteStack {
  components: ComponentElement[];
  component: ComponentElement;
  handlerScope: string;
  attributeName: string;
  extras?: Extrats;
}

let executeStack: ExecuteStack[] = [];
let _isServiceWorkerReady = true;
let _components: ComponentElement[] = [];

if (!isServer) {
  // Handle default values executions here if needed.
}

/**
 * Executes an event handler for a component.
 * If the service worker is not ready, it pushes the execution details to a stack.
 */
export function executeEventHandler(
  component: ComponentElement,
  handlerScope: string = "event",
  attributeName: string,
  extras?: Extrats
) {
  if (!_isServiceWorkerReady) {
    if (isVerbose) {
      console.warn('Service worker not ready yet, pushing to stack');
    }
    executeStack.push({
      components: _components,
      component,
      handlerScope,
      attributeName,
      extras
    });
    return;
  }
  executeInServiceWorker(_components, component, handlerScope, attributeName, extras);
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
    executeInServiceWorker(components, component, handlerScope, attributeName, extras);
  }
}
let _isregistred = false;
if (!isServer) {
  getWorkerInstance().postMessage({ type: 'CHECK_SERVICE_WORKER' });
  _isServiceWorkerReady = true;
  // serviceWorkerReadyCallback();

  $applications.subscribe((applications) => {
    registerApplicationsInServiceWorker(applications);
    $AllcomponentWithChildrens().subscribe((components: ComponentElement[]) => {
      registerComponentsInServiceWorker(components);
      _isregistred = true;
    });
  });
}

export default {};