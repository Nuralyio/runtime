import { $hoveredComponent } from '../../store/component/store';

export function setHoveredComponentAction(component: any) {
  $hoveredComponent.set(component);
}