import { APIS_URL } from "../constants";
import { MemberResponse } from "./fetch-members";

export interface InviteMemberDto {
  email?: string;
  userId?: string;
  roleId: number;
}

export interface PendingInviteResponse {
  id: number;
  email: string;
  applicationId: string;
  role: {
    id: number;
    name: string;
    displayName: string;
    hierarchy: number;
  };
  expiresAt: string;
  createdAt: string;
}

export type InviteResult =
  | { status: 'accepted'; member: MemberResponse }
  | { status: 'pending'; invite: PendingInviteResponse };

/**
 * Invite a user to an application with a specific role.
 * If user doesn't exist, creates a pending invite.
 */
export async function inviteMember(
  appId: string,
  dto: InviteMemberDto
): Promise<{
  status: string;
  data?: InviteResult;
  error?: any;
}> {
  try {
    const response = await fetch(APIS_URL.inviteMember(appId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to invite member: ${response.statusText}`);
    }

    const data = await response.json();
    return { status: "OK", data };
  } catch (error) {
    return { status: "ERROR", error };
  }
}

/**
 * Update a member's role
 */
export async function updateMemberRole(
  appId: string,
  userId: string,
  roleId: number
): Promise<{
  status: string;
  data?: MemberResponse;
  error?: any;
}> {
  try {
    const response = await fetch(APIS_URL.updateMember(appId, userId), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ roleId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update member: ${response.statusText}`);
    }

    const data = await response.json();
    return { status: "OK", data };
  } catch (error) {
    return { status: "ERROR", error };
  }
}

/**
 * Remove a member from an application
 */
export async function removeMember(
  appId: string,
  userId: string
): Promise<{
  status: string;
  data?: { success: boolean; message: string };
  error?: any;
}> {
  try {
    const response = await fetch(APIS_URL.removeMember(appId, userId), {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to remove member: ${response.statusText}`);
    }

    const data = await response.json();
    return { status: "OK", data };
  } catch (error) {
    return { status: "ERROR", error };
  }
}
