import { FRONT_API_URLS } from '../api-urls';
import type { AddComponentRequest } from "./interfaces/add-component.request";
import { eventDispatcher } from '../../../utils/change-detection.ts';
import { validateAndEmitErrors } from "./validation-handler";

export const addComponentHandler = ({ component }: AddComponentRequest, currentApplicatinId) => {
  // Validate handlers before saving
  const validationError = validateAndEmitErrors(component);
  if (validationError instanceof Promise) return validationError;

  delete component.parent;
  delete component.children ;
  delete component.children;
  fetch(FRONT_API_URLS.COMPONENTS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ component: { ...component, application_id: currentApplicatinId } })
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
