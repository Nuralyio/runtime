import { FRONT_API_URLS } from "$store/api-urls"
import type { ComponentElement } from "../interface"
import type { AddComponentRequest } from "./interfaces/add-component.request"

export const addComponentHandler = ({ component }: AddComponentRequest, currentApplicatinId) => {
    fetch(FRONT_API_URLS.COMPONENTS, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ component: { ...component, application_id: currentApplicatinId } })
    }).then(res => res.json())
        .catch((err) => {
            // TODO: dispatch error
            console.error(err)
        })

}
