import { $pages } from "@shared/redux/store/page";
import type { PageElement } from "@shared/redux/handlers/pages/interfaces/interface";

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