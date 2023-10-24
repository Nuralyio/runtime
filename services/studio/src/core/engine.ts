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
$componentWithChildrens.subscribe((components: ComponentElement[]) => {
  _components = components;
  /*console.log(esprima);
  const parsed = esprima.parse("eval('const answer = 42')");
  console.log("aaaaa", parsed);
  const generated = escodegen.generate(parsed);
  console.log(generated);*/
  components.forEach((component: ComponentElement) => {
    const { styleHandlers, style } = component;
    Object.keys(styleHandlers).forEach((smartAttributeKey) => {
      executeInServiceWorker(
        components,
        component,
        "styleHandlers",
        smartAttributeKey,
        "style"
      );
    });
  });
});

export function executeEventHandler(
  component: ComponentElement,
  handlerScope: string = "event",
  attributeName: string
) {
  executeInServiceWorker(_components, component, handlerScope, attributeName);
}
