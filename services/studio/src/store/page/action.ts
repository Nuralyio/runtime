import { $resizing } from "$store/apps";
import { addPageHandler } from "./handler";
import { type PageElement } from "./interface";
import { $contextMenuEvent, $currentPage, $currentPageId, $currentPageViewPort, $pageSize, $pageZoom, $pages, $showBorder } from "./store";
import { updatePageHandler } from "./handler";
import { setVar } from "$store/context/store";

/** Actions*/
export function addPageAction(page: PageElement) {
  addPageHandler(page)
}

export function updatePageAction(page: PageElement) {
  const existingPages = $pages.get();
  const updatedPages = existingPages.map((existingPage) =>
    existingPage.uuid === page.uuid ? page : existingPage
  );

  $pages.set(updatedPages);
}

/**
 * 
 * using this 
 * interface PageStore {
  [key: string]: PageElement[];
}

export const $pages = atom<PageStore>(initialState);
export const $resetPageStore = () => { };

 */ 

export function addPageToApplicationAction(page: PageElement,applicationId: string) {
console.log('addPageToApplicationAction',page,applicationId)
/**
 * 
 * using this 
 * interface PageStore {
  [key: string]: PageElement[];
}
 */
  // add page to application object use this 
  // interface PageStore {
//   [key: string]: PageElement[];
// }
  
    $pages.set({
      ...$pages.get(),
      [applicationId]: [...($pages.get()[applicationId] || []), page],
    });

    const pages = $pages.get()[window.applicationResponse.uuid];
    console.log('pages: ', pages,  `${window.applicationResponse.uuid}.appPages`);
    setVar(window.applicationResponse.uuid, `${window.applicationResponse.uuid}.appPages`, pages);

}

export function setCurrentPageAction(pageId: string) {

  $currentPageId("1").set(pageId);
}

export function addComponentToCurrentPageAction(componentId: string) {
  $pages.set([
    ...$pages.get().map((page: PageElement) => {
      if (page.uuid === $currentPage.get().uuid) {
        const { component_ids = [] } = page;
        component_ids.push(componentId);
        page = { ...page, component_ids };
      }
      return page;
    }),
  ]);

  updatePageHandler($currentPage.get());  
}


export function updatePageStyleAttributes(pageId: string, style: any) {
  $pages.set([
    ...$pages.get().map((page: PageElement) => {
      if (page.uuid === pageId) {
        page = { ...page, style };
      }
      return page;
    }),
  ]);
}

export function removeComponentToCurrentPageAction(removedComponentId: string) {
  $pages.set([
    ...$pages.get().map((page: PageElement) => {
      if (page.uuid === $currentPage.get().uuid) {
        let { component_ids = [] } = page;
        component_ids = component_ids.filter(
          (componentId: string) => componentId !== removedComponentId
        );
        page = { ...page, component_ids };
      }
      return page;
    }),
  ]);
}



export function updatePageZoom(pageZoom: number) {
  $pageZoom.set(String(pageZoom));
}



export function setCurrentPageViewPort(viewPort: string) {
  $currentPageViewPort.set(viewPort);
}


export function updatePageInfo(pageInfo: any) {
  $pageSize.set(pageInfo);
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


