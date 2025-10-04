import { $permissionsState } from "@shared/redux/store/apps";

export function resetPermissionMessage() {
  $permissionsState.set({
    ...$permissionsState.get(),
    message: ""
  });
}