import { $currentApplication } from '../../store/apps';
import { type PageElement } from "./page.interface";
import { addPageToApplicationAction } from '../../actions/application/addPageToApplicationAction';
import { updatePageAction } from '../../actions/page/updatePageAction';
import { eventDispatcher } from '../../../../runtime/utils/change-detection.ts';

export const addPageHandler = (page: PageElement, resolve?, reject ?) => {

  fetch(`/api/pages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ page: { ...page, application_id: $currentApplication.get().uuid } })
  }).then(res => res.json())
    .then(
      (page) => {
        if (resolve) {
          resolve(page);
        }
        addPageToApplicationAction(page, $currentApplication.get().uuid);
      }
    ).catch((error) => {
    if (reject) {
      reject(error);
    }
  });

};


// Track the last update time to prevent rapid-fire updates
let lastPageUpdateTime = 0;
const PAGE_UPDATE_DEBOUNCE_MS = 100;

export const updatePageHandler = (page: PageElement, callback?: (page: any) => void) => {
  fetch("/api/pages/" + page.uuid, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ page })
  }).then(res => res.json())
    .then((res) => {
      updatePageAction(res, $currentApplication.get().uuid);

      // Debounce the event emission to prevent rapid-fire updates
      const now = Date.now();
      if (now - lastPageUpdateTime > PAGE_UPDATE_DEBOUNCE_MS) {
        lastPageUpdateTime = now;
        eventDispatcher.emit("Vars:currentPage");
      }

      // Call the callback when updated
      if (callback) {
        callback(res);
      }
    });
};
