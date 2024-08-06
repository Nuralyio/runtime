import type { ComponentElement } from "./interface";

// Helper function to iteratively fill component children
export const fillComponentChildren = (
  components: ComponentElement[],
  component: ComponentElement
): ComponentElement => {
  const componentMap = new Map(components.map(comp => [comp.uuid, comp]));
  const stack: ComponentElement[] = [component];

  while (stack.length > 0) {
    const currentComponent = stack.pop();

    if (!currentComponent.childrens) currentComponent.childrens = [];

    if (currentComponent.childrenIds) {
      currentComponent.childrens = currentComponent.childrenIds
        .map((componentChildId: string) => componentMap.get(componentChildId))
        .filter(Boolean);

      stack.push(...currentComponent.childrens);
    }
  }

  return component;
};