import { $pages } from '../../store/page';
import type { PageElement } from '../../handlers/pages/page.interface';

export function updatePageStyleAttributes(pageId: string, style: any) {
  $pages.set([
    ...$pages.get().map((page: PageElement) => {
      if (page.uuid === pageId) {
        page = { ...page, style };
      }
      return page;
    })
  ]);
}