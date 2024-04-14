import {
  updateComponent,
  updateComponentAttributes,
  updateComponentError,
  updateComponentInputs,
  updateComponentParameters,
} from "$store/component/action";
import { type ComponentElement } from "$store/component/interface";

export function executeInServiceWorker(
  components: ComponentElement[],
  component: ComponentElement,
  handlerScope: string,
  attributeName: string,
  attributeScope?: string
) {
  const handlers = component[handlerScope];
  if (!component.errors) {
    component.errors = {};
  }

  if (handlers[attributeName]) {
    let messageChannel = new MessageChannel();

    messageChannel.port1.onmessage = function (event) {
      
      if (event.data.result) {
        if (attributeScope) {
          if (component[attributeScope][attributeName] !== event.data.result) {
            if (attributeScope === "attributes") {
              updateComponentInputs(component.uuid, {
                [attributeName]: event.data.result,
              });
            } else {
              updateComponentAttributes(component.uuid, {
                [attributeName]: event.data.result,
              });
            }
           
          }
        }
      }
      if (event.data.updatedAttriutes) {
        Object.keys(event.data.updatedAttriutes).forEach(
          (componentId: string, e) => {
             // if (component.uuid === componentId) {
              
                
                //if (component['attributes'][attributeName] !== event.data.updatedAttriutes[componentId][attributeName]) {
                 
                updateComponentAttributes(componentId, {
                    ...event.data.updatedAttriutes[componentId],
                  });
                //}
             // }
             
           
          }
        );
      }

       if(event.data.updatedParameters){
        Object.keys(event.data.updatedParameters).forEach(
          (componentId: string) => {
            
             // if (component.uuid === componentId) {
                updateComponentParameters(componentId, {
                  ...event.data.updatedParameters[componentId],
                });
              //}
          }
        );
       
      }
      if (event.data.error) {
        if (component.errors[attributeName] !== event.data.error) {
          updateComponentError(component.uuid, {
            [attributeName]: event.data.error,
          });
        }
      } else {
        if (component.errors[attributeName] !== undefined) {
          updateComponentError(component.uuid, {
            [attributeName]: undefined,
          });
        }
      }
    };

    const command = "executeFunction";
    if(typeof window !== 'undefined' && typeof window.navigator !== 'undefined'){
 navigator.serviceWorker.controller.postMessage(
      {
        command,
        value: handlers[attributeName],
        components,
        component
      },
      [messageChannel.port2]
    );
    }
   
  }
}
