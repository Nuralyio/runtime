import { $pages, refreshPageStoreVar } from '../../store/page';
import { FRONT_API_URLS } from "../api-urls";


export const refreshPagesActionHandler = async (uuid: string): Promise<void> => {

    try {
        const response = await fetch(`${FRONT_API_URLS.REFRESH_PAGES}/${uuid}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const pages = await response.json();
        $pages.set(
            { ...$pages.get(), [uuid]: pages }
        );
        refreshPageStoreVar()
    } catch (err) {
        console.error(err);
        throw err;
    }
};