import { $components } from "@shared/redux/store/component/store";

export function addTempApplication(uuid, components) {
  $components.set({
    ...$components.get(),
    [uuid]: components
  });
}