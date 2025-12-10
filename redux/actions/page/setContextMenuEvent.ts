import { $contextMenuEvent } from '../../store/page';

export function setContextMenuEvent(e: any) {
  $contextMenuEvent.set(e);
}