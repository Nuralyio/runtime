import { $currentPageViewPort } from "@shared/redux/store/page";

export function setCurrentPageViewPort(viewPort: string) {
  $currentPageViewPort.set(viewPort);
}