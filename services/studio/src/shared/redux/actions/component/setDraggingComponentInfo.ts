import type { DraggingComponentInfo } from "@shared/redux/store/component/interface";
import { $draggingComponentInfo } from "@shared/redux/store/component/store";

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