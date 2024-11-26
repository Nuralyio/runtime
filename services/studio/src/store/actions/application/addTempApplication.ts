import { $components } from "$store/component/store.ts";

export function addTempApplication(uuid, components) {
  $components.set({
    ...$components.get(),
    [uuid]: components
  });
}