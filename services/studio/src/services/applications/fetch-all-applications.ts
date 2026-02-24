import { APIS_URL } from "../constants";

/**
 * Fetch all applications
 *
 * @param headers - The headers to include in the request
 * @returns A promise that resolves to an object containing the status and data or error
 */
export async function fetchAllApplications(headers: Record<string, string>): Promise<{
  status: string;
  data?: any;
  error?: any
}> {
  try {
    const response = await fetch(APIS_URL.fetchAllApplications(), {
      headers: {
        ...headers
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch applications: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      status: "OK",
      data
    };
  } catch (error) {
    return {
      status: "ERROR",
      error
    };
  }
}
