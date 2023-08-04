import { ComponentElement, ComponentType } from "$store/component/interface";
import { $components } from "$store/component/sotre";

export const GenerateName = (componentType: ComponentType) => {
  return `${componentType}_${
    $components
      .get()
      .filter((component: ComponentElement) => component.type === componentType)
      .length
  }`;
};
