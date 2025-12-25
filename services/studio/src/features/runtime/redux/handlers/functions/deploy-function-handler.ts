import { FRONT_API_URLS } from '../api-urls';

export const deployFunctionHandler = async (functionId: any) => {
  const response = await fetch(`${FRONT_API_URLS.FUNCTIONS}/deploy/${functionId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Deploy failed with status ${response.status}`);
  }

  return response;
};
