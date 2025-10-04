import type { PageElement } from "./page.interface";
import { refreshPagesActionHandler } from "./refresh-pages";

export const deletePageHandler = async (page: PageElement, callback?: (page: any) => void) => {
  try {
    const response = await fetch(`/api/pages/${page.uuid}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ page })
    });

    const res = await response.json();

    refreshPagesActionHandler(page.application_id);
    if (callback) {
      callback(res);
    }
  } catch (error) {
    console.error("Error deleting page:", error);
  }
};