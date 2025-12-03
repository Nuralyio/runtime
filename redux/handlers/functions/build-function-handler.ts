import { FRONT_API_URLS } from '../api-urls';

export const buildFunctionHandler = (functionId:any) => {
  return fetch(`${FRONT_API_URLS.FUNCTIONS}/build/${functionId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
  })
};
