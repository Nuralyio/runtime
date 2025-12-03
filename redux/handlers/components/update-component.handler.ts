import { FRONT_API_URLS } from '../api-urls';
import { validateAndEmitErrors } from "./validation-handler";
import { eventDispatcher } from '../../../../runtime/utils/change-detection.ts';

export const updateComponentHandler = (component: any, application_id) => {
  // Validate handlers before saving
  const validationError = validateAndEmitErrors(component);
  if (validationError instanceof Promise) return validationError;

  const ucomponent = { ...component };
  delete ucomponent.parent
  delete ucomponent.children
  delete ucomponent.childrens
  fetch(`${FRONT_API_URLS.COMPONENTS}/${ucomponent.uuid}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      component: { ...ucomponent, application_id }
    })
  }).then(res => res.json())
    .catch((err) => {
      // Dispatch error
      eventDispatcher.emit("component:save-error", {
        componentId: component.uuid,
        error: err.message || "Failed to save component"
      });

      console.error(err);
    });
};
