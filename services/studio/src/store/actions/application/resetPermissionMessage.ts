import { $permissionsState } from "$store/apps.ts";

export function resetPermissionMessage() {
  $permissionsState.set({
    ...$permissionsState.get(),
    message: ""
  });
}