import { $resizing } from "$store/apps.ts";

export function setResizing(isResizing: boolean) {
  $resizing.set(isResizing);
}