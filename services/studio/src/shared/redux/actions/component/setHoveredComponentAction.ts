import { $hoveredComponent } from "@shared/redux/store/component/store";

export function setHoveredComponentAction(component: any) {
  $hoveredComponent.set(component);
}