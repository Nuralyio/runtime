import { $hoveredComponentId } from "@shared/redux/store/component/store";

export function setHoveredComponentIdAction(componentId: string) {
  $hoveredComponentId.set(componentId);
}