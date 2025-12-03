import { $components } from '../../store/component/store';
import { FRONT_API_URLS } from "../api-urls";


export const refreshComponentActionHandler = async (uuid: string): Promise<void> => {

    try {
        const response = await fetch(`${FRONT_API_URLS.REFRESH_COMPONENTS}/${uuid}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const components = await response.json();
        $components.set(
            { ...$components.get(), [uuid]: components }
        )
    } catch (err) {
        console.error(err);
        throw err;
    }
};