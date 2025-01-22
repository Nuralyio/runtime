import { FRONT_API_URLS } from "$store/handlers/api-urls";
import type { ComponentElement } from "../../component/interface";

export const buildFunctionHandler = (functionId:any) => {
  return fetch(`${FRONT_API_URLS.FUNCTIONS}/build/${functionId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
  })
};
