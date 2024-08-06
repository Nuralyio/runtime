import { FRONT_API_URLS } from "$store/api-urls"
import type { ComponentElement } from "../interface"

export const updateComponentHandler = (component: ComponentElement, application_id) => {
    fetch(`${FRONT_API_URLS.COMPONENTS}/${component.uuid}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            component: { ...component, application_id }
        })
    }).then(res => res.json())
        .catch((err) => {
            // TODO: dispatch error

            console.error(err)
        })
}
