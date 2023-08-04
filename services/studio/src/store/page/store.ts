import { computed, keepMount, onMount } from "nanostores";
import { persistentAtom } from "@nanostores/persistent";

import { logger } from "@nanostores/logger";
import { PageElement } from "./interface";
import { $componentWithChildrens } from "$store/component/sotre";
import { ComponentElement } from "$store/component/interface";

/**
 * Pages stores
 */
export const $pages = persistentAtom<PageElement[]>("pages", [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export const $currentPageId = persistentAtom<string>("page_id", null, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

/**
 * End
 */

export const $currentPage = computed(
  [$pages, $currentPageId],
  (pages, currentPageId) => {
    return pages.find((page) => {
      return page.id === currentPageId;
    });
  }
);

$pages.subscribe((pages) => {
  if (!$currentPageId.get() && pages[0]) {
    $currentPageId.set(pages[0].id);
  }
});
