import { FRONT_API_URLS } from '../api-urls';

export const buildFunctionHandler = async (functionId: any) => {
  const response = await fetch(`${FRONT_API_URLS.FUNCTIONS}/build/${functionId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Build failed with status ${response.status}`);
  }

  return response;
};
