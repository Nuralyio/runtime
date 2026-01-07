import { APIS_URL } from "../constants";
import { RoleResponse } from "./fetch-roles";

export interface CreateRoleDto {
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
  hierarchy: number;
}

export interface UpdateRoleDto {
  displayName?: string;
  description?: string;
  permissions?: string[];
  hierarchy?: number;
}

/**
 * Create a custom role for an application
 */
export async function createRole(
  appId: string,
  dto: CreateRoleDto
): Promise<{
  status: string;
  data?: RoleResponse;
  error?: any;
}> {
  try {
    const response = await fetch(APIS_URL.createRole(appId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create role: ${response.statusText}`);
    }

    const data = await response.json();
    return { status: "OK", data };
  } catch (error) {
    return { status: "ERROR", error };
  }
}

/**
 * Update a custom role
 */
export async function updateRole(
  appId: string,
  roleId: number,
  dto: UpdateRoleDto
): Promise<{
  status: string;
  data?: RoleResponse;
  error?: any;
}> {
  try {
    const response = await fetch(APIS_URL.updateRole(appId, roleId), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update role: ${response.statusText}`);
    }

    const data = await response.json();
    return { status: "OK", data };
  } catch (error) {
    return { status: "ERROR", error };
  }
}

/**
 * Delete a custom role
 */
export async function deleteRole(
  appId: string,
  roleId: number
): Promise<{
  status: string;
  data?: { success: boolean; message: string };
  error?: any;
}> {
  try {
    const response = await fetch(APIS_URL.deleteRole(appId, roleId), {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete role: ${response.statusText}`);
    }

    const data = await response.json();
    return { status: "OK", data };
  } catch (error) {
    return { status: "ERROR", error };
  }
}
