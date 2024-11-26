import type { PageElement } from "$store/handlers/pages/interfaces/interface.ts";
import { addPageHandler } from "$store/handlers/pages/handler.ts";

/** Actions*/
export function addPageAction(page: PageElement) {
  addPageHandler(page);
}