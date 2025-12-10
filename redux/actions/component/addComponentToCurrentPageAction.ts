import { $currentApplication } from '../../store/apps';
import { $pages } from '../../store/page';
import type { PageElement } from '../../handlers/pages/page.interface';
import { updatePageHandler } from '../../handlers/pages/handler';
import { ExecuteInstance } from '../../../state/runtime-context';

export function addComponentToCurrentPageAction(componentId: string) {
  const currentApp: any = $currentApplication.get();
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