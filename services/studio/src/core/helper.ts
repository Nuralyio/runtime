import {
  updateComponent,
  updateComponentAttributes,
  updateComponentError,
  updateComponentInputs,
  updateComponentParameters,
  updateComponentStyles,
} from "$store/component/action";
import { type ComponentElement } from "$store/component/interface";
import { setVar, type ContextVarStore } from "$store/context/store";
import { addPageHandler } from "$store/page/handler";
import type { Application, Extrats, ServiceWorkerMessage } from "core/interfaces/core.interfaces";

const isVerbose = import.meta.env.PUBLIC_VERBOSE;
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
    messageChannel.port1.onmessage = function (event: MessageEvent) {
      const { funtionNameToExecute, eventData, component } = event.data as ServiceWorkerMessage;
      if (false) {
        console.info('event', event)
        console.info('eventData', eventData)
        console.info('funtionNameToExecute', funtionNameToExecute)
        console.info('component', component)
      }
      console.log(funtionNameToExecute)
      if (funtionNameToExecute === 'updateStyle') {
        updateComponentStyles(component.applicationId, component.uuid, eventData);
      }

      if(funtionNameToExecute === 'addPage'){

        const {requestId} = event.data ;
        addPageHandler(eventData.page , (page)=>{
          navigator.serviceWorker.controller.postMessage({ requestId, success: true, result: page });
        }, (error)=>{
          navigator.serviceWorker.controller.postMessage({ requestId, success: false, result: error });
        }) 
      }


      if (funtionNameToExecute === 'SetContextVar') {
        const key = Object.keys(eventData)[0];
        const value = Object.values(eventData)[0];
        setVar(component.applicationId, key, value);
      }


      if (funtionNameToExecute === 'SetVar') {
        const key = Object.keys(eventData)[0];
        const value = Object.values(eventData)[0];
        console.log("global", key, value)
        setVar("global", key, value);
      }


    }
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
  component: ComponentElement,
  type: string,
  extras?: Extrats
) {
  let messageChannel = new MessageChannel();
  messageChannel.port1.onmessage = function (event: MessageEvent) {
    const { funtionNameToExecute, eventData, component } = event.data as ServiceWorkerMessage;
    if (false) {
      console.info('event', event)
      console.info('eventData', eventData)
      console.info('funtionNameToExecute', funtionNameToExecute)
      console.info('component', component)
    }
    console.log(funtionNameToExecute)
    if (funtionNameToExecute === 'updateStyle') {
      updateComponentStyles(component.applicationId, component.uuid, eventData);
    }

    if(funtionNameToExecute === 'addPage'){

      const {requestId} = event.data ;
      addPageHandler(eventData.page , (page)=>{
        navigator.serviceWorker.controller.postMessage({ requestId, success: true, result: page });
      }, (error)=>{
        navigator.serviceWorker.controller.postMessage({ requestId, success: false, result: error });
      }) 
    }


    if (funtionNameToExecute === 'SetContextVar') {
      const key = Object.keys(eventData)[0];
      const value = Object.values(eventData)[0];
      setVar(component.applicationId, key, value);
    }


    if (funtionNameToExecute === 'SetVar') {
      const key = Object.keys(eventData)[0];
      const value = Object.values(eventData)[0];
      console.log("global", key, value)
      setVar("global", key, value);
    }


  }
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