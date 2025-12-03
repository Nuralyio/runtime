import type { ComponentElement } from "./component.interface";


/**
 * Fills the `childrens` property of a component based on its `childrenIds` while preserving the original order.
 * @param components - Array of all components in the application.
 * @param component - The component whose `childrens` property is to be filled.
 * @returns The updated component with `childrens` populated.
 */
export const fillComponentChildren = (
  components: ComponentElement[],
  component: ComponentElement
): ComponentElement => {
  // Create a map for quick lookup of components by their UUID
  const componentMap = new Map(components.map(comp => [comp.uuid, comp]));

  // Stack to process components iteratively
  const stack: ComponentElement[] = [component];

  // Process the stack until all components have been visited
  while (stack.length > 0) {
    const currentComponent = stack.pop();

    // Ensure the `childrens` array is initialized
    if (!currentComponent.childrens) currentComponent.childrens = [];

    // Populate `childrens` based on `childrenIds`, preserving the original order
    if (currentComponent.childrenIds) {
      currentComponent.childrens = currentComponent.childrenIds
        .map((childId: string) => componentMap.get(childId)) // Map each childId to its corresponding component
        .filter(Boolean); // Remove any undefined components due to invalid IDs

      // Push all valid children onto the stack for further processing
      stack.push(...currentComponent.childrens);
    }
  }

  return component;
};
export const fillApplicationComponents = (components: ComponentElement[]) =>
  components.map(component => fillComponentChildren(components, component));

export const extractChildresIds = (components: ComponentElement[]) =>
  components.map(component => fillComponentChildren(components, component));




/**
 * Recursively extracts all child component IDs from a given component.
 * @param components - Array of all components in the application.
 * @param component - The component whose child IDs need to be extracted.
 * @returns An array of all child component IDs.
 */
export const extractAllChildrenIds = (
  components: ComponentElement[],
  component: ComponentElement
): string[] => {
  const componentMap = new Map(components.map(comp => [comp.uuid, comp]));

  const result: string[] = [];
  const stack: ComponentElement[] = [component];

  while (stack.length > 0) {
    const current = stack.pop();

    if (current?.childrenIds) {
      result.push(...current.childrenIds);

      // Add valid children to the stack for further traversal
      stack.push(...current.childrenIds
        .map(childId => componentMap.get(childId))
        .filter(Boolean) as ComponentElement[]);
    }
  }

  return result;
};