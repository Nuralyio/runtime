import { deletePageHandler } from "$store/handlers/pages/deletePageHandler";
import type { PageElement } from "$store/handlers/pages/interfaces/interface";
import { $applicationPages, $pages } from "$store/page";


export function deletePageAction(page: PageElement) {
  // deletePageHandler(pageId);
  deletePageHandler(page);

  $applicationPages(page.application_id).get()
    
  //deleteComponentAction(pageId, application_id);
}