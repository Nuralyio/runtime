import { deletePageHandler } from "@shared/redux/handlers/pages/deletePageHandler";
import type { PageElement } from "@shared/redux/handlers/pages/page.interface";
import { $applicationPages } from "@shared/redux/store/page";


export function deletePageAction(page: PageElement) {
  // deletePageHandler(pageId);
  deletePageHandler(page);

  $applicationPages(page.application_id).get()
    
  //deleteComponentAction(pageId, application_id);
}