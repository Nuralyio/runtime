import { $currentApplication } from "@shared/redux/store/apps";
import { $pages } from "@shared/redux/store/page";
import type { PageElement } from "@shared/redux/handlers/pages/page.interface";
import { updatePageHandler } from "@shared/redux/handlers/pages/handler";
import { ExecuteInstance } from "@runtime/Kernel";

export function addComponentToCurrentPageAction(componentId: string) {
  const currentApp = $currentApplication.get();
  const currentAppId = currentApp.uuid;
  const currentPageId = ExecuteInstance.Vars.currentPage;

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
    updatePageHandler(updatedPage, (page: any) => {});
    // Update the page in the handler
    //updatePageHandler(update  dPage);
  }
}