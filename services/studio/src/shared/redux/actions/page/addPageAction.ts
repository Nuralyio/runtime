import type { PageElement } from "@shared/redux/handlers/pages/page.interface";
import { addPageHandler } from "@shared/redux/handlers/pages/handler";

/** Actions*/
export function addPageAction(page: PageElement) {
  addPageHandler(page);
}