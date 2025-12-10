import { FRONT_API_URLS } from '../api-urls';

export const deployFunctionHandler = (functionId:any) => {
  return fetch(`${FRONT_API_URLS.FUNCTIONS}/deploy/${functionId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
  })
};
