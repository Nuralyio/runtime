import { $contextMenuEvent } from "$store/page.ts";

export function setContextMenuEvent(e: any) {
  $contextMenuEvent.set(e);
}