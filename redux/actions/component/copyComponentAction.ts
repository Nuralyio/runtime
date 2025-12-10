import { $components } from '../../store/component/store';
import type { ComponentElement } from '../../store/component/component.interface';
import { v4 as uuidv4 } from "uuid";

export function copyComponentAction(componentId: string) {
  const components = $components.get();
  const componentToCopy = components.find((component: ComponentElement) => component.uuid === componentId);

  if (componentToCopy) {
    clipboardComponent = { ...componentToCopy, id: uuidv4() }; // Generate a new ID for the copied component
  }
}