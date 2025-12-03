import { fillComponentChildren } from '../../../runtime/redux/store/component/helper';
import type { ComponentElement } from '../../../runtime/redux/store/component/component.interface';

export const flattenedComponents = (components: ComponentElement[]) =>
  components.map(component => fillComponentChildren(components, component));