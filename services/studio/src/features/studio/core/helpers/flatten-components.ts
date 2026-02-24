import { fillComponentChildren } from '@nuraly/runtime/redux/store';
import type { ComponentElement } from '@nuraly/runtime/redux/store';

export const flattenedComponents = (components: ComponentElement[]) =>
  components.map(component => fillComponentChildren(components, component));