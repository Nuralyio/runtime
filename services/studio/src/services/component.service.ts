import { APIS_URL } from "./constants";

/**
 * Fetch page component by ID
 *
 * @param headers - The headers to include in the request
 * @param id - The ID of the page component to fetch
 * @returns A promise that resolves to an object containing the status and data or error
 */
export async function fetchPageComponentById(headers: Record<string, string>, id: string): Promise<{
  status: string;
  data?: any;
  error?: any
}> {
  try {
    const response = await fetch(APIS_URL.getPageComponents(id), {
      headers: {
        ...headers
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page component: ${response.statusText}`);
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

/**
 * Fetch application component by ID
 *
 * @param headers - The headers to include in the request
 * @param id - The ID of the application component to fetch
 * @returns A promise that resolves to an object containing the status and data or error
 */
export async function fetchApplicationComponentById(headers: Record<string, string>, id: string): Promise<{
  status: string;
  data?: any;
  error?: any
}> {
  try {
    const response = await fetch(APIS_URL.getApplicationComponents(id), {
      headers: {
        ...headers
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch application component: ${response.statusText}`);
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
