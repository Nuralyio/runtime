import { FRONT_API_URLS } from '../api-urls';

export const loadFunctionsHandler = async () => {
  return await fetch(`${FRONT_API_URLS.FUNCTIONS}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
  }).then(res=>res.json())
};