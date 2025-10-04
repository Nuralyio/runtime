import { $applicationPermission } from "@shared/redux/store/apps";

export function setApplicationPermissionAction(permission: any) {

  $applicationPermission.set(permission);
}