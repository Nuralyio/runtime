import { type ComponentElement, ComponentType } from "$store/component/interface";
import { $components } from "$store/component/sotre";

export const GenerateName = (componentType: ComponentType) => {
  return `${componentType}_${
    $components
      .get()
      .filter((component: ComponentElement) => component.component_type === componentType)
      .length
  }`;
};
