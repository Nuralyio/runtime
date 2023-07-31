import { atom } from "nanostores";
import { logger } from "@nanostores/logger";

export const $component = atom<any[]>([
  {
    name: "comp1",
    id: "random ids",
  },
]);

export function addComponent(com: any) {
  $component.set([...$component.get(), com]);
}

let destroy = logger({
  Components: $component,
});
