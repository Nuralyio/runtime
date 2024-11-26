import { fetchApplicationPermission } from "$services/applications.service.ts";

import { setApplicationPermissionAction } from "$store/actions/application/setApplicationPermissionAction.ts";

export async function loadApplicationPermissionAction(id: string, resource_id: string) {
  const permission = await fetchApplicationPermission(id, resource_id);
  if (permission.data) {
    setApplicationPermissionAction(permission.data);
  }
}