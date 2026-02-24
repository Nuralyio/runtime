import { deletePageHandler } from '../../handlers/pages/deletePageHandler';
import type { PageElement } from '../../handlers/pages/page.interface';
import { $applicationPages } from '../../store/page';


export function deletePageAction(page: PageElement) {
  // deletePageHandler(pageId);
  deletePageHandler(page);

  $applicationPages(page.application_id).get()
    
  //deleteComponentAction(pageId, application_id);
}