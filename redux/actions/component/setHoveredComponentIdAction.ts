import { $hoveredComponentId } from '../../store/component/store';

export function setHoveredComponentIdAction(componentId: string) {
  $hoveredComponentId.set(componentId);
}