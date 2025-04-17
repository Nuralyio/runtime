import { FRONT_API_URLS } from "$store/handlers/api-urls";
import type { ComponentElement } from "../../component/interface";

export const invokeFunctionHandler = (functionId:any, data) => {
  return fetch(`${FRONT_API_URLS.FUNCTIONS}/invoke/${functionId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      data
    })
  })
};
