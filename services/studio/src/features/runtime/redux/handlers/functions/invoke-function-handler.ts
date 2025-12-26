import { FRONT_API_URLS } from '../api-urls';

export const invokeFunctionHandler = async (functionId: any, data: any) => {
  const response = await fetch(`${FRONT_API_URLS.FUNCTIONS}/invoke/${functionId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      data
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Invoke failed with status ${response.status}`);
  }

  return response;
};
