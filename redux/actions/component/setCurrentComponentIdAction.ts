import { $currentComponentId, $activeSlot } from '../../store/component/store';

export function setCurrentComponentIdAction(componentId: string, slotName?: string) {
  const previousComponentId = $currentComponentId.get();

  $currentComponentId.set(componentId);

  // Only reset activeSlot when selecting a different component
  // If selecting the same component, preserve the slot unless a new one is specified
  if (componentId !== previousComponentId) {
    $activeSlot.set(slotName ?? null);
  } else if (slotName !== undefined) {
    $activeSlot.set(slotName);
  }
}