import { $currentApplication } from "@shared/redux/store/apps";
import { type PageElement } from "./page.interface";
import { addPageToApplicationAction } from "@shared/redux/actions/application/addPageToApplicationAction";
import { updatePageAction } from "@shared/redux/actions/page/updatePageAction";
import { eventDispatcher } from "@shared/utils/change-detection";

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
      eventDispatcher.emit("Vars:currentPage")
      // todo: call the callback when updated
    });
};
