import { $hoveredComponentId } from "$store/component/store.ts";

export function setHoveredComponentIdAction(componentId: string) {
  $hoveredComponentId.set(componentId);
}