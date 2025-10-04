import { $contextMenuEvent } from "@shared/redux/store/page";

export function setContextMenuEvent(e: any) {
  $contextMenuEvent.set(e);
}