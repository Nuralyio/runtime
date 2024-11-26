import { fillComponentChildren } from "$store/component/helper.ts";
import type { ComponentElement } from "$store/component/interface.ts";

export const flattenedComponents = (components: ComponentElement[]) =>
    components.map(component => fillComponentChildren(components, component))