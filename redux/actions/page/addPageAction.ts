import type { PageElement } from '../../handlers/pages/page.interface';
import { addPageHandler } from '../../handlers/pages/handler';

/** Actions*/
export function addPageAction(page: PageElement) {
  addPageHandler(page);
}