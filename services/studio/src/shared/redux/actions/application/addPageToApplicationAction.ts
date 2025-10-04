import type { PageElement } from "@shared/redux/handlers/pages/interfaces/interface";
import { $pages } from "@shared/redux/store/page";
import { setVar } from "@shared/redux/store/context";

export function addPageToApplicationAction(page: PageElement, application_id: string) {
  $pages.set({
    ...$pages.get(),
    [application_id]: [page, ...($pages.get()[application_id] || [])]
  });

  const pages = $pages.get()[application_id];
  setVar(application_id, `${application_id}.appPages`, pages);

}