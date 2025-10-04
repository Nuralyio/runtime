import { $permissionsState } from "@shared/redux/store/apps";

export function setPermissionMessage(message: string) {
  $permissionsState.set({
    ...$permissionsState.get(),
    message
  });
}