import { APIS_URL } from "../constants";

export interface RoleResponse {
  id: number;
  name: string;
  displayName: string;
  description: string | null;
  permissions: string[];
  hierarchy: number;
  isSystem: boolean;
  applicationId: string | null;
}

/**
 * Fetch all roles for an application (system + custom)
 */
export async function fetchApplicationRoles(appId: string): Promise<{
  status: string;
  data?: RoleResponse[];
  error?: any;
}> {
  try {
    const response = await fetch(APIS_URL.getApplicationRoles(appId), {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch roles: ${response.statusText}`);
    }

    const data = await response.json();
    return { status: "OK", data };
  } catch (error) {
    return { status: "ERROR", error };
  }
}

/**
 * Fetch system roles (owner, admin, editor, viewer)
 */
export async function fetchSystemRoles(): Promise<{
  status: string;
  data?: RoleResponse[];
  error?: any;
}> {
  try {
    const response = await fetch(APIS_URL.getSystemRoles(), {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch system roles: ${response.statusText}`);
    }

    const data = await response.json();
    return { status: "OK", data };
  } catch (error) {
    return { status: "ERROR", error };
  }
}
