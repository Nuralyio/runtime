import type { PageElement } from "$store/handlers/pages/interfaces/interface.ts";
import { $pages } from "$store/page.ts";
import { setVar } from "$store/context.ts";

export function addPageToApplicationAction(page: PageElement, application_id: string) {
  $pages.set({
    ...$pages.get(),
    [application_id]: [page, ...($pages.get()[application_id] || [])]
  });

  const pages = $pages.get()[application_id];
  setVar(application_id, `${application_id}.appPages`, pages);

}