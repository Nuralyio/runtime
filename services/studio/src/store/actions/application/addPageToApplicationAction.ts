import type { PageElement } from "$store/handlers/pages/interfaces/interface.ts";
import { $pages } from "$store/page.ts";
import { setVar } from "$store/context.ts";

export function addPageToApplicationAction(page: PageElement, applicationId: string) {
  $pages.set({
    ...$pages.get(),
    [applicationId]: [page, ...($pages.get()[applicationId] || [])]
  });

  const pages = $pages.get()[applicationId];
  setVar(applicationId, `${applicationId}.appPages`, pages);

}