import { atom, computed, keepMount, onMount } from "nanostores";
import { persistentAtom } from "@nanostores/persistent";

import { logger } from "@nanostores/logger";
import { type PageElement } from "./interface";


/**
 * Pages stores
 */
const isServer = typeof window === 'undefined';
const initialState = isServer ? [] : JSON.parse(window['__INITIAL_PAGE_STATE__'] ?? []);
export const $pages = atom<any[]>(initialState );

export const $currentPageId = persistentAtom<string>("page_id", null, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export const $currentPageViewPort = persistentAtom<string>("current_page_view_port", "", {
  encode: JSON.stringify,
  decode: JSON.parse,
});




export const $pageZoom = persistentAtom<string>("page_zoom", "95", {
  encode: JSON.stringify,
  decode: JSON.parse,
});



export const $pageSize = persistentAtom<any>("page_info", {}, {
  encode: JSON.stringify,
  decode: JSON.parse,
});



export const $showBorder = persistentAtom<boolean>("show_border", false, {
  encode: JSON.stringify,
  decode: JSON.parse,
});
export const $contextMenuEvent = persistentAtom<object>("context_menu_event", {}, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

/**
 * End
 */

export const $currentPage = computed(
  [$pages, $currentPageId],
  (pages, currentPageId) => {
    const currentPage =pages.find((page) => {
      return page.uuid === currentPageId;
    });
    if(!currentPage && pages.length > 0){
      return pages[0];
    }
    return currentPage;
   
  }
);

$pages.subscribe((pages) => {
  if (!$currentPageId.get() && pages[0]) {
    $currentPageId.set(pages[0].id);
  }
});
/*
logger({
  pages: $pages,
  pageSize : $pageSize
});
*/