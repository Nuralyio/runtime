import { APIS_URL } from './constants';

/**
 * Fetch application by ID
 *
 * @param headers - The headers to include in the request
 * @param id - The ID of the application to fetch
 * @returns A promise that resolves to an object containing the status and data or error
 */
export async function fetchApplicationById(headers: Record<string, string>, id: string): Promise<{ status: string; data?: any; error?: any }> {
    try {
        const response = await fetch(APIS_URL.getApplication(id), {
            headers: {
                ...headers,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch application: ${response.statusText}`);
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

/**
 * Fetch permission for a specific application and resource
 *
 * @param id - The ID of the application
 * @param resourceId - The ID of the resource
 * @returns A promise that resolves to an object containing the status and data or error
 */
export async function fetchApplicationPermission(id: string, resourceId: string): Promise<{ status: string; data?: any; error?: any }> {
    try {
        const response = await fetch(APIS_URL.getApplicationPermission(id, resourceId));

        if (!response.ok) {
            throw new Error(`Failed to fetch permission: ${response.statusText}`);
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

/**
 * Fetch all applications
 *
 * @param headers - The headers to include in the request
 * @returns A promise that resolves to an object containing the status and data or error
 */
export async function fetchAllApplications(headers: Record<string, string>): Promise<{ status: string; data?: any; error?: any }> {
    try {
        const response = await fetch(APIS_URL.fetchAllApplications(), {
            headers: {
                ...headers,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch applications: ${response.statusText}`);
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
