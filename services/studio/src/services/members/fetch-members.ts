import { APIS_URL } from "../constants";

export interface MemberResponse {
  id: number;
  userId: string;
  applicationId: string;
  role: {
    id: number;
    name: string;
    displayName: string;
    hierarchy: number;
  };
  createdAt: string;
}

/**
 * Fetch all members of an application
 */
export async function fetchApplicationMembers(appId: string): Promise<{
  status: string;
  data?: MemberResponse[];
  error?: any;
}> {
  try {
    const response = await fetch(APIS_URL.getApplicationMembers(appId), {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch members: ${response.statusText}`);
    }

    const data = await response.json();
    return { status: "OK", data };
  } catch (error) {
    return { status: "ERROR", error };
  }
}
