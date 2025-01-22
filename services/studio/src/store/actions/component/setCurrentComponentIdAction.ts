import { $currentComponentId } from "$store/component/store.ts";

export function setCurrentComponentIdAction(componentId: string) {
  console.log('componentId', componentId)
  $currentComponentId.set(componentId);
}