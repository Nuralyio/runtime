import { $currentComponentId } from '../../store/component/store';

export function setCurrentComponentIdAction(componentId: string) {
  $currentComponentId.set(componentId);
  
}