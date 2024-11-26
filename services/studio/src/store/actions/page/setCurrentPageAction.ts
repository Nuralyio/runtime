import { $currentPageId } from "$store/page.ts";

export function setCurrentPageAction(pageId: string) {

  $currentPageId("1").set(pageId);
}