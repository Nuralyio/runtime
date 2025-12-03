import { $components } from '../../store/component/store';

export function addTempApplication(uuid, components) {
  $components.set({
    ...$components.get(),
    [uuid]: components
  });
}