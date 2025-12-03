import { $permissionsState } from '../../store/apps';

export function setPermissionMessage(message: string) {
  $permissionsState.set({
    ...$permissionsState.get(),
    message
  });
}