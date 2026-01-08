import { FRONT_API_URLS } from '../api-urls';
import { validateAndEmitErrors } from "./validation-handler";
import { eventDispatcher } from '../../../../runtime/utils/change-detection.ts';
import { showError } from '../../../../runtime/utils/toast';

export const updateComponentHandler = (component: any, application_id) => {
  // Validate handlers before saving
  const validationError = validateAndEmitErrors(component);
  if (validationError instanceof Promise) return validationError;

  const ucomponent = { ...component };
  delete ucomponent.parent
  delete ucomponent.children
  delete ucomponent.children
  fetch(`${FRONT_API_URLS.COMPONENTS}/${ucomponent.uuid}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      component: { ...ucomponent, application_id }
    })
  }).then(async (res) => {
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errorMessage = data.error || `Failed to save component (${res.status})`;

        // Show toast for permission errors
        if (res.status === 403) {
          showError(errorMessage);
        } else {
          showError(errorMessage);
        }

        // Dispatch error event
        eventDispatcher.emit("component:save-error", {
          componentId: component.uuid,
          error: errorMessage
        });
        return;
      }
      return res.json();
    })
    .catch((err) => {
      // Dispatch error
      const errorMessage = err.message || "Failed to save component";
      showError(errorMessage);

      eventDispatcher.emit("component:save-error", {
        componentId: component.uuid,
        error: errorMessage
      });

      console.error(err);
    });
};
