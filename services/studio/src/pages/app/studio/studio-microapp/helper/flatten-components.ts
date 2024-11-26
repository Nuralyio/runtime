import { fillComponentChildren } from "../helper";
import type { ComponentElement } from "../interface";

export const flattenedComponents = (components: ComponentElement[]) =>
    components.map(component => fillComponentChildren(components, component))