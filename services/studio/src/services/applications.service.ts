import { APIS_URL } from './constants'
import { extractXuserHeader } from './helpers';

/**
 * Load application by id
 * 
 * @param headers 
 * @param id 
 * @returns 
 */
export async function loadApplication(headers: any, id: string) {
    try {
        const response = await fetch(APIS_URL.getApplication(id), {
            headers: {
               ...headers,
            },
        });
        return {
            status: "OK",
            data: await response.json()
        }

    } catch (error) {
        return {
            status: "ERROR",
            error
        }
    }
}