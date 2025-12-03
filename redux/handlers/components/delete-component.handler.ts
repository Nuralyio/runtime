import { FRONT_API_URLS } from '../api-urls';

export const deleteComponentActionHandler = async (uuid: string): Promise<void> => {
  try {
    const response = await fetch(`${FRONT_API_URLS.COMPONENTS}/${uuid}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

  } catch (err) {
    // TODO: dispatch error
    console.error(err);
    throw err;
  }
};
