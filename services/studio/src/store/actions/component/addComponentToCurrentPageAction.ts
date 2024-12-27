import { $currentApplication } from "$store/apps.ts";
import { getVar } from "$store/context.ts";
import { $pages } from "$store/page.ts";
import type { PageElement } from "$store/handlers/pages/interfaces/interface.ts";
import { updatePageHandler } from "$store/handlers/pages/handler.ts";

export function addComponentToCurrentPageAction(componentId: string) {
  const currentApp = $currentApplication.get();
  const currentAppId = currentApp.uuid;
  const currentPageId = getVar("global", "currentPage").value;

  const currentPages = $pages.get();

  const currentPage = currentPages[currentAppId].find((page: PageElement) => page.uuid === currentPageId);
  if (currentPage) {
    const { component_ids = [] } = currentPage;
    component_ids.push(componentId);
    const updatedPage: PageElement = { ...currentPage, component_ids };
    const updatedPages = {
      ...currentPages,
      [currentAppId]: currentPages[currentAppId].map((page: PageElement) =>
        page.uuid === currentPageId ? updatedPage : page
      )
    };

    // Set the updated pages to the store
    $pages.set(updatedPages);
    updatePageHandler(updatedPage);
    // Update the page in the handler
    //updatePageHandler(update  dPage);
  }
}