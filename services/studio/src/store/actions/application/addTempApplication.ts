import { $components } from "$store/component/component-sotre.ts";

export function addTempApplication(uuid, components) {
  $components.set({
    ...$components.get(),
    [uuid]: components
  });
}