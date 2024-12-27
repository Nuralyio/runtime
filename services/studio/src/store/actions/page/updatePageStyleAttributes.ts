import { $pages } from "$store/page.ts";
import type { PageElement } from "$store/handlers/pages/interfaces/interface.ts";

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