import { $AllcomponentWithChildrens, $componentWithChildrens } from "$store/component/sotre";
import * as esprima from "esprima";
import * as escodegen from "escodegen";
import { type ComponentElement } from "$store/component/interface";
import {
  updateComponentAttributes,
  updateComponentError,
} from "$store/component/action";
import { executeInServiceWorker, registerApplicationsInServiceWorker, registerComponentsInServiceWorker } from "./helper";
import type { Extrats } from "./interfaces/core.interfaces";
import { $applications } from "$store/apps";
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

const styleHandlersCache = {};
let _components: ComponentElement[];
const isServer = typeof window === "undefined";
if (!isServer) {
  $AllcomponentWithChildrens().subscribe((components: ComponentElement[]) => {
    _components = components;
    components.forEach((component: ComponentElement) => {
      const { styleHandlers = {}, style = {}, /*attributesHandlers = {} */ } = component;
      Object.keys(styleHandlers).forEach((smartAttributeKey) => {
        executeInServiceWorker(
          components,
          component,
          "styleHandlers",
          smartAttributeKey,
          "style"
        );
      });

      /*Object.keys(attributesHandlers).forEach((smartAttributeKey) => {
         executeInServiceWorker(
           components,
           component,
           "attributesHandlers",
           smartAttributeKey,
           "attributes"
         );
       });*/
    });
  });
}



export function executeEventHandler(
  component: ComponentElement,
  handlerScope: string = "event",
  attributeName: string,
  extras?: Extrats
) {
  if (!_isServiceWorkerReady) {
    if (isVerbose) {
      console.warn('Service worker not ready yet pushing to stack')
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

export function serviceWorkerReadyCallback() {
  console.warn('Service worker ready');
  while (executeStack.length) {
    const executeStackItem = executeStack.shift();
    const { components, component, handlerScope, attributeName, extras } = executeStackItem;
    if (isVerbose) {
      console.warn('Service worker ready executing stack')
    }
    executeInServiceWorker(components, component, handlerScope, attributeName, extras);
  }
}

if (!isServer) {
  document.addEventListener('serviceWorkerReady',  function (){


  });
  navigator.serviceWorker.controller.postMessage({ type: 'CHECK_SERVICE_WORKER' });
  setTimeout(() => {
    _isServiceWorkerReady = true;
    serviceWorkerReadyCallback();

    $applications.subscribe((applications) => {
      registerApplicationsInServiceWorker(applications);
      $AllcomponentWithChildrens().subscribe((components: ComponentElement[]) => {
        console.log(components)
        registerComponentsInServiceWorker(components);
      });
    });
  },200)
}

export default {}