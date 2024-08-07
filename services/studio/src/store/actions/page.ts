import { $currentApplication, $resizing } from "$store/apps";
import { addPageHandler } from "../handlers/pages/handler";
import { type PageElement } from "../handlers/pages/interfaces/interface";
import { $contextMenuEvent, $currentPage, $currentPageId, $currentPageViewPort, $pageSize, $pageZoom, $pages, $showBorder } from "../page";
import { updatePageHandler } from "../handlers/pages/handler";
import { getVar, setVar } from "$store/context";

/** Actions*/
export function addPageAction(page: PageElement) {
  addPageHandler(page)
}

// export function updatePageAction(page: PageElement) {
//   const existingPages = $pages.get();
//   const updatedPages = existingPages.map((existingPage) =>
//     existingPage.uuid === page.uuid ? page : existingPage
//   );

//   $pages.set(updatedPages);
// }

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
    $pages.set({
      ...$pages.get(),
      [applicationId]: [...($pages.get()[applicationId] || []), page],
    });

    const pages = $pages.get()[applicationId];
    setVar(applicationId, `${applicationId}.appPages`, pages);

}

export function setCurrentPageAction(pageId: string) {

  $currentPageId("1").set(pageId);
}

export function addComponentToCurrentPageAction(componentId: string) {
  const currentApp = $currentApplication.get();
  const currentAppId = currentApp.uuid;
  const currentPageId = getVar("global", "currentPage").value;

  const currentPages = $pages.get();

  const currentPage = currentPages[currentAppId].find((page: PageElement) => page.uuid === currentPageId);
  if (currentPage) {
    const { component_ids = [] } = currentPage;
    component_ids.push(componentId);
    const updatedPage : PageElement= { ...currentPage, component_ids };
    const updatedPages = {
      ...currentPages,
      [currentAppId]: currentPages[currentAppId].map((page: PageElement) =>
        page.uuid === currentPageId ? updatedPage : page
      ),
    };

    // Set the updated pages to the store
    console.log(updatedPages);
    $pages.set(updatedPages);
    updatePageHandler(updatedPage)
    // Update the page in the handler
    //updatePageHandler(update  dPage);
  }
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


