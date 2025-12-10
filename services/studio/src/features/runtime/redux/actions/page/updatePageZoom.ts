import { $pageZoom } from '../../store/page';

export function updatePageZoom(pageZoom: number) {
  $pageZoom.set(String(pageZoom));
}