import { atom } from "nanostores";
import { logger } from "@nanostores/logger";
import { v4 as uuidv4 } from "uuid";

export interface ComponentElement {
  id: string;
  name: string;
  childrens: [];
}

export interface PageElement {
  id: string;
  name: string;
  components?: ComponentElement[];
}
export const $pages = atom<PageElement[]>([
  {
    id: uuidv4(),
    name: "Page_1",
  },
]);

export function addPageAction(com: PageElement) {
  $pages.set([...$pages.get(), com]);
}

let destroy = logger({
  Pages: $pages,
});
