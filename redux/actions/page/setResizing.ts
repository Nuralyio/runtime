import { $resizing } from '../../store/apps';

export function setResizing(isResizing: boolean) {
  $resizing.set(isResizing);
}