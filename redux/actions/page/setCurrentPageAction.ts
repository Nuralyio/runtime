import { $currentPageId } from '../../store/page';

export function setCurrentPageAction(pageId: string) {

  $currentPageId("1").set(pageId);
}