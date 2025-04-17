import { FRONT_API_URLS } from "$store/handlers/api-urls";
import type { ComponentElement } from "../../component/interface";

export const updateFunctionHandler = (functionElement:any) => {
  return fetch(`${FRONT_API_URLS.FUNCTIONS}/${functionElement.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
  ...functionElement
    })
  })
};
