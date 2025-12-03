import { atom, computed, deepMap, onMount, onNotify } from "nanostores";
import { persistentAtom } from "@nanostores/persistent";
import { type PageElement } from "../handlers/pages/page.interface";
import { setVar } from './context';
import { ExecuteInstance } from '../../state/runtime-context';

/**
 * Pages stores
 */
const isServer = typeof window === "undefined";
const initialAppState = isServer
  ? []
  : JSON.parse(window["__INITIAL_CURRENT_APPLICATION_STATE__"] ?? null);
const initialState = {};
if (initialAppState && !isServer) {
  initialState[initialAppState.uuid] = JSON.parse(
    window["__INITIAL_PAGE_STATE__"] ?? [],
  );
}

//
interface PageStore {
  [key: string]: PageElement[];
}

export const $pages = atom<PageStore>(initialState);
export const $microAppCurrentPage = deepMap<any>({});

export const $resetPageStore = () => {};

// Persistent atom for currentPageId per application
export const $currentPageId = ($application_id: string) =>
  persistentAtom<string>(`page_id_${$application_id}`, null, {
    encode: JSON.stringify,
    decode: JSON.parse,
  });

export const $currentPageViewPort = persistentAtom<string>(
  "current_page_view_port",
  "",
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  },
);

export const $pageZoom = atom<string>("99");

export const $pageSize = persistentAtom<any>(
  "page_info",
  {},
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  },
);

export const $showBorder = persistentAtom<boolean>("show_border", false, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export const $contextMenuEvent = atom<object>();

/**
 * Selector for pages of a specific application
 */
export const $applicationPages = ($application_id: string) =>
  computed([$pages], (pagesStore: PageStore) => {
    return pagesStore[$application_id] || [];
  });

/**
 * Computed store for the current page within a specific application
 */
export const $currentPage = ($application_id: string, currentPageId: string) =>
  computed([$applicationPages($application_id)], (pages) => {
    // SSR guard: ensure pages is an array
    if (!Array.isArray(pages)) {
      return undefined;
    }

    const currentPage = pages.find((page) => {
      return page.uuid === currentPageId;
    });
    if (!currentPage && pages.length > 0) {
      return pages[0];
    }
    return currentPage;
  });
export const refreshPageStoreVar = () => {
  const pagesStore = $pages.get();
  Object.keys(pagesStore).forEach((key) => {
    setVar(key, `${key}.appPages`, pagesStore[key]);
    ExecuteInstance.VarsProxy[`${key}.appPages`] = pagesStore[key];
  });
};

onMount($pages, () => {
  refreshPageStoreVar();
});

onNotify($pages, () => {
  refreshPageStoreVar();
});
