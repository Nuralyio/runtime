import { PageElement } from "./interface";
import { $currentPage, $currentPageId, $pages } from "./store";

/** Actions*/
export function addPageAction(com: PageElement) {
  $pages.set([...$pages.get(), com]);
}

export function setCurrentPageAction(pageId: string) {
  $currentPageId.set(pageId);
}

export function addComponentToCurrentPageAction(componentId: string) {
  $pages.set([
    ...$pages.get().map((page: PageElement) => {
      if (page.id === $currentPage.get().id) {
        const { componentIds = [] } = page;
        componentIds.push(componentId);
        page = { ...page, componentIds };
      }
      return page;
    }),
  ]);
}
