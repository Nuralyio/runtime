import { $currentPageId } from "@shared/redux/store/page";

export function setCurrentPageAction(pageId: string) {

  $currentPageId("1").set(pageId);
}