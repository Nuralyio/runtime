import type { PageElement } from '../../handlers/pages/page.interface';
import { $pages } from '../../store/page';
import { setVar } from '../../store/context';

export function addPageToApplicationAction(page: PageElement, application_id: string) {
  $pages.set({
    ...$pages.get(),
    [application_id]: [page, ...($pages.get()[application_id] || [])]
  });

  const pages = $pages.get()[application_id];
  setVar(application_id, `${application_id}.appPages`, pages);

}