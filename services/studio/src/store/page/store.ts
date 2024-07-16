import { atom, computed, keepMount } from "nanostores";
import { persistentAtom } from "@nanostores/persistent";
import { type PageElement } from "./interface";
import { setVar } from "$store/context/store";

/**
 * Pages stores
 */
const isServer = typeof window === 'undefined';
const initialAppState = isServer ? [] : JSON.parse(window['__INITIAL_CURRENT_APPLICATION_STATE__'] ?? null);
const initialState = isServer ? {} : { [initialAppState.uuid]: JSON.parse(window['__INITIAL_PAGE_STATE__'] ?? []) };

//
interface PageStore {
  [key: string]: PageElement[];
}

export const $pages = atom<PageStore>(initialState);
export const $resetPageStore = () => { };

// Persistent atom for currentPageId per application
export const $currentPageId = ($applicationId: string) => persistentAtom<string>(
  `page_id_${$applicationId}`,
  null,
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
);

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
 * Selector for pages of a specific application
 */
export const $applicationPages = ($applicationId: string) => computed(
  [$pages],
  (pagesStore: PageStore) => {
    return pagesStore[$applicationId] || [];
  }
);

/**
 * Computed store for the current page within a specific application
 */
export const $currentPage = ($applicationId: string, currentPageId :string) => computed(
  [$applicationPages($applicationId)],
  (pages) => {
    const currentPage = pages.find((page) => {
      return page.uuid === currentPageId;
    });
    if (!currentPage && pages.length > 0) {
      return pages[0];
    }
    return currentPage;
  }
);


if (!isServer) {
  setTimeout (() => {
    const pages = $applicationPages(window.applicationResponse.uuid).get();
  setVar(window.applicationResponse.uuid, `${window.applicationResponse.uuid}.appPages`, pages);
   }
  , 100);
 
}
/*
logger({
  pages: $pages,
  pageSize: $pageSize
});
*/