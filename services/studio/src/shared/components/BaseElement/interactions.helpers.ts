// interactions.helpers.ts
import { setHoveredComponentAction } from "$store/actions/component/setHoveredComponentAction.ts";

export function handleMouseEnter(
  isViewMode: boolean,
  component: any
) {
  if (!isViewMode) setHoveredComponentAction(component);
}

export function handleMouseLeave(isViewMode: boolean) {
  if (!isViewMode) setHoveredComponentAction(null);
}

