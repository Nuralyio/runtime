import { atom, keepMount } from "nanostores";
import { logger } from "@nanostores/logger";
import { persistentAtom } from "@nanostores/persistent";

export const $component = atom<any[]>([
  {
    name: "comp1",
    id: "random ids",
  },
]);



export const $resizing = atom<Boolean>(false);



interface Tab {
  id: string;
  name: string;
  type?: string;
  detail ? : any;
}

export const $editorState = persistentAtom<{ currentTab: any, tabs: Tab[] }>("$editorState", {
  currentTab: {},
  tabs: [{
    id: "0",
    name: "pages",
    type: "page"
  }]
}, {
  encode: JSON.stringify,
  decode: JSON.parse,
});


export function addComponent(com: any) {
  $component.set([...$component.get(), com]);
}


keepMount($resizing)

let destroy = logger({
  Components: $component,
});
