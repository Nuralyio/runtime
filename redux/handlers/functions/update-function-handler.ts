import { FRONT_API_URLS } from '../api-urls';

export const updateFunctionHandler = (functionElement:any) => {
  return fetch(`${FRONT_API_URLS.FUNCTIONS}/${functionElement.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      ...functionElement
    })
  })
};
