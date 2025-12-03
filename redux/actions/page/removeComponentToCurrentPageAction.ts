import { $currentApplication } from '../../store/apps';
import { $pages } from '../../store/page';
import type { PageElement } from '../../handlers/pages/page.interface';
import { updatePageHandler } from '../../handlers/pages/handler';
import { ExecuteInstance } from '../../../state/runtime-context';

export function removeComponentToCurrentPageAction(removedComponentId: string) {
  const currentApp :any= $currentApplication.get();
  const currentAppId = currentApp.uuid;
  const currentPageId = ExecuteInstance.Vars.currentPage;

  const currentPages = $pages.get();

  const currentPage = currentPages[currentAppId].find((page: PageElement) => page.uuid === currentPageId);
  if (currentPage) {
    const { component_ids = [] } = currentPage;
    const updatedComponentIds = component_ids.filter(
      (componentId: string) => componentId !== removedComponentId
    );
    const updatedPage: PageElement = { ...currentPage, component_ids: updatedComponentIds };
    const updatedPages = {
      ...currentPages,
      [currentAppId]: currentPages[currentAppId].map((page: PageElement) =>
        page.uuid === currentPageId ? updatedPage : page
      )
    };

    // Set the updated pages to the store
    $pages.set(updatedPages);
    updatePageHandler(updatedPage);
  }
}