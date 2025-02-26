import { $currentComponentId } from "$store/component/store.ts";

export function setCurrentComponentIdAction(componentId: string) {
  $currentComponentId.set(componentId);
  
}