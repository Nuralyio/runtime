import { FRONT_API_URLS } from "$store/handlers/api-urls";
import type { ComponentElement } from "../../component/interface";

export const deployFunctionHandler = (functionId:any) => {
  return fetch(`${FRONT_API_URLS.FUNCTIONS}/deploy/${functionId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
  })
};
