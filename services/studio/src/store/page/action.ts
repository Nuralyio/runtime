import { $resizing } from "$store/apps";
import { PageElement } from "./interface";
import { $contextMenuEvent, $currentPage, $currentPageId, $pageZoom, $pages, $showBorder } from "./store";

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


export function updatePageStyleAttributes(pageId: string, style: any) {
  $pages.set([
    ...$pages.get().map((page: PageElement) => {
      if (page.id === pageId) {
        page = { ...page, style };
      }
      return page;
    }),
  ]);
}

export function removeComponentToCurrentPageAction(removedComponentId: string) {
  $pages.set([
    ...$pages.get().map((page: PageElement) => {
      if (page.id === $currentPage.get().id) {
        let { componentIds = [] } = page;
        componentIds = componentIds.filter(
          (componentId: string) => componentId !== removedComponentId
        );
        page = { ...page, componentIds };
      }
      return page;
    }),
  ]);
}



export function updatePageZoom(pageZoom: number) {
  $pageZoom.set(String(pageZoom));
}





export function setShowBorder(showBorder: boolean) {
  $showBorder.set(showBorder);
}

export function setContextMenuEvent(e: any) {
  $contextMenuEvent.set(e);
}





export function setResizing(isResizing: boolean) {
  $resizing.set(isResizing);
}
