import { $hoveredComponent } from "$store/component/store.ts";

export function setHoveredComponentAction(component: any) {
  $hoveredComponent.set(component);
}