import { APIS_URL } from "../constants";

/**
 * Fetch the current user's membership for an application.
 * Returns the user's role (owner, admin, editor, viewer) if they are a member.
 *
 * @param headers - The headers to include in the request (must include X-USER)
 * @param appId - The application ID
 * @returns A promise that resolves to the membership data or null if not a member
 */
export async function fetchMyMembership(headers: Record<string, string>, appId: string): Promise<{
  role?: string;
  roleName?: string;
} | null> {
  try {
    const response = await fetch(APIS_URL.getMyMembership(appId), {
      headers: {
        ...headers
      }
    });

    if (response.status === 404) {
      // User is not a member of this application
      return null;
    }

    if (!response.ok) {
      console.error(`Failed to fetch membership: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return {
      role: data.role?.name,
      roleName: data.role?.displayName
    };
  } catch (error) {
    console.error('Error fetching membership:', error);
    return null;
  }
}
