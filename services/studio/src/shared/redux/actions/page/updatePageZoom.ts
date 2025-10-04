import { $pageZoom } from "@shared/redux/store/page";

export function updatePageZoom(pageZoom: number) {
  $pageZoom.set(String(pageZoom));
}