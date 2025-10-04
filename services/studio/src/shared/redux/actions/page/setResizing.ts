import { $resizing } from "@shared/redux/store/apps";

export function setResizing(isResizing: boolean) {
  $resizing.set(isResizing);
}