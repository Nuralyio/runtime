import {
  updateComponentStyles,
} from "$store/component/action";
import { type ComponentElement } from "$store/component/interface";
import { setVar, type ContextVarStore } from "$store/context/store";
import { setCurrentPageAction } from "$store/page/action";
import { addPageHandler } from "$store/page/handler";
import type { Application, Execute, Extrats, ServiceWorkerMessage } from "core/interfaces/core.interfaces";
import { NO_EVENT_LISTENER } from "utils/constants";
import { isVerbose } from "utils/envirement";

export function executeInServiceWorker(
  components: ComponentElement[],
  component: ComponentElement,
  handlerScope: string,
  attributeName: string,
  extras?: Extrats
) {
  const handlers = component[handlerScope];
  if (!component.errors) {
    component.errors = {};
  }

  if (handlers[attributeName]) {
    let messageChannel = new MessageChannel();
    messageChannel.port1.onmessage =  handleServiceWorkerMessageWrapper(NO_EVENT_LISTENER);
    const command = "executeFunction";
    if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
      navigator.serviceWorker.controller.postMessage(
        {
          command,
          codeToExecuteAsString: handlers[attributeName],
          components,
          component,
          extras
        },
        [messageChannel.port2]
      );
    }
  }
}


export function registerApplicationsInServiceWorker(applications: Application[]) {
  if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
    let messageChannel = new MessageChannel();
    const command = "registerApplications";
    navigator.serviceWorker.controller.postMessage(
      {
        command,
        payload: {
          applications
        }
      },
      [messageChannel.port2]
    );
  }
}


export function registerContextInServiceWorker(context: ContextVarStore) {
  if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
    let messageChannel = new MessageChannel();
    const command = "registerContext";
    navigator.serviceWorker.controller.postMessage(
      {
        command,
        payload: {
          context
        }
      },
      [messageChannel.port2]
    );
  }
}



export function registerComponentsInServiceWorker(components: ComponentElement[]) {
  if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
    let messageChannel = new MessageChannel();
    const command = "registerComponents";
    navigator.serviceWorker.controller.postMessage(
      {
        command,
        payload: {
          components
        }
      },
      [messageChannel.port2]
    );
  }
}


export function executeValueHandler(
  component: ComponentElement,
) {
  let messageChannel = new MessageChannel();
  const command = "executeValue";
  if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
    if ("serviceWorker" in navigator) {
      if (component.inputHandlers?.value) {
        navigator.serviceWorker.controller?.postMessage(
          {
            command,
            codeToExecuteAsString: component.inputHandlers?.value,
            component: component,
          },
          [messageChannel.port2]
        );
      }
    }
  }

  return messageChannel.port1;
}


export function executeDispalyHandler(
  component: ComponentElement,
) {
  let messageChannel = new MessageChannel();
  const command = "executeValue";
  if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
    if ("serviceWorker" in navigator) {
      if (component.input?.show?.value) {
        navigator.serviceWorker.controller?.postMessage(
          {
            command,
            codeToExecuteAsString: component.input?.show?.value,
            component: component,
          },
          [messageChannel.port2]
        );
      }
    }
  }

  return messageChannel.port1;
}


export function executeHandler(
  { eventId,
    component,
    type,
    extras
  }: Execute
) {
  let messageChannel = new MessageChannel();
  messageChannel.port1.onmessage = handleServiceWorkerMessageWrapper(eventId);
  const command = "executeValue";
  if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
    if ("serviceWorker" in navigator) {
      const valueToExecute = component.input?.[type]?.value;
      if (valueToExecute) {
        navigator.serviceWorker.controller?.postMessage(
          {
            command,
            codeToExecuteAsString: valueToExecute,
            component: component,
            extras
          },
          [messageChannel.port2]
        );
      }
    }
  }

  return messageChannel.port1;
}

function handleServiceWorkerMessageWrapper(eventId: string) {
  return function handleServiceWorkerMessage(event: MessageEvent) {
    const { funtionNameToExecute, eventData, component } = event.data as ServiceWorkerMessage;
    if (isVerbose) {
      console.info('event', event);
      console.info('eventData', eventData);
      console.info('funtionNameToExecute', funtionNameToExecute);
      console.info('component', component);
    }
    switch (funtionNameToExecute) {
      case 'updateStyle':
        updateComponentStyles(component.applicationId, component.uuid, eventData);
        break;
      case 'addPage':
        const { requestId } = event.data;
        addPageHandler(eventData.page, (page) => {
          navigator.serviceWorker.controller.postMessage({ requestId, success: true, result: page });
        }, (error) => {
          navigator.serviceWorker.controller.postMessage({ requestId, success: false, result: error });
        });
        break;
      case 'SetContextVar':
        const contextKey = Object.keys(eventData)[0];
        const contextValue = Object.values(eventData)[0];
        setVar(component.applicationId, contextKey, contextValue);
        break;
      case 'SelectPage':
        const { page } = eventData;
        setCurrentPageAction(page.uuid);
        break;
      case 'SetVar':
        const varKey = Object.keys(eventData)[0];
        const varValue = Object.values(eventData)[0];
        setVar("global", varKey, varValue);
        break;
      default:
        console.warn('Unknown function to execute:', funtionNameToExecute);
    }
    if (eventId) {
      document.dispatchEvent(new CustomEvent(eventId, { detail: { data: event.data } }));
    }
  }
}

