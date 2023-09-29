import { atom, keepMount } from "nanostores";
import { logger } from "@nanostores/logger";

export const $component = atom<any[]>([
  {
    name: "comp1",
    id: "random ids",
  },
]);



export const $resizing = atom<Boolean>(false);

export function addComponent(com: any) {
  $component.set([...$component.get(), com]);
}


keepMount($resizing)

let destroy = logger({
  Components: $component,
});
