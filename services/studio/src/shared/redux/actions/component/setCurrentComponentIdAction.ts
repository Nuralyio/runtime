import { $currentComponentId } from "@shared/redux/store/component/store";

export function setCurrentComponentIdAction(componentId: string) {
  $currentComponentId.set(componentId);
  
}