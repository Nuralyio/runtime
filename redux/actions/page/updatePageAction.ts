import type { PageElement } from '../../handlers/pages/page.interface';
import { $pages } from '../../store/page';
import { setVar } from '../../store/context';

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