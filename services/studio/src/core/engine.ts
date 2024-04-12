import { $componentWithChildrens } from "$store/component/sotre";
import * as esprima from "esprima";
import * as escodegen from "escodegen";
import { type ComponentElement } from "$store/component/interface";
import {
  updateComponentAttributes,
  updateComponentError,
} from "$store/component/action";
import { executeInServiceWorker } from "./helper";

const styleHandlersCache = {};
let _components: ComponentElement[];
const isServer = typeof window === "undefined";
if (!isServer) {
  $componentWithChildrens.subscribe((components: ComponentElement[]) => {
    _components = components;
    components.forEach((component: ComponentElement) => {
      const { styleHandlers = {}, style = {}, attributesHandlers = {} } = component;
      Object.keys(styleHandlers).forEach((smartAttributeKey) => {
        executeInServiceWorker(
          components,
          component,
          "styleHandlers",
          smartAttributeKey,
          "style"
        );
      });

      Object.keys(attributesHandlers).forEach((smartAttributeKey) => {

        executeInServiceWorker(
          components,
          component,
          "attributesHandlers",
          smartAttributeKey,
          "attributes"
        );
      });


    });
  });
}

export function executeEventHandler(
  component: ComponentElement,
  handlerScope: string = "event",
  attributeName: string
) {
  executeInServiceWorker(_components, component, handlerScope, attributeName);
}

export default {}