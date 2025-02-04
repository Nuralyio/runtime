import type { PageElement } from "$store/handlers/pages/interfaces/interface.ts";
import { $pages } from "$store/page.ts";
import { setVar } from "$store/context.ts";

export function updatePageAction(page: PageElement, application_id: string) {
  $pages.set({
    ...$pages.get(),
    [application_id]: [...($pages.get()[application_id].map((oldPage) => {
      if (oldPage.uuid == page.uuid) {
        return page;
      }
      return oldPage;

    }) || [])]
  });

  const pages = $pages.get()[application_id];
  setVar(application_id, `${application_id}.appPages`, pages);

}