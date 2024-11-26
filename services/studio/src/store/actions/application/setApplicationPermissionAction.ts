import { $applicationPermission } from "$store/apps.ts";

export function setApplicationPermissionAction(permission: any) {

  $applicationPermission.set(permission);
}