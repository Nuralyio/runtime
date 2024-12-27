import { $pageZoom } from "$store/page.ts";

export function updatePageZoom(pageZoom: number) {
  $pageZoom.set(String(pageZoom));
}