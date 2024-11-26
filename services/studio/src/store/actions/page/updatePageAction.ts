import type { PageElement } from "$store/handlers/pages/interfaces/interface.ts";
import { $pages } from "$store/page.ts";
import { setVar } from "$store/context.ts";

export function updatePageAction(page: PageElement, applicationId: string) {
  $pages.set({
    ...$pages.get(),
    [applicationId]: [...($pages.get()[applicationId].map((oldPage) => {
      if (oldPage.uuid == page.uuid) {
        return page;
      }
      return oldPage;

    }) || [])]
  });

  const pages = $pages.get()[applicationId];
  setVar(applicationId, `${applicationId}.appPages`, pages);

}