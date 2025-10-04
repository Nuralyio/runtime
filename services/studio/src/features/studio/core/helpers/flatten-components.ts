import { fillComponentChildren } from "@shared/redux/store/component/helper";
import type { ComponentElement } from "@shared/redux/store/component/interface";

export const flattenedComponents = (components: ComponentElement[]) =>
  components.map(component => fillComponentChildren(components, component));