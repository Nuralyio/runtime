import { $permissionsState } from "$store/apps.ts";

export function setPermissionMessage(message: string) {
  $permissionsState.set({
    ...$permissionsState.get(),
    message
  });
}