import { APIS_URL } from "../constants";
import { PendingInviteResponse } from "./invite-member";

/**
 * Fetch all pending invites for an application
 */
export async function fetchPendingInvites(appId: string): Promise<{
  status: string;
  data?: PendingInviteResponse[];
  error?: any;
}> {
  try {
    const response = await fetch(APIS_URL.getPendingInvites(appId), {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch pending invites: ${response.statusText}`);
    }

    const data = await response.json();
    return { status: "OK", data };
  } catch (error) {
    return { status: "ERROR", error };
  }
}

/**
 * Cancel a pending invite
 */
export async function cancelPendingInvite(
  appId: string,
  inviteId: number
): Promise<{
  status: string;
  data?: { success: boolean; message: string };
  error?: any;
}> {
  try {
    const response = await fetch(APIS_URL.cancelPendingInvite(appId, inviteId), {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to cancel invite: ${response.statusText}`);
    }

    const data = await response.json();
    return { status: "OK", data };
  } catch (error) {
    return { status: "ERROR", error };
  }
}
