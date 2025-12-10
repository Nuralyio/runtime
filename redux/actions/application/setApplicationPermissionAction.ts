import { $applicationPermission } from '../../store/apps';

export function setApplicationPermissionAction(permission: any) {

  $applicationPermission.set(permission);
}