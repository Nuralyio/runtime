import {
  updateComponent,
  updateComponentAttributes,
  updateComponentError,
} from "$store/component/action";
import { ComponentElement } from "$store/component/interface";

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
      console.log(event);
      if (event.data.result) {
        if (attributeScope) {
          if (component[attributeScope][attributeName] !== event.data.result) {
            updateComponentAttributes(component.id, {
              [attributeName]: event.data.result,
            });
          }
        }
      }
      if (event.data.updatedAttriutes) {
        Object.keys(event.data.updatedAttriutes).forEach(
          (componentId: string) => {
            console.log(event.data.updatedAttriutes[componentId]);
            updateComponentAttributes(componentId, {
              ...event.data.updatedAttriutes[componentId],
            });
          }
        );
      }
      if (event.data.error) {
        if (component.errors[attributeName] !== event.data.error) {
          updateComponentError(component.id, {
            [attributeName]: event.data.error,
          });
        }
      } else {
        if (component.errors[attributeName] !== undefined) {
          updateComponentError(component.id, {
            [attributeName]: undefined,
          });
        }
      }
    };

    const command = "executeFunction";

    navigator.serviceWorker.controller.postMessage(
      {
        command,
        value: handlers[attributeName],
        components,
      },
      [messageChannel.port2]
    );
  }
}
