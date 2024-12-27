import type { DraggingComponentInfo } from "$store/component/interface.ts";
import { $draggingComponentInfo } from "$store/component/store.ts";

export function setDraggingComponentInfo(
  draggingComponentInfo: DraggingComponentInfo | null
) {
  if (draggingComponentInfo) {
    $draggingComponentInfo.set({
      ...draggingComponentInfo
    });
  } else {
    $draggingComponentInfo.set(null);
  }
}