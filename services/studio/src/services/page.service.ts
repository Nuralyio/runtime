import { APIS_URL } from "./constants";

/**
 * Fetch application pages by ID
 *
 * @param headers - The headers to include in the request
 * @param id - The ID of the application to fetch pages for
 * @returns A promise that resolves to an object containing the status and data or error
 */
export async function fetchApplicationPagesById(headers: Record<string, string>, id: string): Promise<{ status: string; data?: any; error?: any }> {
    try {
        const response = await fetch(APIS_URL.getApplicationPages(id), {
            headers: {
                ...headers,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch application pages: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            status: "OK",
            data,
        };
    } catch (error) {
        return {
            status: "ERROR",
            error,
        };
    }
}
