import { APIS_URL } from "./constants";

export async function loadPageComponent(headers: any, id: string) {
    try {
        const response = await fetch(APIS_URL.getPageComponents(id), {
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