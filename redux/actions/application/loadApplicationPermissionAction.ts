import { fetchApplicationPermission } from '../../../../../services';

import { setApplicationPermissionAction } from './setApplicationPermissionAction';

export async function loadApplicationPermissionAction(id: string, resource_id: string) {
  const permission = await fetchApplicationPermission(id, resource_id);
  if (permission.data) {
    setApplicationPermissionAction(permission.data);
  }
}