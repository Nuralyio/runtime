import {
  updateComponentAttributes,
} from "$store/actions/component";
import { type ComponentElement } from "$store/component/interface";
import type { ComponentStore } from "$store/component/component-sotre";
import { setVar, type ContextVarStore } from "$store/context";
import { setCurrentPageAction } from "$store/actions/page";
import { addPageHandler,updatePageHandler } from "$store/handlers/pages/handler";
import type { Application, Execute, Extrats, ServiceWorkerMessage } from "interfaces/core.interfaces";
import { NO_EVENT_LISTENER } from "utils/constants";
import { isVerbose } from "utils/envirement";
import { log } from "utils/logger";
import { getNestedAttribute } from "utils/object.utils";
import { getWorkerInstance } from "utils/worker/worker-init";

let workerInstance = typeof window !== 'undefined' && typeof window.navigator !== 'undefined' ? getWorkerInstance() : null;

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
    messageChannel.port1.onmessage = handleServiceWorkerMessageWrapper(NO_EVENT_LISTENER);
    const command = "executeFunction";
    if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
      try {
        if (!workerInstance) workerInstance = getWorkerInstance();
        workerInstance.postMessage(
          {
            command,
            codeToExecuteAsString: handlers[attributeName],
            components,
            component,
            extras
          },
          [messageChannel.port2]
        );
      } catch (error) {
        console.error("Error in executeInServiceWorker:", error);
      }
    }
  }
}

export function registerApplicationsInServiceWorker(applications: Application[]) {
  log.prefix("Core Helper:").info('register application', applications);

  if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
    let messageChannel = new MessageChannel();
    const command = "registerApplications";
    try {
      if (!workerInstance) workerInstance = getWorkerInstance();
      workerInstance.postMessage(
        {
          command,
          payload: {
            applications
          }
        },
        [messageChannel.port2]
      );
    } catch (error) {
      console.error("Error in registerApplicationsInServiceWorker:", error);
    }
  }
}

export function registerContextInServiceWorker(context: ContextVarStore) {
  log.prefix("Core Helper:").info('register context', context);
    let messageChannel = new MessageChannel();
    const command = "registerContext";
    try {
      if (!workerInstance) workerInstance = getWorkerInstance();
      workerInstance.postMessage(
        {
          command,
          payload: {
            context
          }
        },
        [messageChannel.port2]
      );
    } catch (error) {
      console.error("Error in registerContextInServiceWorker:", error);
    }
}

export function registerApplicationComponentsInServiceWorker(componentStore: ComponentStore) {
  log.prefix("Core Helper:").info('register application components', componentStore);
    let messageChannel = new MessageChannel();
    const command = "registerApplicationComponents";
    try {
      if (!workerInstance) workerInstance = getWorkerInstance();
      workerInstance.postMessage(
        {
          command,
          payload: {
            componentStore
          }
        },
        [messageChannel.port2]
      );
    } catch (error) {
      console.error("Error in registerApplicationComponentsInServiceWorker:", error);
    }
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
  const handler = getNestedAttribute(component, type);
  const valueToExecute = (handler as any)?.value;

  if (valueToExecute) {
    try {
      if (!workerInstance) workerInstance = getWorkerInstance();
      workerInstance.postMessage(
        {
          command,
          codeToExecuteAsString: valueToExecute,
          component: component,
          extras
        },
        [messageChannel.port2]
      );
    } catch (error) {
      console.error("Error in executeHandler:", error);
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
    if (funtionNameToExecute)
      switch (funtionNameToExecute) {
        case 'updateStyle':
          setTimeout(() => {
            updateComponentAttributes(component.applicationId, component.uuid, "style", eventData);
          }, 0);
          break;
        case 'updateStyleHandlers':
            setTimeout(() => {
              updateComponentAttributes(component.applicationId, component.uuid, "styleHandlers", eventData);
            }, 0);
          break;
          case 'updateEvent':
            setTimeout(() => {
              updateComponentAttributes(component.applicationId, component.uuid, "event", eventData);
            }, 0);
            break;
          case 'updateInput':
            setTimeout(() => {
              updateComponentAttributes(component.applicationId, component.uuid, "input", eventData);
            }, 0);
            break;
        case 'addPage':
          const { requestId } = event.data;
          addPageHandler(eventData.page, (page) => {
            try {
              if (!workerInstance) workerInstance = getWorkerInstance();
              workerInstance.postMessage({ requestId, success: true, result: page });
            } catch (error) {
              console.error("Error in addPage:", error);
              if (!workerInstance) workerInstance = getWorkerInstance();
              workerInstance.postMessage({ requestId, success: false, result: error });
            }
          });
          break;
        case 'updatePage':
           const { request } = event.data;
           updatePageHandler(eventData.page, (page) => {
            try {
              if (!workerInstance) workerInstance = getWorkerInstance();
              workerInstance.postMessage({ request, success: true, result: page });
            } catch (error) {
              console.error("Error in updatePage:", error);
              if (!workerInstance) workerInstance = getWorkerInstance();
              workerInstance.postMessage({ request, success: false, result: error });
            }
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
      }
    if (eventId) {
      document.dispatchEvent(new CustomEvent(eventId, { detail: { data: event.data } }));
    }
  }
}