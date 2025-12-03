import type { DraggingComponentInfo } from '../../store/component/component.interface';
import { $draggingComponentInfo } from '../../store/component/store';

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