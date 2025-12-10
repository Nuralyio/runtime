import { $permissionsState } from '../../store/apps';

export function resetPermissionMessage() {
  $permissionsState.set({
    ...$permissionsState.get(),
    message: ""
  });
}