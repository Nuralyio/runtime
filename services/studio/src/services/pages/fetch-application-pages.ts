import { APIS_URL } from "../constants";
import { ApplicationNotFound } from "../applications/exceptions/ApplicationNotFound";

/**
 * Fetch application pages by ID
 *
 * @param headers - The headers to include in the request
 * @param id - The ID of the application to fetch pages for
 * @returns A promise that resolves to an object containing the status and data or error
 */
export async function fetchApplicationPagesById(headers: Record<string, string>, id: string): Promise<{
  status: string;
  data?: any;
  error?: any
}> {
  const response = await fetch(APIS_URL.getApplicationPages(id), {
    headers: {
      ...headers
    }
  });
  
  if (!response.ok) {
    console.log(`Failed to fetch application pages: ${response.statusText}`);
    throw new ApplicationNotFound(`Failed to fetch application pages: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    status: "OK",
    data
  };
}
