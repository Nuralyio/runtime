import { $currentPageViewPort } from "$store/page.ts";

export function setCurrentPageViewPort(viewPort: string) {
  $currentPageViewPort.set(viewPort);
}